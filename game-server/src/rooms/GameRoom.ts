import { Room, type Client, CloseCode } from 'colyseus'
import { GameRoomState, Player } from './schema/GameRoomState'
import { type RealtimeChannel } from '@supabase/supabase-js'
import {
  type GameSessionPlayer,
  type GameSession,
  type Quiz,
  type Question,
} from '@webserver/payload-types'
import { supabase } from '../supabase'
import { round } from 'lodash'
export class GameRoom extends Room {
  override maxClients = 6
  override state = new GameRoomState()
  realtime?: RealtimeChannel
  gameSession!: GameSession
  gameQuiz!: Quiz
  questions!: Question[]

  endRound(time: number) {
    this.broadcast('round-end', { time })
    this.state.roundEnded = true
    Array.from(this.state.players.values()).forEach((p) => {
      const playerAnswer = p.answers[this.state.round]
      const hasCorrectAnswer =
        this.questions[this.state.round]?.answers?.[playerAnswer ?? -1]?.isCorrect
      if (hasCorrectAnswer === false) {
        p.eliminated = true
      } else {
        p.score++
      }
    })
  }
  gameRound(time: number) {
    this.broadcast('game-end', { time })
  }

  override messages = {
    setPlayerReady: (client: Client, message: { picture: string; name: string }) => {
      const player = this.state.players.get(client.sessionId) as Player
      player.ready = true
      player.picture = message.picture
      player.name = message.name
      // supabase
      //   ?.from('game_session_player')
      //   .update({
      //     name: message.name,
      //     picture: message.picture,
      //     ready: true,
      //   })
      //   .eq('id', player.sessionId)

      console.log(client.sessionId, 'sent a message:', message)
    },
    startGame: (client: Client, message: {}) => {
      const player = this.state.players.get(client.sessionId) as Player
      if (player.role == 'admin') {
        this.state.started = true
        // supabase
        //   ?.from('game_session')
        //   .update({
        //     state: 'in-progress',
        //     start_time: new Date().toISOString(),
        //   })
        //   .eq('id', this.gameSession.id)
      }
    },
    startRound: (client: Client, message: {}) => {
      const player = this.state.players.get(client.id) as Player
      if (player.role != 'admin') return

      this.state.roundStartTime = Date.now()
      console.log(client.sessionId, 'sent a message:', message)

      if (this.state.round != 0) {
        this.state.round++
      }

      this.state.roundStarted = true
      this.state.roundSecondsLeft = this.questions[this.state.round]?.timeLimit ?? 0

      const interval = this.clock.setInterval(() => {
        const allAnswersSubmited = Array.from(this.state.players.values()).every(
          (p) => p.answers.length == this.state.round + 1,
        )
        this.state.roundSecondsLeft--
        if (this.state.roundSecondsLeft <= 0 || allAnswersSubmited) {
          this.endRound(Date.now())
          interval.clear()
        }
      }, 1000) // tis in ms

      // supabase
      //   ?.from('game_session')
      //   .update({
      //     round: this.state.round,
      //   })
      //   .eq('id', this.gameSession.id)
    },
    submitAnswer: (client: Client, message: { answerIndex: number }) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return
      if (player.answers.length >= this.state.round + 1) return

      player.answers.push(message.answerIndex)
      console.log(client.sessionId, 'sent a message:', message)

      // supabase
      //   ?.from('game_session_player')
      //   .update({
      //     answers: JSON.stringify(player.answers),
      //   })
      //   .eq('id', player.sessionId)
    },
  }

  override onCreate({ session }: { session: GameSession }) {
    this.gameSession = session
    this.gameQuiz = session.quiz as Quiz
    this.questions = this.gameQuiz?.questions?.map((q) => q.question) as Question[]
    //#region Realtime Logic
    /**
     * Called when a new room is created.
     */
    // const { session } = options
    // // @ts-ignore
    // this.realtime = supabase
    //   .channel(`${session.id}`)
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'UPDATE',
    //       schema: 'public',
    //       table: 'game_session',
    //       filter: `id=eq.${session.id}`,
    //     },
    //     (gameSessionPayload) => {
    //       console.log('new  gameSession Data')
    //     },
    //   )
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'game_session_player',
    //       filter: `session_id=eq.${session.id}`,
    //     },
    //     (playerSessionPayload) => {
    //       console.log('new Player Data')
    //     },
    //   )
    //   .subscribe((status, error) => {
    //     if (error) console.error(error)
    //   })
    //#endregion
  }

  override onJoin(client: Client, options: any) {
    const { session, player, mode } = options as {
      session: GameSession
      player: GameSessionPlayer
      mode: 'admin' | 'spectator' | 'player'
    }

    const existingPlayer = this.state.players.get(client.sessionId)
    const newPlayer = existingPlayer ?? new Player()

    newPlayer.role = mode

    if (mode == 'admin' || mode == 'spectator') {
      newPlayer.name = mode
      newPlayer.sessionId = -1
    }

    if (mode == 'spectator') newPlayer.sessionId = -2

    if (mode == 'player') {
      newPlayer.sessionId = player?.id
      newPlayer.name = player.name
      newPlayer.index = player.index
    }

    newPlayer.clientId = client.sessionId
    newPlayer.mode = mode

    this.state.players.set(client.sessionId, newPlayer)
    /**
     * Called when a client joins the room.
     */
    console.log(client.sessionId, 'joined!')
  }

  override onLeave(client: Client, code: CloseCode) {
    /**
     * Called when a client leaves the room.
     */
    this.state.players.delete(client.sessionId)
    console.log(client.sessionId, 'left!', code)
  }

  override onDispose() {
    /**
     * Called when the room is disposed.
     */
    this.realtime?.unsubscribe()
    console.log('room', this.roomId, 'disposing...')
  }
}
