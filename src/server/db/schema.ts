import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  varchar,
} from 'drizzle-orm/pg-core'

export const createTable = pgTableCreator(name => `ofy-link-shortener_${name}`)

export const users = createTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id').notNull(),
  created: integer('created_at').default(Date.now()),
  isActive: boolean('is_active').default(true),
})

export const links = createTable('links', {
  id: serial('id').primaryKey(),
  created: integer('created_at').default(Date.now()),
  slug: varchar('slug', { length: 128 }).notNull(),
  expires: integer('expires_at'),
  redirectUrl: varchar('redirect_url').notNull(),
  description: varchar('description').notNull(),
  disabled: boolean('disabled').default(false),
  isProtected: boolean('is_protected').default(false),
  passwordHash: varchar('password_hash'),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
})

export const linkRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  linkTags: many(tagsOnLinks),
}))

export const tags = createTable('tags', {
  id: serial('id').primaryKey(),
  created: integer('created_at').default(Date.now()),
  name: varchar('name', { length: 256 }).notNull(),
  createdBy: integer('created_by')
    .notNull()
    .references(() => users.id),
})

export const tagRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.createdBy], references: [users.id] }),
  tagLinks: many(tagsOnLinks),
}))

export const tagsOnLinks = createTable(
  'tags_links',
  {
    linkId: integer('link_id')
      .notNull()
      .references(() => links.id),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  table => ({
    pk: primaryKey({ columns: [table.linkId, table.tagId] }),
  })
)
export const tagsOnLinksRelations = relations(tagsOnLinks, ({ one }) => ({
  link: one(links, { fields: [tagsOnLinks.linkId], references: [links.id] }),
  tag: one(tags, { fields: [tagsOnLinks.tagId], references: [tags.id] }),
}))
