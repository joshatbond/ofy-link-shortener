import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireOfyUser } from "./auth/ofyUser";
import {
  createLink,
  disableLink,
  getVisibleLink,
  listOwnedLinks,
  listSharedLinks,
  removeOwnedLink,
  shareLink,
  unshareLink,
  updateLink,
} from "./linkStore";

const linkSummaryFields = {
  _id: v.id("links"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  slug: v.string(),
  redirectUrl: v.string(),
  description: v.optional(v.string()),
  disabled: v.boolean(),
  expiresAt: v.optional(v.number()),
};

const linkSummaryValidator = v.object(linkSummaryFields);

const shareValidator = v.object({
  userId: v.id("users"),
  email: v.string(),
});

const linkViewValidator = v.union(
  v.object({
    ...linkSummaryFields,
    access: v.literal("owner"),
    shares: v.array(shareValidator),
  }),
  v.object({
    ...linkSummaryFields,
    access: v.literal("shared"),
  }),
);

/** Links owned by the signed-in @ofy.org user, newest first. */
export const listMine = query({
  args: {},
  returns: v.array(linkSummaryValidator),
  handler: async (ctx) => {
    const user = await requireOfyUser(ctx);
    return await listOwnedLinks(ctx, user);
  },
});

/** Links shared with the signed-in @ofy.org user. View only. */
export const listSharedWithMe = query({
  args: {},
  returns: v.array(linkSummaryValidator),
  handler: async (ctx) => {
    const user = await requireOfyUser(ctx);
    return await listSharedLinks(ctx, user);
  },
});

/**
 * One link for its owner or a share recipient.
 * Disabled and expired links are still returned. Redirect enforcement is later.
 */
export const get = query({
  args: {
    linkId: v.id("links"),
  },
  returns: v.union(linkViewValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await getVisibleLink(ctx, user, args.linkId);
  },
});

/** Create a link owned by the signed-in user. The client does not send an owner id. */
export const create = mutation({
  args: {
    slug: v.string(),
    redirectUrl: v.string(),
    description: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await createLink(ctx, user, args);
  },
});

/** Change a link. Only the owner can call this. */
export const update = mutation({
  args: {
    linkId: v.id("links"),
    slug: v.optional(v.string()),
    redirectUrl: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    expiresAt: v.optional(v.union(v.number(), v.null())),
    disabled: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await updateLink(ctx, user, args);
  },
});

/** Mark a link disabled. Only the owner can call this. */
export const disable = mutation({
  args: {
    linkId: v.id("links"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await disableLink(ctx, user, args.linkId);
  },
});

/** Delete a link and its shares. Only the owner can call this. */
export const deleteLink = mutation({
  args: {
    linkId: v.id("links"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await removeOwnedLink(ctx, user, args.linkId);
  },
});

/** Share a link with another existing @ofy.org user. View access only. */
export const share = mutation({
  args: {
    linkId: v.id("links"),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await shareLink(ctx, user, args);
  },
});

/** Remove a share. Only the owner can call this. */
export const unshare = mutation({
  args: {
    linkId: v.id("links"),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    return await unshareLink(ctx, user, args);
  },
});
