'use server'

import { eq } from 'drizzle-orm'

import { hashids } from '@/lib/hash'
import { db } from '@/server/db'
import { links, users } from '@/server/db/schema'

export async function createUserFromAuth(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.authId, userId),
  })
  if (!user) {
    await db.insert(users).values({
      authId: userId,
      created: Math.floor(Date.now() / 1000),
    })
  }
}

export async function findLinks(
  props: Parameters<typeof db.query.links.findMany>[0]
) {
  const links = await db.query.links.findMany(props)
  return links.map(encodeId)
}
export async function findLink(
  slug: string
  // props: Parameters<typeof db.query.links.findFirst>[0]
) {
  const link = await db.query.links.findFirst({ where: eq(links.slug, slug) })

  return link ? encodeId(link) : null
}

/**
 * Modify the id of an database object to be a string
 */
function encodeId<T extends Record<string, unknown>>(obj: T): EncodedId<T> {
  const result: Partial<Record<keyof T, unknown>> = {}
  for (const key in obj) {
    if (key === 'id' && typeof obj[key] === 'number') {
      result[key] = hashids.encode(obj[key] as number)
    }
    if (Array.isArray(obj[key])) {
      result[key] = (obj[key] as T[]).map(encodeId)
    }
    if (typeof obj[key] === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = encodeId(obj[key] as any)
    }
    result[key] = obj[key]
  }

  return result as EncodedId<T>
}
/**
 * Modify the id of an user's database object to be a number
 */
function decodeId<T extends Record<string, unknown>>(obj: T): DecodedId<T> {
  const result: Partial<Record<keyof T, unknown>> = {}
  for (const key in obj) {
    if (key === 'id' && typeof obj[key] === 'string') {
      result[key] = hashids.decode(obj[key] as string)
    }
    if (Array.isArray(obj[key])) {
      result[key] = (obj[key] as Record<string, unknown>[]).map(decodeId)
    }
    if (typeof obj[key] === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = decodeId(obj[key] as any)
    }
    result[key] = obj[key]
  }

  return result as DecodedId<T>
}
type EncodedId<T> = {
  [K in keyof T]: K extends 'id'
    ? string
    : T[K] extends object
      ? EncodedId<T[K]>
      : T[K]
}
type DecodedId<T> = {
  [K in keyof T]: K extends 'id'
    ? number
    : T[K] extends object
      ? DecodedId<T[K]>
      : T[K]
}
