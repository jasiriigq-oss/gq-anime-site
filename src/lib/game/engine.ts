import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getPayloadLocal } from '@/lib/payload'
import { generateJoinCode } from '@/lib/utils'
import type { Quiz, Media } from '@/payload-types'
import type {
  GameRole,
  QuizSnapshot,
  QuestionSnapshot,
  AnswerSnapshot,
} from '@/lib/game/types'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string }

type MediaLike = Media | number | string | null | undefined

function mediaUrlOf(m: MediaLike): string | null {
  if (!m) return null
  if (typeof m === 'string') return m
  if (typeof m === 'number') return null
  return m.url ?? null
}

function buildSnapshot(quiz: Quiz): { snapshot: QuizSnapshot; answerKey: number[] } {
  const answerKey: number[] = []
  const questions: QuestionSnapshot[] = (quiz.questions ?? []).map((q, qi) => {
    const answers: AnswerSnapshot[] = (q.answers ?? []).map((a) => ({
      text: a.text,
      image: mediaUrlOf(a.image as MediaLike),
    }))
    const correctIndex = Math.max(
      0,
      answers.findIndex((_, i) => q.answers?.[i]?.isCorrect),
    )
    answerKey[qi] = correctIndex
    return {
      id: `${qi}`,
      questionText: q.questionText,
      questionType: (q.questionType ?? 'text') as QuestionSnapshot['questionType'],
      timeLimitSeconds: q.timeLimitSeconds ?? 15,
      points: q.points ?? 10,
      image: mediaUrlOf(q.image as MediaLike),
      video: mediaUrlOf(q.video as MediaLike),
      audio: mediaUrlOf(q.audio as MediaLike),
      answers,
    }
  })

  const snapshot: QuizSnapshot = {
    title: quiz.name,
    cover: mediaUrlOf(quiz.cover as MediaLike),
    settings: {
      multiplayerEnabled: quiz.settings?.multiplayerEnabled ?? true,
      soloPlayEnabled: quiz.settings?.soloPlayEnabled ?? true,
      challengeMode: quiz.settings?.challengeMode ?? false,
    },
    questions,
  }

  return { snapshot, answerKey }
}

async function generateUniqueCode(): Promise<string> {
  const admin = supabaseAdmin()
  for (let i = 0; i < 10; i++) {
    const code = generateJoinCode(6)
    const { data } = await admin.from('game_room').select('id').eq('code', code).maybeSingle()
    if (!data) return code
  }
  return generateJoinCode(6)
}

// ---------------------------------------------------------------------------
// createRoom — host starts a lobby. Returns the join code + room id.
// ---------------------------------------------------------------------------
export async function createRoom(
  quizId: number,
  host: { userId?: number | null; name: string },
): Promise<ActionResult<{ code: string; roomId: string }>> {
  const payload = await getPayloadLocal()
  const quiz = await payload.findByID({ collection: 'quizzes', id: quizId, depth: 2 })

  const { snapshot, answerKey } = buildSnapshot(quiz)
  const code = await generateUniqueCode()
  const admin = supabaseAdmin()

  const { data: room, error } = await admin
    .from('game_room')
    .insert({
      code,
      quiz_id: String(quiz.id),
      quiz_title: quiz.name,
      quiz_data: snapshot,
      state: 'lobby',
      round: 0,
      round_state: 'idle',
      total_rounds: snapshot.questions.length,
      host_name: host.name,
    })
    .select()
    .single()

  if (error || !room) return { ok: false, error: error?.message ?? 'Failed to create room' }

  // Answer key (service-role only table).
  await admin.from('game_answer_key').insert(
    answerKey.map((correct_index, round) => ({ room_id: room.id, round, correct_index })),
  )

  // The host is also a player row (role=admin) so they show in the room.
  await admin.from('game_player').insert({
    room_id: room.id,
    name: host.name,
    role: 'admin',
    ready: true,
  })

  await admin.from('game_event').insert({
    room_id: room.id,
    kind: 'system',
    message: `${host.name} created the lobby. Share the code ${code}!`,
  })

  // Persistent Payload record (best-effort; the game itself is Supabase-owned).
  try {
    await payload.create({
      collection: 'game-session',
      data: {
        name: quiz.name,
        quiz: quiz.id,
        state: 'setup',
        roomCode: code,
        owners: host.userId ? [{ user: host.userId }] : [],
      },
    })
  } catch {
    /* non-fatal */
  }

  return { ok: true, data: { code, roomId: room.id } }
}

