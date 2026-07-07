import { Schema, MapSchema, type, ArraySchema } from '@colyseus/schema'
export class Player extends Schema {
  @type('number') sessionId: number = -1
  @type('string') clientId: string = ''
  @type('string') name: string = '(unset)'
  @type('string') role: string = '(unset)'
  @type(['number']) answers: number[] = []
  @type('number') index: number = -1
  @type('number') score: number = 0
  @type('string') picture: string = 'unset'
  @type('string') mode: 'admin' | 'spectator' | 'player' = 'spectator'
  @type('boolean') eliminated: boolean = false
  @type('boolean') ready: boolean = false
}

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>()
  @type('boolean') started: boolean = false
  @type('number') round: number = 0
  @type('boolean') roundStarted: boolean = false
  @type('boolean') roundEnded: boolean = false

  @type('number') roundStartTime: number = -1
  @type('number') roundSecondsLeft: number = -1
}
