import { NextResponse } from 'next/server'

export default function proxy(request: Request) {
  const reqHeaders = new Headers(request.headers)
  const url = new URL(request.url)
  reqHeaders.set('x-request-path', url.pathname)

  return NextResponse.next({
    request: {
      headers: reqHeaders,
    },
  })
}
