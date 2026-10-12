import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { isOfyOrgEmail } from "./ofyEmail";

type AuthCtx = QueryCtx | MutationCtx;

export async function checkViewer(ctx: AuthCtx): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }

  const user = await ctx.db.get("users", userId);
  if (user === null || user.email === undefined || !isOfyOrgEmail(user.email)) {
    return null;
  }

  return user;
}

export async function requireOfyUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db.get("users", userId);
  if (user === null) {
    throw new Error("Not authenticated");
  }

  assertStoredOfyEmail(user.email);
  return user;
}

export async function assertOfyOrgAccount(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const user = await ctx.db.get("users", userId);
  assertStoredOfyEmail(user?.email);
}

function assertStoredOfyEmail(email: string | undefined): void {
  if (email === undefined || !isOfyOrgEmail(email)) {
    throw new Error("Sign-in requires an @ofy.org account.");
  }
}
