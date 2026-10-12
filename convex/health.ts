import { v } from "convex/values";
import { query } from "./_generated/server";

export const check = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: () => {
    return { ok: true as const };
  },
});
