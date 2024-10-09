import { createRemoteJWKSet, jwtVerify } from 'jose'
import { type NextRequest, NextResponse } from 'next/server'

import { env } from './env'

const hankoApi = env.NEXT_PUBLIC_HANKO_API_URL

export async function middleware(request: NextRequest) {
  const hanko = request.cookies.get('hanko')?.value
  const JWKS = createRemoteJWKSet(new URL(`${hankoApi}/.well-known/jwks.json`))
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
