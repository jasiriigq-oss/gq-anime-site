// Shared types for the live game (mirrors supabase/schema.sql).

export type GameRole = 'admin' | 'player' | 'spectator'
export type GameRoomState = 'lobby' | 'in-progress' | 'ended'
export type GameRoundState = 'idle' | 'question' | 'reveal' | 'leaderboard'

/** How a player's answer resolved — drives feedback animation + sound. */
export type FeedbackKind = 'correct' | 'incorrect' | 'timeout'

/** Admin-configurable feedback sounds (resolved to URLs). */
export type GameSounds = {
  enabled: boolean
  volume: number
  correct: string | null
  incorrect: string | null
  timeout: string | null
}

export type QuestionMedia = {
  image?: string | null
  video?: string | null
  audio?: string | null
}

export type AnswerSnapshot = {
  text: string
  image?: string | null
}

export type QuestionSnapshot = QuestionMedia & {
  id: string
  questionText: string
  questionType: 'text' | 'image' | 'video' | 'audio'
  timeLimitSeconds: number
  points: number
  answers: AnswerSnapshot[]
}

// The shape stored in game_room.quiz_data (no correct answers).
export type QuizSnapshot = {
  title: string
  cover?: string | null
  settings: {
    multiplayerEnabled: boolean
    soloPlayEnabled: boolean
    challengeMode: boolean
  }
  questions: QuestionSnapshot[]
}

export type GameRoom = {
  id: string
  code: string
  quiz_id: string | null
  quiz_title: string | null
  quiz_data: QuizSnapshot
  state: GameRoomState
  round: number
  round_state: GameRoundState
  round_started_at: string | null
  round_deadline: string | null
  paused: boolean
  revealed_correct_index: number | null
  total_rounds: number
  host_name: string | null
  created_at: string
  updated_at: string
}

export type GamePlayer = {
  id: string
  room_id: string
  name: string
  avatar: string | null
  role: GameRole
  score: number
  streak: number
  eliminated: boolean
  ready: boolean
  answer_index: number | null
  answered_at: string | null
  last_correct: boolean | null
  created_at: string
}

export type GameChatMessage = {
  id: string
  room_id: string
  player_name: string | null
  role: GameRole | null
  message: string
  created_at: string
}

export type GameEvent = {
  id: string
  room_id: string
  kind: 'system' | 'admin' | 'player'
  message: string
  created_at: string
}
