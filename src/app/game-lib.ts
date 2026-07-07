import { Media } from '@/payload-types'

export function createPlayerLink(sessionId: number, playerId: number) {
  const params = new URLSearchParams({
    mode: 'player',
    playerId: `${playerId}`,
  })
  return `${window.location.origin}/play/${sessionId}?${params.toString()}`
}

export function createAdminLink(sessionId: number, playerId: number) {
  const params = new URLSearchParams({
    mode: 'admin',
  })
  return `${window.location.origin}/play/${sessionId}?${params.toString()}`
}

export function createSpectatorLink(sessionId: number) {
  const params = new URLSearchParams({
    mode: 'spectator',
  })
  return `${window.location.origin}/play/${sessionId}?${params.toString()}`
}

const AnswerLetters = ['A', 'B', 'C', 'D', 'E']
export function getAnswerText(answerIndex: number) {
  return AnswerLetters[answerIndex]
}

export interface QuestionAnswerOption {
  text: string
  image: Media
  video: Media
}

const PlayerColors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Purple', hex: '#FF00FF' },
]
export function getPlayerColorFromIndex(index: number) {
  return PlayerColors[index]
}

export const INFO_MESSAGE = 'info'
export const GAME_SESSION_MESSAGE = 'game-session'
export const PLAYER_SESSION_MESSAGE = 'players'

export interface DbChange<T> {
  commit_time_stamp: string
  errors: string | null
  new: T
  old: { id: number }
  schema: string
  table: string
}

export interface GameServerMessage<T> {
  type: string
  data: T
}

export const playerIconOptions: {
  image: string
}[] = [
  {
    image: 'https://picsum.photos/id/1/100/100',
  },
  {
    image: 'https://picsum.photos/id/2/100/100',
  },
  {
    image: 'https://picsum.photos/id/3/100/100',
  },
  {
    image: 'https://picsum.photos/id/4/100/100',
  },
]
