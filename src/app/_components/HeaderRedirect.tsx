'use client'

import { useAuth } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'

export function Redirector() {
  const session = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  if (session?.userId && pathname === '/') router.push('/dashboard')

  return null
}
