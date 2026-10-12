/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
  "./**/*.{js,ts}",
  "!./**/*.d.ts",
  "!./**/*.test.ts",
]);

test("health check returns ok", async () => {
  const t = convexTest(schema, modules);
  const status = await t.query(api.health.check, {});
  expect(status).toEqual({ ok: true });
});
