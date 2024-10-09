'use client'

import { register } from '@teamhanko/hanko-elements'
import { useEffect } from 'react'

import { env } from '@/env'

const hankoApi = env.NEXT_PUBLIC_HANKO_API_URL

export default function HankoProfile() {
  useEffect(() => {
    register(hankoApi).catch(console.error)
  }, [])

  return <hanko-profile />
}
