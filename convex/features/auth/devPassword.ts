import { v } from "convex/values";
import { query } from "../../_generated/server";
import { isLocalDevDeployment } from "./devOnly";

/** Whether the deployment exposes Convex Auth password sign-in (local dev only). */
// Public deployment flag. No user data.
// eslint-disable-next-line @convex-dev/require-access-control
export const isEnabled = query({
  args: {},
  returns: v.boolean(),
  handler: () => {
    return isLocalDevDeployment();
  },
});
