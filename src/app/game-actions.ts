'use server'

import { StandardSiteResponse } from '@/m0ves/lib/StandardSiteResponse'
import {
  getUserGameSessions,
  submitAnswer,
  createGameSession,
  getAvailableQuizzes,
  getSessionById,
  getSessionPlayers,
  getSessionAndPlayers,
  addPlayerToSession,
} from './game-operations'
import { GameSession, GameSessionPlayer, Quiz } from '@/payload-types'

export interface CreateGameSessionActionState {
  result: StandardSiteResponse<GameSession>
}
export async function createGameSessionAction(
  initialState: any,
  formdata: FormData,
): Promise<CreateGameSessionActionState> {
  const name = formdata.get('name')?.toString() || 'unnamed'
  const quizId = parseInt(formdata.get('quizId')?.toString() || '-1')
  const playerCount = parseInt(formdata.get('playerCount')?.toString() || '-1')

  const result = await createGameSession(
    {
      name,
      playerCount,
    },
    quizId,
  )

  console.log({ result })
  return {
    result,
  }
}

export interface SubmitAnswerActionState {
  result: StandardSiteResponse<{}>
}
export async function submitAnswerAction(
  initialState: any,
  formdata: FormData,
): Promise<SubmitAnswerActionState> {
  const playerId = parseInt(formdata.get('playerId')?.toString() ?? '-1')
  const sessionId = parseInt(formdata.get('sessionId')?.toString() ?? '-1')
  const answerIndex = parseInt(formdata.get('answerIndex')?.toString() ?? '-1')
  const result = await submitAnswer(playerId, sessionId, answerIndex)
  return {
    result,
  }
}

export interface GetUserGameSessionsActionState {
  result: StandardSiteResponse<GameSession[]>
}
export async function getUserGameSessionsAction(
  initialState: any,
  formdata: FormData,
): Promise<GetUserGameSessionsActionState> {
  const result = await getUserGameSessions()

  return {
    result,
  }
}

export interface GetAvailableQuizzesActionState {
  result: StandardSiteResponse<Quiz[]>
}
export async function getAvailableQuizzesAction(
  initialState: any,
  formdata: FormData,
): Promise<GetAvailableQuizzesActionState> {
  const result = await getAvailableQuizzes()
  return {
    result,
  }
}

export interface GetSessionByIdActionState {
  result: StandardSiteResponse<GameSession>
}
export async function getSessionByIdAction(
  initialState: any,
  formdata: FormData,
): Promise<GetSessionByIdActionState> {
  const id = parseInt(formdata.get('sessionId')?.toString() ?? '-1')
  const result = await getSessionById(id)
  return {
    result,
  }
}

export interface GetSessionPlayersActionState {
  result: StandardSiteResponse<GameSessionPlayer[]>
}
export async function getSessionPlayersAction(
  initialState: { sessionId: number },
  formdata: FormData,
): Promise<GetSessionPlayersActionState> {
  const result = await getSessionPlayers(initialState.sessionId)
  return { result }
}

export interface GetSessionAndPlayersActionState {
  result: StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>
}
export async function getSessionAndPlayersAction(
  initialState: { sessionId: number },
  formdata: FormData,
): Promise<GetSessionAndPlayersActionState> {
  const result = await getSessionAndPlayers(initialState.sessionId)
  return { result }
}

export interface AddPlayerToSessionActionState {
  result?: StandardSiteResponse<GameSession>
  sessionId: number
  playerInfo: { id: number; picture: string; name: string }
}

export async function AddPlayerToSessionAction(
  initialState: AddPlayerToSessionActionState,
  formdata: FormData,
): Promise<AddPlayerToSessionActionState> {
  const result = await addPlayerToSession(initialState.sessionId, initialState.playerInfo)

  const name = formdata.get('name')?.toString() ?? ''
  const image = formdata.get('image')?.toString() ?? ''

  return {
    result,
    sessionId: initialState.sessionId,
    playerInfo: { ...initialState.playerInfo, name, picture: image },
  }
}
