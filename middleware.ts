import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 仅用于调试 /api/forgotpwd：在终端打印请求，并在响应头打上标记。
 * 若 Network 里看不到 x-gditc-middleware，说明请求未经过该 middleware（路径/端口不对）。
 */
export function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname.replace(/\/$/, '') || '/'
  if (p === '/api/forgotpwd') {
    const line = `[gditc debug /api/forgotpwd] ${request.method} ${request.nextUrl.href}`
    console.log(line)
    const res = NextResponse.next()
    res.headers.set('x-gditc-middleware', 'hit')
    res.headers.set('x-gditc-forgotpwd-method', request.method)
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/forgotpwd', '/api/forgotpwd/'],
}
