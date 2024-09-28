import { type findLinks } from '@/server/db/actions'

import { Dashboard } from './_components'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // const links = await findLinks({
  //   with: { linkTags: { with: { tag: true } } },
  // })
  const links = Array.from({ length: 100 }).map((_, i) => createTestLink(i))

  return <Dashboard links={links} />
}

function createTestLink(
  id: number
): Awaited<ReturnType<typeof findLinks>>[number] {
  return {
    id: `${id}`,
    slug: `test-${id}`,
    redirectUrl: 'https://google.com',
    description: `test-${id}`,
    disabled: false,
    isProtected: false,
    passwordHash: null,
    created: Math.floor(Date.now() / 1000),
    expires: null,
    userId: 1,
  }
}
