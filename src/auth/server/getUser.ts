import { decodeJwt } from 'jose'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { env } from '@/env'

const hankoApi = env.NEXT_PUBLIC_HANKO_API_URL
const hankoUser = z.object({
  id: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string(),
  username: z.string().nullable(),
  webauthn_credentials: z.object({
    id: z.string(),
  }),
})

export async function getUserData() {
  const token = cookies().get('hanko')?.value ?? ''
  const { sub: userID } = decodeJwt(token)

  const response = await fetch(`${hankoApi}/users/${userID}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return null

  const data = (await response.json()) as unknown
  return hankoUser.parse(data)
}
