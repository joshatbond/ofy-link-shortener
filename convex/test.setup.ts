/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import type { TestConvex } from "convex-test";

export const modules = import.meta.glob([
  "./**/*.{js,ts}",
  "!./**/*.d.ts",
  "!./**/*.test.ts",
  "!./test.setup.ts",
]);

export type ConvexTest = TestConvex<typeof schema>;

export function initConvexTest(): ConvexTest {
  return convexTest(schema, modules);
}

/**
 * Convex Auth puts `userId|sessionId` in the JWT `subject`.
 * Seed a user + authSessions row and return a client acting as that session.
 */
export async function asAuthedUser(
  t: ConvexTest,
  options: {
    email?: string;
    name?: string;
  } = {},
) {
  const { userId, sessionId } = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: options.email ?? "student@ofy.org",
      name: options.name ?? "Test Student",
    });
    const sessionId = await ctx.db.insert("authSessions", {
      userId,
      expirationTime: Date.now() + 1000 * 60 * 60,
    });
    return { userId, sessionId };
  });

  return {
    userId: userId as Id<"users">,
    sessionId: sessionId as Id<"authSessions">,
    client: t.withIdentity({
      subject: `${userId}|${sessionId}`,
    }),
  };
}
