'use client'

import { Hanko, register } from '@teamhanko/hanko-elements'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { env } from '@/env'

export default function HankoAuth() {
  const router = useRouter()
  const [hanko, hankoAssign] = useState<Hanko>()

  useEffect(() => {
    hankoAssign(new Hanko(env.NEXT_PUBLIC_HANKO_API_URL))
    register(env.NEXT_PUBLIC_HANKO_API_URL).catch(console.error)
  }, [])

  useEffect(() => {
    hanko?.onSessionCreated(() => router.replace('/dashboard'))
  }, [hanko, router])

  return <hanko-auth />
}
