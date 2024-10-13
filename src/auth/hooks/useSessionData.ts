import { Hanko } from '@teamhanko/hanko-elements'
import { useEffect, useState } from 'react'

import { env } from '@/env'

export function useSessionData(): HankoSession {
  const [hanko, hankoAssign] = useState<Hanko>()
  const [sessionState, sessionStateAssign] = useState<HankoSession>({
    __type: 'loading',
    loading: true,
    isValid: false,
  })

  useEffect(() => {
    hankoAssign(new Hanko(env.NEXT_PUBLIC_HANKO_API_URL))
  }, [])

  useEffect(() => {
    if (!hanko) return

    const isValid = hanko.session.isValid()
    const session = hanko.session.get()

    if (isValid && session) {
      sessionStateAssign({
        __type: 'validSession',
        jwt: session.jwt,
        loading: false,
        isValid,
      })
    } else {
      sessionStateAssign({
        __type: 'errorSession',
        isValid: false,
        loading: false,
        error: 'Invalid Session',
      })
    }
  }, [hanko])

  return sessionState
}

type HankoSession = {
  loading: boolean
  isValid: boolean
} & (
  | {
      __type: 'loading'
    }
  | {
      __type: 'validSession'
      jwt?: string
    }
  | {
      __type: 'errorSession'
      error: string
    }
)
