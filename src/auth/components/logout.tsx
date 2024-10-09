'use client'

import { Hanko } from '@teamhanko/hanko-elements'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { env } from '@/env'

const hankoApi = env.NEXT_PUBLIC_HANKO_API_URL

export default function HankoLogout() {
  const router = useRouter()
  const [hanko, hankoAssign] = useState<Hanko>()

  useEffect(() => {
    hankoAssign(new Hanko(hankoApi))
  }, [])

  const logout = async () => {
    try {
      await hanko?.user.logout()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <Button variant="destructive" onClick={logout}>
      Logout
    </Button>
  )
}