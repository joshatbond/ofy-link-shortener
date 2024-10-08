import { NextResponse } from 'next/server'

import { findLink } from '@/server/db/actions'

export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const link = await findLink(params.slug)
  return NextResponse.redirect(link?.redirectUrl ?? '/unknown')
}
