import { createRemoteJWKSet, jwtVerify } from 'jose'
import { type NextRequest, NextResponse } from 'next/server'

import { env } from './env'

export async function middleware(request: NextRequest) {
  const hanko = request.cookies.get('hanko')?.value
  const JWKS = createRemoteJWKSet(
    new URL(`${env.NEXT_PUBLIC_HANKO_API_URL}/.well-known/jwks.json`)
  )
  const loginRoute = request.nextUrl.clone()
  loginRoute.pathname = '/login'

  try {
    await jwtVerify(hanko ?? '', JWKS)
  } catch (error) {
    return NextResponse.redirect(loginRoute)
  }
}

export const config = {
  matcher: ['/dashboard'],
}
