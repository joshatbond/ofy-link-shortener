import { afterEach, describe, expect, test } from "vitest";
import {
  authCodeExchangeFailed,
  isAuthCodeExchange,
  observeAuthCodeExchange,
  resetAuthCodeExchangeForTests,
  type AuthActionClient,
} from "./authCodeExchange";

afterEach(() => {
  resetAuthCodeExchangeForTests();
});

describe("isAuthCodeExchange", () => {
  test("matches the OAuth return call and not a provider sign-in", () => {
    expect(
      isAuthCodeExchange("auth:signIn", {
        provider: undefined,
        params: { code: "oauth-code" },
        verifier: undefined,
      }),
    ).toBe(true);
    expect(
      isAuthCodeExchange("auth:signIn", {
        provider: "google",
        params: { redirectTo: "https://sc.ofys.org/" },
      }),
    ).toBe(false);
    expect(
      isAuthCodeExchange("auth:signIn", {
        provider: "password",
        params: { email: "teacher@ofy.org", password: "secret" },
      }),
    ).toBe(false);
  });
});

describe("observeAuthCodeExchange", () => {
  test("a thrown code exchange is a failed handshake", async () => {
    const client: AuthActionClient = {
      action: async () => {
        throw new Error("Sign-in requires an @ofy.org account.");
      },
    };
    observeAuthCodeExchange(client);

    await expect(
      client.action("auth:signIn", {
        provider: undefined,
        params: { code: "oauth-code" },
        verifier: undefined,
      }),
    ).rejects.toThrow(/@ofy.org/);
    expect(authCodeExchangeFailed()).toBe(true);
  });

  test("a provider sign-in error does not fail the code exchange", async () => {
    const client: AuthActionClient = {
      action: async () => {
        throw new Error("Invalid password");
      },
    };
    observeAuthCodeExchange(client);

    await expect(
      client.action("auth:signIn", {
        provider: "password",
        params: { email: "teacher@ofy.org", password: "nope" },
      }),
    ).rejects.toThrow(/Invalid password/);
    expect(authCodeExchangeFailed()).toBe(false);
  });

  test("a successful code exchange does not fail the handshake", async () => {
    const client: AuthActionClient = {
      action: async () => ({ tokens: { token: "jwt" } }),
    };
    observeAuthCodeExchange(client);

    await client.action("auth:signIn", {
      params: { code: "oauth-code" },
    });
    expect(authCodeExchangeFailed()).toBe(false);
  });
});
