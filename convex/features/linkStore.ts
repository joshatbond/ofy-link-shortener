import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { isOfyOrgEmail, normalizeEmail } from "./auth/ofyEmail";
import {
  assertRedirectUrl,
  normalizeDescription,
  normalizeSlug,
} from "./linkPolicy";

type ReadCtx = QueryCtx | MutationCtx;
type OfyUser = Doc<"users">;

export type LinkSummary = {
  _id: Id<"links">;
  _creationTime: number;
  ownerId: Id<"users">;
  slug: string;
  redirectUrl: string;
  description?: string;
  disabled: boolean;
  expiresAt?: number;
};

export type ShareView = {
  userId: Id<"users">;
  email: string;
};

export type OwnerLinkView = LinkSummary & {
  access: "owner";
  shares: ShareView[];
};

export type SharedLinkView = LinkSummary & {
  access: "shared";
};

export type LinkView = OwnerLinkView | SharedLinkView;

type CreateLinkArgs = {
  slug: string;
  redirectUrl: string;
  description?: string;
  expiresAt?: number;
};

type UpdateLinkArgs = {
  linkId: Id<"links">;
  slug?: string;
  redirectUrl?: string;
  description?: string | null;
  expiresAt?: number | null;
  disabled?: boolean;
};

export async function createLink(
  ctx: MutationCtx,
  owner: OfyUser,
  args: CreateLinkArgs,
): Promise<Id<"links">> {
  const slug = normalizeSlug(args.slug);
  const redirectUrl = assertRedirectUrl(args.redirectUrl);
  await assertSlugAvailable(ctx, slug);

  const description =
    args.description === undefined
      ? undefined
      : normalizeDescription(args.description);

  return await ctx.db.insert("links", {
    ownerId: owner._id,
    slug,
    redirectUrl,
    disabled: false,
    ...(description !== undefined ? { description } : {}),
    ...(args.expiresAt !== undefined ? { expiresAt: args.expiresAt } : {}),
  });
}

export async function updateLink(
  ctx: MutationCtx,
  owner: OfyUser,
  args: UpdateLinkArgs,
): Promise<null> {
  const link = await requireOwnedLink(ctx, owner, args.linkId);
  const patch: {
    slug?: string;
    redirectUrl?: string;
    description?: string;
    disabled?: boolean;
    expiresAt?: number;
  } = {};

  if (args.slug !== undefined) {
    patch.slug = normalizeSlug(args.slug);
    await assertSlugAvailable(ctx, patch.slug, link._id);
  }

  if (args.redirectUrl !== undefined) {
    patch.redirectUrl = assertRedirectUrl(args.redirectUrl);
  }

  if (args.description !== undefined) {
    patch.description = normalizeDescription(args.description);
  }

  if (args.expiresAt !== undefined) {
    patch.expiresAt = args.expiresAt === null ? undefined : args.expiresAt;
  }

  if (args.disabled !== undefined) {
    patch.disabled = args.disabled;
  }

  await ctx.db.patch("links", link._id, patch);
  return null;
}

export async function disableLink(
  ctx: MutationCtx,
  owner: OfyUser,
  linkId: Id<"links">,
): Promise<null> {
  const link = await requireOwnedLink(ctx, owner, linkId);
  await ctx.db.patch("links", link._id, { disabled: true });
  return null;
}

export async function removeOwnedLink(
  ctx: MutationCtx,
  owner: OfyUser,
  linkId: Id<"links">,
): Promise<null> {
  const link = await requireOwnedLink(ctx, owner, linkId);
  const shares = await ctx.db
    .query("linkShares")
    .withIndex("by_link_and_user", (q) => q.eq("linkId", link._id))
    .collect();

  for (const share of shares) {
    await ctx.db.delete("linkShares", share._id);
  }

  await ctx.db.delete("links", link._id);
  return null;
}

export async function shareLink(
  ctx: MutationCtx,
  owner: OfyUser,
  args: { linkId: Id<"links">; email: string },
): Promise<null> {
  const link = await requireOwnedLink(ctx, owner, args.linkId);
  const target = await requireShareUser(ctx, args.email);

  if (target._id === owner._id) {
    throw new Error("You cannot share a link with yourself.");
  }

  const existing = await findShare(ctx, link._id, target._id);
  if (existing !== null) {
    return null;
  }

  await ctx.db.insert("linkShares", {
    linkId: link._id,
    userId: target._id,
  });
  return null;
}

