import { describe, expect, test } from "vitest";
import {
  authCodeStillUnread,
  sessionRoute,
  shouldSubscribeViewer,
} from "./sessionRoute";

describe("sessionRoute", () => {
  test("a viewer id stays on /", () => {
    expect(
      sessionRoute({
        codeUnread: false,
        viewerId: "users:abc",
      }),
    ).toBe("/");
  });

  test("a settled null viewer goes to /home", () => {
    expect(
      sessionRoute({
        codeUnread: false,
        viewerId: null,
      }),
    ).toBe("/home");
  });

  test("an unresolved viewer does not redirect", () => {
    expect(
      sessionRoute({
        codeUnread: false,
        viewerId: undefined,
      }),
    ).toBe("pending");
  });

  test("a null viewer does not redirect while ?code= is unread", () => {
    expect(
      sessionRoute({
        codeUnread: true,
        viewerId: null,
      }),
    ).toBe("pending");
  });

  test("a viewer id does not navigate while ?code= is unread", () => {
    expect(
      sessionRoute({
        codeUnread: true,
        viewerId: "users:abc",
      }),
    ).toBe("pending");
  });
});

describe("authCodeStillUnread", () => {
  test("an empty search has no code", () => {
    expect(authCodeStillUnread("")).toBe(false);
  });

  test("a code param is unread", () => {
    expect(authCodeStillUnread("?code=oauth-code")).toBe(true);
  });

  test("other params are not the OAuth code", () => {
    expect(authCodeStillUnread("?foo=1")).toBe(false);
  });

  test("an empty code is ignored, matching the auth client", () => {
    expect(authCodeStillUnread("?code=")).toBe(false);
  });
});

describe("shouldSubscribeViewer", () => {
  test("does not subscribe in the render where the handshake just settled", () => {
    expect(
      shouldSubscribeViewer({
        codeUnread: false,
        handshakeSettled: true,
        subscriptionArmed: false,
      }),
    ).toBe(false);
  });

  test("does not subscribe while ?code= is unread", () => {
    expect(
      shouldSubscribeViewer({
        codeUnread: true,
        handshakeSettled: true,
        subscriptionArmed: true,
      }),
    ).toBe(false);
  });

  test("does not subscribe before the handshake attempt finishes", () => {
    expect(
      shouldSubscribeViewer({
        codeUnread: false,
        handshakeSettled: false,
        subscriptionArmed: true,
      }),
    ).toBe(false);
  });

  test("subscribes on the render after setAuth has paused the socket", () => {
    expect(
      shouldSubscribeViewer({
        codeUnread: false,
        handshakeSettled: true,
        subscriptionArmed: true,
      }),
    ).toBe(true);
  });
});
