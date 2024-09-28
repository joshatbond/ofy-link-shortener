import Link from 'next/link'

import { findLinks } from '@/server/db/actions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const links = await findLinks({
    with: { linkTags: { with: { tag: true } } },
  })

  return (
    <div>
      <h1>Dashboard</h1>
      {links.map(link => (
        <div key={link.id}>
          <div>
            <p>{link.slug}</p>
            <Link href={link.redirectUrl} target="_blank">
              Go to URL
            </Link>
            <Link href={`/dashboard/${link.id}`}>Edit Link</Link>
          </div>
        </div>
      ))}

      <button className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 text-2xl">
        +
      </button>
    </div>
  )
}
