import { findLinks } from '@/server/db/actions'

import { Dashboard } from './_components'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const links = await findLinks({
    with: { linkTags: { with: { tag: true } } },
  })

  return <Dashboard links={links} />
}