export async function unshareLink(
  ctx: MutationCtx,
  owner: OfyUser,
  args: { linkId: Id<"links">; email: string },
): Promise<null> {
  const link = await requireOwnedLink(ctx, owner, args.linkId);
  const target = await requireShareUser(ctx, args.email);
  const existing = await findShare(ctx, link._id, target._id);

  if (existing === null) {
    throw new Error("This link is not shared with that user.");
  }

  await ctx.db.delete("linkShares", existing._id);
  return null;
}

export async function listOwnedLinks(
  ctx: QueryCtx,
  owner: OfyUser,
): Promise<LinkSummary[]> {
  const links = await ctx.db
    .query("links")
    .withIndex("by_owner", (q) => q.eq("ownerId", owner._id))
    .order("desc")
    .collect();

  return links.map((link) => toSummary(link));
}

export async function listSharedLinks(
  ctx: QueryCtx,
  user: OfyUser,
): Promise<LinkSummary[]> {
  const shares = await ctx.db
    .query("linkShares")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .order("desc")
    .collect();

  const summaries: LinkSummary[] = [];
  for (const share of shares) {
    const link = await ctx.db.get("links", share.linkId);
    if (link !== null) {
      summaries.push(toSummary(link));
    }
  }

  return summaries;
}

/**
 * Returns the link when the caller owns it or has a share.
 * Expired and disabled links stay visible. The redirect action enforces those.
 */
export async function getVisibleLink(
  ctx: QueryCtx,
  user: OfyUser,
  linkId: Id<"links">,
): Promise<LinkView | null> {
  const link = await ctx.db.get("links", linkId);
  if (link === null) {
    return null;
  }

  if (link.ownerId === user._id) {
    return {
      ...toSummary(link),
      access: "owner",
      shares: await listShareViews(ctx, link._id),
    };
  }

  const share = await findShare(ctx, link._id, user._id);
  if (share === null) {
    return null;
  }

  return {
    ...toSummary(link),
    access: "shared",
  };
}

async function requireOwnedLink(
  ctx: MutationCtx,
  owner: OfyUser,
  linkId: Id<"links">,
): Promise<Doc<"links">> {
  const link = await ctx.db.get("links", linkId);
  if (link === null || link.ownerId !== owner._id) {
    throw new Error("Link not found.");
  }
  return link;
}

async function assertSlugAvailable(
  ctx: MutationCtx,
  slug: string,
  exceptLinkId?: Id<"links">,
): Promise<void> {
  const existing = await ctx.db
    .query("links")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  if (existing !== null && existing._id !== exceptLinkId) {
    throw new Error("Slug is already in use.");
  }
}

async function requireShareUser(
  ctx: MutationCtx,
  email: string,
): Promise<Doc<"users">> {
  const normalized = normalizeEmail(email);
  if (!isOfyOrgEmail(normalized)) {
    throw new Error("Share with an @ofy.org user.");
  }

  const target = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", normalized))
    .unique();

  if (
    target === null ||
    target.email === undefined ||
    !isOfyOrgEmail(target.email)
  ) {
    throw new Error("No user with that email.");
  }

  return target;
}

async function findShare(
  ctx: ReadCtx,
  linkId: Id<"links">,
  userId: Id<"users">,
): Promise<Doc<"linkShares"> | null> {
  return await ctx.db
    .query("linkShares")
    .withIndex("by_link_and_user", (q) =>
      q.eq("linkId", linkId).eq("userId", userId),
    )
    .unique();
}

async function listShareViews(
  ctx: QueryCtx,
  linkId: Id<"links">,
): Promise<ShareView[]> {
  const shares = await ctx.db
    .query("linkShares")
    .withIndex("by_link_and_user", (q) => q.eq("linkId", linkId))
    .collect();

  const views: ShareView[] = [];
  for (const share of shares) {
    const sharedUser = await ctx.db.get("users", share.userId);
    if (sharedUser?.email === undefined || !isOfyOrgEmail(sharedUser.email)) {
      continue;
    }
    views.push({ userId: sharedUser._id, email: sharedUser.email });
  }

  return views;
}

function toSummary(link: Doc<"links">): LinkSummary {
  const summary: LinkSummary = {
    _id: link._id,
    _creationTime: link._creationTime,
    ownerId: link.ownerId,
    slug: link.slug,
    redirectUrl: link.redirectUrl,
    disabled: link.disabled,
  };

  if (link.description !== undefined) {
    summary.description = link.description;
  }

  if (link.expiresAt !== undefined) {
    summary.expiresAt = link.expiresAt;
  }

  return summary;
}
