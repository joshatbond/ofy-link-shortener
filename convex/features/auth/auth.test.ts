/// <reference types="vite/client" />
import { afterEach, describe, expect, test, vi } from "vitest";
import { api } from "../../_generated/api";
import { asAuthedUser, initConvexTest } from "../../test.setup";
import { isLocalDevDeployment } from "./devOnly";
import { authProvidersForDeployment } from "./devPasswordProvider";
import { resolvePostAuthRedirect } from "./redirect";

function registeredProviderIds(
  providers: ReadonlyArray<{ id: string; options?: { id?: string } }>,
): string[] {
  return providers.map((provider) => provider.options?.id ?? provider.id);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolvePostAuthRedirect", () => {
  test("missing SITE_URL fails closed", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("ALLOWED_SITE_URLS", "https://sc.ofys.org");

    expect(() => resolvePostAuthRedirect("/dashboard")).toThrow(
      /SITE_URL is not configured/,
    );
  });

  test("disallowed redirectTo falls back to /dashboard", () => {
    vi.stubEnv("SITE_URL", "https://sc.ofys.org");
    vi.stubEnv("ALLOWED_SITE_URLS", "");

    expect(resolvePostAuthRedirect("/evil")).toBe(
      "https://sc.ofys.org/dashboard",
    );
    expect(resolvePostAuthRedirect(null)).toBe("https://sc.ofys.org/dashboard");
    expect(resolvePostAuthRedirect("https://evil.example/steal")).toBe(
      "https://sc.ofys.org/dashboard",
    );
    expect(resolvePostAuthRedirect("/dashboard")).toBe(
      "https://sc.ofys.org/dashboard",
    );
    expect(resolvePostAuthRedirect("/dashboard/links?tab=mine")).toBe(
      "https://sc.ofys.org/dashboard/links?tab=mine",
    );
    expect(resolvePostAuthRedirect("https://sc.ofys.org/dashboard")).toBe(
      "https://sc.ofys.org/dashboard",
    );
  });
});

describe("dev password provider", () => {
  test("dev password is absent when the deployment is not local", async () => {
    vi.stubEnv("SITE_URL", "https://sc.ofys.org");
    vi.stubEnv("DEV_PASSWORD_AUTH", "");
    vi.stubEnv("INVITE_DEV_RELAXED", "");

    expect(isLocalDevDeployment()).toBe(false);
    expect(registeredProviderIds(authProvidersForDeployment())).toEqual([
      "google",
    ]);

    const t = initConvexTest();
    expect(await t.query(api.features.auth.devPassword.isEnabled, {})).toBe(
      false,
    );
  });

  test("dev password is present for localhost, 127.0.0.1, or the dev flag", () => {
    vi.stubEnv("DEV_PASSWORD_AUTH", "");
    vi.stubEnv("INVITE_DEV_RELAXED", "");
    vi.stubEnv("SITE_URL", "http://localhost:5173");
    expect(isLocalDevDeployment()).toBe(true);
    expect(registeredProviderIds(authProvidersForDeployment())).toEqual([
      "google",
      "password",
    ]);

    vi.stubEnv("SITE_URL", "http://127.0.0.1:5173");
    expect(isLocalDevDeployment()).toBe(true);

    vi.stubEnv("SITE_URL", "https://sc.ofys.org");
    vi.stubEnv("DEV_PASSWORD_AUTH", "true");
    expect(isLocalDevDeployment()).toBe(true);

    vi.stubEnv("DEV_PASSWORD_AUTH", "");
    vi.stubEnv("INVITE_DEV_RELAXED", "true");
    expect(isLocalDevDeployment()).toBe(true);
  });
});

describe("ofy.org accounts", () => {
  test("an unauthenticated mutation throws", async () => {
    const t = initConvexTest();

    await expect(
      t.mutation(api.features.users.updateViewerProfile, { name: "Ada" }),
    ).rejects.toThrow(/Not authenticated/);
  });

  test("a non-@ofy.org identity is rejected", async () => {
    const t = initConvexTest();
    const outsider = await asAuthedUser(t, { email: "outsider@gmail.com" });

    await expect(
      outsider.client.mutation(api.features.users.updateViewerProfile, {
        name: "Ada",
      }),
    ).rejects.toThrow(/@ofy.org/);
  });

  test("an @ofy.org identity can update its profile", async () => {
    const t = initConvexTest();
    const member = await asAuthedUser(t, { email: "teacher@ofy.org" });

    expect(
      await member.client.mutation(api.features.users.updateViewerProfile, {
        name: "Ada",
      }),
    ).toBeNull();

    expect(
      await member.client.query(api.features.users.viewerProfile, {}),
    ).toMatchObject({
      email: "teacher@ofy.org",
      name: "Ada",
    });
  });
});
