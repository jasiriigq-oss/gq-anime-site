import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { GameSession, GameSessionPlayer, Quiz, User } from '@/payload-types'
import { StandardSiteResponse } from '@/m0ves/lib/StandardSiteResponse'
import { fa } from 'zod/v4/locales'
import { Nullable } from '@/m0ves/lib/Nullable'

export async function createGameSession(sessionData: Partial<GameSession>, quizId: number) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  if (user?.role != 'admin') {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: ['Only Admins can create game sessions'],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const session = await payload.create({
      collection: 'game-session',
      data: {
        name: '(unnamed-session):' + Date.now(),
        playerCount: 2,
        state: 'setup',
        startTime: null,
        endTime: null,
        owners: [
          {
            user: user?.id,
          },
        ],
        round: 0,
        players: JSON.stringify([]),
        quiz: quizId,
        ...sessionData,
      },
    })

    const playerSessionsResponses: StandardSiteResponse<GameSessionPlayer>[] = []
    for (let i = 0; i < (sessionData.playerCount ?? 0); i++) {
      // Create Game Session Players
      const newPlayerResponse = await createGameSessionPlayer(session.id, i)
      playerSessionsResponses.push(newPlayerResponse)
    }

    return {
      data: session,
      domain: 'Game Session',
      error: false,
      messages: ['Session Created'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e) {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function getSessionById(sessionId: number) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  try {
    const data = await payload.findByID({
      collection: 'game-session',
      id: sessionId,
    })

    if (!data) {
      return {
        data: null,
        domain: 'Get Game Session',
        error: true,
        messages: ['Game Session Not found!'],
        success: false,
        hint_http: 404,
      } as StandardSiteResponse<GameSession>
    }
    return {
      data,
      domain: 'Get Game Session',
      error: false,
      messages: ['Found Game Session!'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e: any) {
    return {
      data: null,
      domain: 'Get Game Session',
      error: true,
      messages: [(e as Error).message],

      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function startSession(sessionData: Partial<GameSession>) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const session = await payload.update({
      collection: 'game-session',
      id: sessionData.id ?? -1,
      data: {
        startTime: new Date().toUTCString(),
        state: 'in-progress',
      },
    })
    return {
      data: session,
      domain: 'Game Session',
      error: false,
      messages: ['Session Created'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e) {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function endSession(sessionId: string | number) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const session = await payload.update({
      collection: 'game-session',
      id: sessionId ?? -1,
      data: {
        endTime: new Date().toUTCString(),
        state: 'ended',
      },
    })
    return {
      data: session,
      domain: 'Game Session',
      error: false,
      messages: ['Session Created'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e) {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function addPlayerToSession(
  sessionId: number,
  playerInfo: { id: number; picture: string; name: string },
) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const existingSession = await payload.findByID({
      collection: 'game-session',
      id: sessionId,
      depth: 3,
    })
    const existingPlayers = existingSession.players as number[]
    const playerAlreadyJoined = !existingPlayers.some((pid) => pid === playerInfo.id)

    if (playerAlreadyJoined) {
      return {
        data: existingSession,
        domain: 'Game Session',
        error: false,
        messages: ['player already joined'],
        success: true,
        hint_http: 200,
      } as StandardSiteResponse<GameSession>
    }

    const playerUpdate = await payload.update({
      collection: 'game-session-player',
      data: {
        name: playerInfo.name,
        picture: playerInfo.picture,
        ready: true,
      },
      where: {
        id: { equals: playerInfo.id },
      },
    })

    const sessionUpdate = await payload.update({
      collection: 'game-session',
      id: existingSession.id,
      data: {
        players: [...existingPlayers, playerInfo.id],
      },
    })
    return {
      data: sessionUpdate,
      domain: 'Game Session',
      error: false,
      messages: ['Player Added to Session'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e) {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function removePlayerFromSession(sessionId: string, playerSessionId: number) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const existingSession = await payload.findByID({
      collection: 'game-session',
      id: sessionId,
    })

    const existingPlayers = existingSession.players as unknown as number[]

    const sessionUpdate = await payload.update({
      collection: 'game-session',
      id: existingSession.id,
      data: {
        players: existingPlayers.filter((pid) => pid != playerSessionId),
      },
    })
    return {
      data: sessionUpdate,
      domain: 'Game Session',
      error: false,
      messages: ['Player Removed From session'],
      success: true,
      hint_http: 200,
    } as StandardSiteResponse<GameSession>
  } catch (e) {
    return {
      data: null,
      domain: 'Game Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function createGameSessionPlayer(sessionId: number, index: number) {
  // const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  try {
    const newPlayerSession = await payload.create({
      collection: 'game-session-player',
      data: {
        name: '(unset)',
        picture: 'https://picsum.photos/100/100', // TODO ADD SOME DEFAULT
        score: 0,
        session: sessionId,
        answers: JSON.stringify([]),
        eliminated: false,
        index,
      },
    })

    return {
      data: newPlayerSession,
      domain: 'Game Session',
      error: true,
      messages: ['Created Player Successfully'],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSessionPlayer>
  } catch (e) {
    console.log(e)
    return {
      data: null,
      domain: 'Game Player Session',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSessionPlayer>
  }
}

export async function submitAnswer(
  playerId: number,
  sessionId: number,
  answerIndex: number,
): Promise<StandardSiteResponse<{}>> {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    //const { user } = await payload.auth({ headers })
    const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

    const existingPlayersSession = await payload.findByID({
      collection: 'game-session-player',
      id: playerId,
    })

    const existingAnswers = existingPlayersSession.answers as unknown as number[]

    payload.update({
      collection: 'game-session-player',
      data: {
        answers: [...existingAnswers, answerIndex],
      },
      where: {
        and: [
          {
            id: { equals: playerId },
          },
          {
            session: { equals: sessionId },
          },
        ],
      },
    })

    return {
      data: {},
      domain: 'Game Session Submit Answer',
      error: false,
      messages: [],
      success: true,
      hint_http: 200,
    }
  } catch (e: any) {
    return {
      data: {},
      domain: 'Game Session Submit Answer',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 400,
    }
  }
}

export async function getUserGameSessions(): Promise<StandardSiteResponse<GameSession[]>> {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })

    if (!user) throw new Error('No User')

    const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
    const data = await payload.find({
      collection: 'game-session',
      where: {
        'owners.user.id': {
          equals: (user as unknown as User).id,
        },
      },
    })

    return {
      data: data.docs,
      domain: 'Game Session Get sessions',
      error: false,
      success: true,
      messages: ['Successfully Retrieved sessions'],
      hint_http: 200,
    }
  } catch (e) {
    return {
      data: [],
      domain: 'Game Session Get sessions',
      error: true,
      messages: [(e as Error).message],
      success: false,
      hint_http: 403,
    }
  }
}

export async function getAvailableQuizzes(): Promise<StandardSiteResponse<Quiz[]>> {
  try {
    const headers = await getHeaders()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    // const { user } = await payload.auth({ headers }) // TODO USE LATER

    const query = await payload.find({
      collection: 'quizzes',
    })

    return {
      data: query.docs,
      domain: 'Get Available Quizzes',
      error: false,
      success: true,
      messages: ['Retrieved Quizzes Successfully'],
      hint_http: 200,
    }
  } catch (e) {
    return {
      data: [],
      domain: 'Get Available Quizzes',
      error: true,
      success: false,
      messages: [(e as Error).message],
      hint_http: 400,
    }
  }
}

export async function getSessionPlayers(
  sessionId: number,
): Promise<StandardSiteResponse<GameSessionPlayer[]>> {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  try {
    const players = await payload.find({
      collection: 'game-session-player',
      depth: 3,
      where: {
        session: {
          equals: sessionId,
        },
      },
    })

    return {
      data: players.docs,
      domain: 'Get Session Players',
      error: false,
      messages: ['Retrieved Players'],
      success: true,
    } as StandardSiteResponse<GameSessionPlayer[]>
  } catch (e) {
    return {
      data: [],
      domain: 'Get Session Players',
      error: false,
      messages: [(e as Error).message],
      success: true,
    } as StandardSiteResponse<GameSessionPlayer[]>
  }
}

export async function getSessionAndPlayers(
  sessionId: number,
): Promise<StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>> {
  try {
    const sessionResponse = await getSessionById(sessionId)
    if (sessionResponse.data == null) {
      return {
        data: null,
        domain: 'Get Session and Players',
        error: true,
        success: false,
        messages: [...sessionResponse.messages],
        hint_http: 404,
      } as StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>
    }

    const playersResponse = await getSessionPlayers(sessionId)
    if (playersResponse.error) {
      return {
        data: null,
        domain: 'Get Session and Players',
        error: true,
        success: false,
        hint_http: 500,
        messages: [...playersResponse.messages],
      } as StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>
    }

    return {
      domain: 'Get Session and Players',
      error: false,
      success: true,
      messages: ['Data Retrieved Successfully'],
      hint_http: 200,
      data: {
        session: sessionResponse.data,
        players: playersResponse.data,
      },
    } as StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>
  } catch (e) {
    return {
      domain: 'Get Session and Players',
      success: false,
      error: true,
      messages: [(e as Error).message],
      hint_http: 500,
      data: null,
    } as StandardSiteResponse<{ session: GameSession; players: GameSessionPlayer[] }>
  }
}

export type SessionAndPlayersData = {
  session: GameSession
  players: GameSessionPlayer[]
}
