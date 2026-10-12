import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  links: defineTable({
    ownerId: v.id("users"),
    slug: v.string(),
    redirectUrl: v.string(),
    description: v.optional(v.string()),
    disabled: v.boolean(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),
  linkShares: defineTable({
    linkId: v.id("links"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_link_and_user", ["linkId", "userId"]),
});
