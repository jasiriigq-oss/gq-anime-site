import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()

  // Handle client disconnection clean-up
  const abortSignal = request.signal
  let isClosed = false

  abortSignal.addEventListener('abort', () => {
    isClosed = true
    writer.close()
    console.log('SSE connection closed by client')
  })

  // Example background task pouring data down the stream
  ;(async () => {
    try {
      let count = 0
      while (!isClosed && count < 10) {
        count++

        // SSE requires events to begin with 'data: ' and end with '\n\n'
        const data = JSON.stringify({ message: `Update #${count}`, timestamp: new Date() })
        await writer.write(encoder.encode(`data: ${data}\n\n`))

        // Wait 2 seconds before sending the next chunk
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error('Stream writing error:', error)
    } finally {
      if (!isClosed) {
        writer.close()
      }
    }
  })()

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
