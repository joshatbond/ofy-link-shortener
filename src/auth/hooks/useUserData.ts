import { Hanko } from '@teamhanko/hanko-elements'
import { useEffect, useState } from 'react'

import { env } from '@/env'

const hankoApi = env.NEXT_PUBLIC_HANKO_API_URL

export function useUserData(): HankoUser {
  const [hanko, hankoAssign] = useState<Hanko>()
  const [userState, userStateAssign] = useState<HankoUser>({
    __type: 'loading',
    loading: true,
  })

  useEffect(() => {
    hankoAssign(new Hanko(hankoApi))
  }, [])

  useEffect(() => {
    hanko?.user
      .getCurrent()
      .then(({ id, email }) => {
        userStateAssign({ __type: 'validUser', id, email, loading: false })
      })
      .catch(e => {
        const error = e instanceof Error ? e.message : String(e)
        userStateAssign({
          __type: 'invalidUser',
          loading: false,
          error,
        })
      })
  }, [hanko])

  return userState
}

type HankoUser =
  | {
      __type: 'validUser'
      id: string
      email?: string
      loading: boolean
    }
  | {
      __type: 'invalidUser'
      error: string
      loading: boolean
    }
  | {
      __type: 'loading'
      loading: boolean
    }
