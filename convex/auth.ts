import { convexAuth } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { authProvidersForDeployment } from "./features/auth/devPasswordProvider";
import { assertOfyOrgAccount } from "./features/auth/ofyUser";
import { resolvePostAuthRedirect } from "./features/auth/redirect";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: authProvidersForDeployment(),
  callbacks: {
    async redirect({ redirectTo }) {
      return resolvePostAuthRedirect(redirectTo);
    },
    async beforeSessionCreation(ctx, { userId }) {
      await assertOfyOrgAccount(ctx as MutationCtx, userId as Id<"users">);
    },
  },
});
