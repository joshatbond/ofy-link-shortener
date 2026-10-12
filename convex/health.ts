import { v } from "convex/values";
import { query } from "./_generated/server";

// Public constant with no user data. Later public functions stay covered.
// eslint-disable-next-line @convex-dev/require-access-control
export const check = query({
  args: {},
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: () => {
    return { ok: true as const };
  },
});
