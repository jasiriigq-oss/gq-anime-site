import { Room, Client, CloseCode } from 'colyseus'
import { GameRoomState, Player } from './schema/GameRoomState.js'
import { supabase } from '../../../src/supabase.js'
import { RealtimeChannel } from '@supabase/supabase-js'
import {
  type GameSessionPlayer,
  type GameSession,
  type Quiz,
  type Question,
} from '@webserver/payload-types.js'
export class GameRoom extends Room {
  maxClients = 6
  state = new GameRoomState()
  realtime?: RealtimeChannel
  gameSession: GameSession
  gameQuiz: Quiz
  questions: Question[]

  endRound(time: number) {
    this.broadcast('round-end', { time })
    this.state.roundEnded = true
  }
  gameRound(time: number) {
    this.broadcast('game-end', { time })
  }

  messages = {
    setPlayerReady: (client: Client, message: { picture: string; name: string }) => {
      const player = this.state.players.get(client.sessionId)
      player.ready = true
      player.picture = message.picture
      player.name = message.name

      supabase.from('game_session_player').update({
        name: message.name,
        picture: message.picture,
        ready: true,
      })

      // console.log(client.sessionId, 'sent a message:', message)
    },
    startGame: (client: Client, message: {}) => {
      const player = this.state.players.get(client.id)
      if (player.role == 'admin') {
        this.state.started = true
        supabase
          .from('game_session')
          .update({
            state: 'in-progress',
            startTime: new Date().toISOString(),
          })
          .eq('id', this.gameSession.id)
      }
    },
    startRound: (client: Client, message: {}) => {
      const player = this.state.players.get(client.id)
      if (player.role != 'admin') return

      this.state.roundStartTime = Date.now()

      if (this.state.round != 0) {
        this.state.round++
      }

      this.state.roundStarted = true
      this.state.roundSecondsLeft = this.questions[this.state.round].timeLimit

      const interval = this.clock.setInterval(() => {
        this.state.roundSecondsLeft--
        if (this.state.roundSecondsLeft <= 0) {
          this.endRound(Date.now())
          interval.clear()
        }
      }, 1000) // tis in ms

      supabase
        .from('game_session')
        .update({
          round: this.state.round,
        })
        .eq('id', this.gameSession.id)
    },
    submitAnswer: (client: Client, message: { answerIndex: number }) => {
      const player = this.state.players.get(client.sessionId)
      if (!player) return
      if (player.answers.length >= this.state.round + 1) return

      player.answers.push(message.answerIndex)

      supabase
        .from('game_session_player')
        .update({
          answers: JSON.stringify(player.answers),
        })
        .eq('id,', player.sessionId)
    },
  }

  onCreate(options?: { session: GameSession }) {
    console.log({ options })
    this.gameSession = options.session
    this.gameQuiz = options.session.quiz as Quiz
    this.questions = this.gameQuiz.questions.map((q) => q.question) as Question[]

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
  }

  onJoin(client: Client, options: any) {
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
    if (mode == 'player' && player && !existingPlayer) {
      newPlayer.sessionId = player.id
      newPlayer.name = player.name
      newPlayer.index = player.index
    }

    newPlayer.clientId = client.id
    newPlayer.mode = mode

    this.state.players.set(client.sessionId, newPlayer)
    /**
     * Called when a client joins the room.
     */
    console.log(client.sessionId, 'joined!')
  }

  onLeave(client: Client, code: CloseCode) {
    /**
     * Called when a client leaves the room.
     */
    this.state.players.delete(client.sessionId)
    console.log(client.sessionId, 'left!', code)
  }

  onDispose() {
    /**
     * Called when the room is disposed.
     */
    this.realtime.unsubscribe()
    console.log('room', this.roomId, 'disposing...')
  }
}
