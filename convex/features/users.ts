import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { normalizeDisplayName } from "../lib/displayName";
import { checkViewer, requireOfyUser } from "./auth/ofyUser";

const viewerProfileValidator = v.object({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  image: v.optional(v.string()),
});

/** Current signed-in @ofy.org user id, or null. */
export const viewer = query({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx) => {
    const user = await checkViewer(ctx);
    return user?._id ?? null;
  },
});

/** Profile fields for the signed-in @ofy.org user. */
export const viewerProfile = query({
  args: {},
  returns: v.union(viewerProfileValidator, v.null()),
  handler: async (ctx) => {
    const user = await checkViewer(ctx);
    if (user === null) {
      return null;
    }

    return {
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});

/** Update the signed-in user's display name. */
export const updateViewerProfile = mutation({
  args: {
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireOfyUser(ctx);
    const name = normalizeDisplayName(args.name);
    await ctx.db.patch("users", user._id, { name });
    return null;
  },
});
