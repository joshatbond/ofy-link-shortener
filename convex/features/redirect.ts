import { v } from "convex/values";
import { internal } from "../_generated/api";
import { httpAction, internalQuery } from "../_generated/server";
import { assertRedirectUrl } from "./linkPolicy";

const UNKNOWN_LOCATION = "/unknown";

const storedLinkValidator = v.object({
  redirectUrl: v.string(),
  disabled: v.boolean(),
  expiresAt: v.optional(v.number()),
});

/**
 * Stored fields for one slug. This query does not read the clock.
 * The HTTP action decides expiry with Date.now().
 */
export const lookup = internalQuery({
  args: {
    slug: v.string(),
  },
  returns: v.union(storedLinkValidator, v.null()),
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (link === null) {
      return null;
    }

    return {
      redirectUrl: link.redirectUrl,
      disabled: link.disabled,
      ...(link.expiresAt !== undefined ? { expiresAt: link.expiresAt } : {}),
    };
  },
});

/** Public slug lookup. No session. Unknown, disabled, and expired stay on /unknown. */
export const redirectBySlug = httpAction(async (ctx, request) => {
  const slug = new URL(request.url).searchParams.get("slug");
  if (slug === null || slug.length === 0) {
    return unknownRedirect();
  }

  const link = await ctx.runQuery(internal.features.redirect.lookup, { slug });
  if (link === null || link.disabled) {
    return unknownRedirect();
  }

  const now = Date.now();
  if (link.expiresAt !== undefined && link.expiresAt <= now) {
    return unknownRedirect();
  }

  try {
    const location = assertRedirectUrl(link.redirectUrl);
    return new Response(null, {
      status: 307,
      headers: {
        Location: location,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return unknownRedirect();
  }
});

function unknownRedirect(): Response {
  return new Response(null, {
    status: 307,
    headers: {
      Location: UNKNOWN_LOCATION,
      "Cache-Control": "no-store",
    },
  });
}
