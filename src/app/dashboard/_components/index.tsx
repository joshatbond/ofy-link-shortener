'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { type findLinks } from '@/server/db/actions'

export function Dashboard(props: {
  links: Awaited<ReturnType<typeof findLinks>>
}) {
  const [activeLinkId, activeLinkIdAssign] = useState<string | null>(null)
  const activeLink = useMemo(() => {
    if (!activeLinkId) return null
    return props.links.find(link => link.id === activeLinkId)
  }, [activeLinkId, props.links])

  return (
    <div className="p-4">
      <Sheet>
        <h1>Dashboard</h1>
        {props.links.map(link => (
          <div key={link.id}>
            <div>
              <p>{link.slug}</p>
              <div className="flex justify-between">
                <Link href={link.redirectUrl} target="_blank">
                  Go to URL
                </Link>

                <SheetTrigger onClick={() => activeLinkIdAssign(link.id)}>
                  Edit
                </SheetTrigger>
              </div>
            </div>
          </div>
        ))}

        <SheetContent>
          {activeLink ? (
            <div>
              <h2>{activeLink.slug}</h2>

              {Object.entries(activeLink).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span>{`${value}`}</span>
                </div>
              ))}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <button className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 text-2xl">
        +
      </button>
    </div>
  )
}
