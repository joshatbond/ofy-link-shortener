import { v } from "convex/values";
import { env, query } from "../../_generated/server";

/** Whether Google OAuth credentials are set on this deployment. */
// Public deployment flag. No user data.
// eslint-disable-next-line @convex-dev/require-access-control
export const isConfigured = query({
  args: {},
  returns: v.boolean(),
  handler: () => {
    const clientId = env.AUTH_GOOGLE_ID;
    const clientSecret = env.AUTH_GOOGLE_SECRET;
    return (
      clientId !== undefined &&
      clientId !== "" &&
      clientSecret !== undefined &&
      clientSecret !== ""
    );
  },
});