// ---------------------------------------------------------------------------
export async function joinRoom(
  code: string,
  input: { name: string; avatar: string; role?: GameRole },
): Promise<ActionResult<{ playerId: string; roomId: string }>> {
  const admin = supabaseAdmin()
  const clean = code.trim().toUpperCase()
  const { data: room } = await admin.from('game_room').select('id, state').eq('code', clean).maybeSingle()

  if (!room) return { ok: false, error: 'Game not found. Check the code and try again.' }

  const role: GameRole = input.role ?? 'player'
  if (role === 'admin') return { ok: false, error: 'Use the host link to join as admin.' }
  if (room.state === 'ended') return { ok: false, error: 'This game has already ended.' }

  const { data: player, error } = await admin
    .from('game_player')
    .insert({
      room_id: room.id,
      name: input.name,
      avatar: input.avatar,
      role,
      ready: role === 'spectator',
    })
    .select()
    .single()

  if (error || !player) return { ok: false, error: error?.message ?? 'Failed to join' }

  await admin.from('game_event').insert({
    room_id: room.id,
    kind: 'system',
    message: `${input.name} joined as ${role}.`,
  })

  return { ok: true, data: { playerId: player.id, roomId: room.id } }
}

// ---------------------------------------------------------------------------
export async function setReady(playerId: string, ready: boolean): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { error } = await admin.from('game_player').update({ ready }).eq('id', playerId)
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function startGame(roomId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: room } = await admin.from('game_room').select('quiz_data').eq('id', roomId).single()
  if (!room) return { ok: false, error: 'Room not found' }

  const quiz = room.quiz_data as QuizSnapshot
  const first = quiz.questions[0]
  const timeLimit = first?.timeLimitSeconds ?? 15
  const now = Date.now()
  const deadline = new Date(now + timeLimit * 1000).toISOString()

  const { error } = await admin
    .from('game_room')
    .update({
      state: 'in-progress',
      round: 0,
      round_state: 'question',
      round_started_at: new Date(now).toISOString(),
      round_deadline: deadline,
      paused: false,
      revealed_correct_index: null,
    })
    .eq('id', roomId)

  if (error) return { ok: false, error: error.message }

  await admin.from('game_player').update({ answer_index: null, answered_at: null, last_correct: null }).eq('room_id', roomId)
  await logEvent(roomId, 'system', 'Game started!')

  // Update the Payload session state.
  await syncSessionState(roomId, 'in-progress')

  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function submitAnswer(
  playerId: string,
  answerIndex: number,
): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: player } = await admin
    .from('game_player')
    .select('room_id, eliminated, role, answer_index')
    .eq('id', playerId)
    .maybeSingle()

  if (!player) return { ok: false, error: 'Player not found' }
  if (player.role !== 'player') return { ok: false, error: 'Spectators cannot answer' }
  if (player.eliminated) return { ok: false, error: 'You are eliminated' }
  if (player.answer_index != null) return { ok: false, error: 'Already answered' }

  const { data: room } = await admin
    .from('game_room')
    .select('round_state')
    .eq('id', player.room_id)
    .single()
  if (room?.round_state !== 'question') return { ok: false, error: 'No open question' }

  const { error } = await admin
    .from('game_player')
    .update({ answer_index: answerIndex, answered_at: new Date().toISOString() })
    .eq('id', playerId)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function revealRound(roomId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: room } = await admin
    .from('game_room')
    .select('id, round, round_state, quiz_data')
    .eq('id', roomId)
    .single()

  if (!room) return { ok: false, error: 'Room not found' }
  if (room.round_state !== 'question') return { ok: true, data: undefined } // idempotent

  const quiz = room.quiz_data as QuizSnapshot
  const q = quiz.questions[room.round]
  if (!q) return { ok: false, error: 'No question for this round' }

  const { data: key } = await admin
    .from('game_answer_key')
    .select('correct_index')
    .eq('room_id', roomId)
    .eq('round', room.round)
    .maybeSingle()
  const correctIndex = key?.correct_index ?? 0

  // Score all non-eliminated players.
  const { data: players } = await admin
    .from('game_player')
    .select('*')
    .eq('room_id', roomId)
    .eq('role', 'player')

  const challengeMode = quiz.settings.challengeMode
  for (const p of players ?? []) {
    if (p.eliminated) continue
    const correct = p.answer_index === correctIndex
    const patch: Record<string, unknown> = {
      last_correct: correct,
      streak: correct ? (p.streak ?? 0) + 1 : 0,
    }
    if (correct) patch.score = (p.score ?? 0) + q.points
    if (!correct && challengeMode) patch.eliminated = true

    await admin.from('game_player').update(patch).eq('id', p.id)
    await logEvent(
      roomId,
      'player',
      `${p.name} ${correct ? `answered correctly (+${q.points})` : 'answered incorrectly'}${!correct && challengeMode ? ' and was eliminated' : ''}`,
    )
  }

  await admin
    .from('game_room')
    .update({ round_state: 'reveal', revealed_correct_index: correctIndex, round_deadline: null })
    .eq('id', roomId)

  await logEvent(roomId, 'system', `Correct answer: ${['A', 'B', 'C', 'D', 'E', 'F'][correctIndex] ?? '?'}`)

  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function nextRound(roomId: string): Promise<ActionResult<{ ended: boolean }>> {
  const admin = supabaseAdmin()
  const { data: room } = await admin.from('game_room').select('round, total_rounds, quiz_data').eq('id', roomId).single()
  if (!room) return { ok: false, error: 'Room not found' }

  const next = room.round + 1
  if (next >= room.total_rounds) {
    await endGame(roomId)
    return { ok: true, data: { ended: true } }
  }

  const quiz = room.quiz_data as QuizSnapshot
  const q = quiz.questions[next]
  const timeLimit = q?.timeLimitSeconds ?? 15
  const now = Date.now()

  await admin
    .from('game_room')
    .update({
      round: next,
      round_state: 'question',
      round_started_at: new Date(now).toISOString(),
      round_deadline: new Date(now + timeLimit * 1000).toISOString(),
      paused: false,
      revealed_correct_index: null,
    })
    .eq('id', roomId)

  await admin.from('game_player').update({ answer_index: null, answered_at: null, last_correct: null }).eq('room_id', roomId)
  await logEvent(roomId, 'system', `Round ${next + 1} of ${room.total_rounds}`)

  return { ok: true, data: { ended: false } }
}

