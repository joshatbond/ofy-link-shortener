import Link from 'next/link'

import { mockData } from '@/server/mockData'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {mockData.map(link => (
        <div key={link.id}>
          <img src={link.image} alt={link.description} />
          <div>
            <p>{link.title}</p>
            <Link href={link.url} target="_blank">
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
