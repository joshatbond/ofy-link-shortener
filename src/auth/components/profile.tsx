'use client'

import { register } from '@teamhanko/hanko-elements'
import { useEffect } from 'react'

import { env } from '@/env'

export default function HankoProfile() {
  useEffect(() => {
    register(env.NEXT_PUBLIC_HANKO_API_URL).catch(console.error)
  }, [])

  return <hanko-profile />
}