// ---------------------------------------------------------------------------
export async function endGame(roomId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  await admin
    .from('game_room')
    .update({ state: 'ended', round_state: 'leaderboard', round_deadline: null, paused: false })
    .eq('id', roomId)

  await logEvent(roomId, 'system', 'Game over!')
  await syncSessionState(roomId, 'ended')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function pauseTimer(roomId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: room } = await admin.from('game_room').select('round_deadline').eq('id', roomId).single()
  if (!room || !room.round_deadline) return { ok: true, data: undefined }

  // Convert the remaining duration into a paused state by freezing the deadline.
  await admin.from('game_room').update({ paused: true }).eq('id', roomId)
  await logEvent(roomId, 'admin', 'Timer paused')
  return { ok: true, data: undefined }
}

export async function resumeTimer(roomId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: room } = await admin.from('game_room').select('round_deadline').eq('id', roomId).single()
  if (!room) return { ok: true, data: undefined }

  // Resume with a full fresh window equal to the current question's limit.
  const { data: r } = await admin.from('game_room').select('round, quiz_data').eq('id', roomId).single()
  const quiz = r?.quiz_data as QuizSnapshot | undefined
  const q = quiz?.questions[r?.round ?? 0]
  const timeLimit = q?.timeLimitSeconds ?? 15
  const now = Date.now()
  await admin
    .from('game_room')
    .update({
      paused: false,
      round_started_at: new Date(now).toISOString(),
      round_deadline: new Date(now + timeLimit * 1000).toISOString(),
    })
    .eq('id', roomId)
  await logEvent(roomId, 'admin', 'Timer resumed')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function removePlayer(playerId: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { data: p } = await admin.from('game_player').select('room_id, name').eq('id', playerId).maybeSingle()
  await admin.from('game_player').delete().eq('id', playerId)
  if (p) await logEvent(p.room_id, 'admin', `${p.name} was removed from the game`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
export async function sendAnnouncement(roomId: string, message: string): Promise<ActionResult> {
  const admin = supabaseAdmin()
  await admin.from('game_event').insert({ room_id: roomId, kind: 'admin', message: `📢 ${message}` })
  return { ok: true, data: undefined }
}

export async function sendChat(
  roomId: string,
  input: { playerName: string; role: GameRole; message: string },
): Promise<ActionResult> {
  const admin = supabaseAdmin()
  const { error } = await admin.from('game_chat').insert({
    room_id: roomId,
    player_name: input.playerName,
    role: input.role,
    message: input.message,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
async function logEvent(roomId: string, kind: 'system' | 'admin' | 'player', message: string) {
  const admin = supabaseAdmin()
  await admin.from('game_event').insert({ room_id: roomId, kind, message })
}

async function syncSessionState(roomId: string, state: 'setup' | 'in-progress' | 'ended') {
  try {
    const payload = await getPayloadLocal()
    const admin = supabaseAdmin()
    const { data: room } = await admin.from('game_room').select('code').eq('id', roomId).single()
    if (!room?.code) return
    const { docs } = await payload.find({
      collection: 'game-session',
      where: { roomCode: { equals: room.code } },
      limit: 1,
    })
    if (docs[0]) {
      await payload.update({
        collection: 'game-session',
        id: docs[0].id,
        data: {
          state,
          ...(state === 'in-progress' ? { startTime: new Date().toISOString() } : {}),
          ...(state === 'ended' ? { endTime: new Date().toISOString() } : {}),
        },
      })
    }
  } catch {
    /* non-fatal */
  }
}
