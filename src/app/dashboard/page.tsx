import { UserSquare2Icon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { findLinks } from '@/server/db/actions'

import { Dashboard } from './_components'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const links = await findLinks({
    with: { linkTags: { with: { tag: true } } },
  })

  return (
    <>
      <header className="flex items-center gap-4 bg-[#050504] p-4">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={48} height={48} />
        </Link>

        <h1 className="flex-1 text-center font-bold uppercase leading-[32px] text-white">
          Dashboard
        </h1>

        <Button variant="ghost">
          <UserSquare2Icon />
        </Button>
      </header>

      <Dashboard links={links} />
    </>
  )
}
