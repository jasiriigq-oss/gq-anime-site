import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { supabase } from '@/supabase'
import { url } from 'inspector'
import { getSessionAndPlayers } from '@/app/game-operations'
import { INFO_MESSAGE } from '@/app/game-lib'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (process.env.IS_GAME_SERVER !== 'true')
    return new Response('Incompatible Server', {
      status: 500,
      statusText: 'This Functionality is not available on this server',
    })

  const url = new URL(request.url)

  const mode = url.searchParams.get('mode')

  switch (mode) {
    case 'player':
      break
    case 'admin':
      break
    case 'spectator':
      break
    default:
    case null:
      return new Response('Mode is Required', {
        status: 406,
        statusText: 'Mode is Required',
      })
  }

  const gameSessionId = url.searchParams.get('session') ?? ''
  if (!gameSessionId)
    return new Response('no session id provided', {
      status: 406,
      statusText: 'NO session Id Provided',
    })

  const playerId = url.searchParams.get('player')

  if (mode == 'player' && !playerId) {
    return new Response('no session id provided', {
      status: 406,
      statusText: 'No player Id Provided',
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function endConnectionSafely() {
        try {
          controller.enqueue(encoder.encode(`event: close\n`))
          controller.enqueue(encoder.encode(`data: end of stream\n\n`))
        } catch (e) {}
      }
      function sendJSON(_type: string, data: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: _type,
              data,
            })}\n\n`,
          ),
        )
      }

      let isClosed = false
      setTimeout(
        () => {
          isClosed = true

          // session closes after an hour
          endConnectionSafely()
        },
        1000 * 60 * 60,
      )

      // Send initial connection confirmation
      getSessionAndPlayers(parseInt(gameSessionId)).then((d) => sendJSON(INFO_MESSAGE, d.data))

      const changes = supabase
        .channel(`${gameSessionId}:${Math.random() * 20000}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_session',
            filter: `id=eq.${gameSessionId}`,
          },
          (gameSessionPayload) => {
            console.log('new  gameSession Data')
            sendJSON('game-session', gameSessionPayload)
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'game_session_player',
            filter: `session_id=eq.${gameSessionId}`,
          },
          (playerSessionPayload) => {
            console.log('new Player Data')
            sendJSON('game-session-player', playerSessionPayload)
          },
        )
        .subscribe((status, error) => {
          if (error) request.signal.dispatchEvent(new Event('abort'))
        })

      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        isClosed = true
        //clearInterval(interval)
        changes.unsubscribe()
        console.log('SSE connection closed by client')
      })
    },
  })

  // Return the stream immediately so Next.js knows the request was handled
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
