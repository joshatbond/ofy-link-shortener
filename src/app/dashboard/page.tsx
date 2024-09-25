import Link from 'next/link'

import { hashids } from '@/lib/hash'
import { db } from '@/server/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const dbLinks = await db.query.links.findMany({
    with: { linkTags: { with: { tag: true } } },
  })
  const links = dbLinks.map(link => ({
    ...link,
    id: hashids.encode(link.id),
  }))

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
