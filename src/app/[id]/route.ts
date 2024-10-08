import { type NextRequest, NextResponse } from 'next/server'

import { findLink } from '@/server/db/actions'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.pathname.slice(1)

  const unknownRoute = request.nextUrl.clone()
  unknownRoute.pathname = '/unknown'

  const link = await findLink(slug!)
  return NextResponse.redirect(link?.redirectUrl ?? unknownRoute)
}
