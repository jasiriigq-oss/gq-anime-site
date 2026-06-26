'use server'
import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import config from '@/payload.config'
import { GameSession } from '@/payload-types'
import { StandardSiteResponse } from '@/m0ves/lib/StandardSiteResponse'
import { fa } from 'zod/v4/locales'
import { GameSession_Player, GameSession_PlayerInfo_JSON } from '@/collections/GameSession'

export async function createSession(sessionData: Partial<GameSession>, quizId: number) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  //const { user } = await payload.auth({ headers })
  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  // TODO MAKE SURE YOU HAVE PERMS TO DO SUCH A THING
  try {
    const session = await payload.create({
      collection: 'game-session',
      data: {
        name: '(unnamed-session):' + Date.now(),
        playerCount: 2,
        state: 'setup',
        startTime: '',
        endTime: '',
        quiz: quizId,
        ...sessionData,
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
      messages: [e],
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
      messages: [e],
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
      messages: [e],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function addPlayerToSession(sessionId: string, player: GameSession_Player) {
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

    const playerAlreadyJoined =
      (existingSession.players_info_json as unknown as GameSession_PlayerInfo_JSON).players.find(
        (p) => p.id == player.id,
      ) != null

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

    const sessionUpdate = await payload.update({
      collection: 'game-session',
      id: existingSession.id,
      data: {
        players_info_json: {
          ...(existingSession.players_info_json as any),
          players: [
            ...(existingSession.players_info_json as unknown as GameSession_PlayerInfo_JSON)
              .players,
            player,
          ],
        },
      },
    })
    return {
      data: sessionUpdate,
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
      messages: [e],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}

export async function removePlayerFromSession(sessionId: string, playerSessionId: string) {
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

    const sessionUpdate = await payload.update({
      collection: 'game-session',
      id: existingSession.id,
      data: {
        players_info_json: {
          ...(existingSession.players_info_json as any),
          players: (
            existingSession.players_info_json as unknown as GameSession_PlayerInfo_JSON
          ).players.filter((p) => p.id != playerSessionId),
        },
      },
    })
    return {
      data: sessionUpdate,
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
      messages: [e],
      success: false,
      hint_http: 500,
    } as StandardSiteResponse<GameSession>
  }
}
