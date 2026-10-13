import { describe, expect, test } from "vitest";
import { sessionRoute } from "./sessionRoute";

describe("sessionRoute", () => {
  test("a viewer id stays on /", () => {
    expect(
      sessionRoute({
        authLoading: false,
        handshakeFailed: false,
        viewerId: "users:abc",
      }),
    ).toBe("/");
  });

  test("a null viewer goes to /home once auth has settled", () => {
    expect(
      sessionRoute({
        authLoading: false,
        handshakeFailed: false,
        viewerId: null,
      }),
    ).toBe("/home");
  });

  test("a null viewer is not signed out while the handshake is in progress", () => {
    expect(
      sessionRoute({
        authLoading: true,
        handshakeFailed: false,
        viewerId: null,
      }),
    ).toBe("pending");
  });

  test("a failed handshake with a null viewer leaves checking for /home", () => {
    expect(
      sessionRoute({
        authLoading: true,
        handshakeFailed: true,
        viewerId: null,
      }),
    ).toBe("/home");
  });

  test("a viewer id stays on / even if a handshake failure was recorded", () => {
    expect(
      sessionRoute({
        authLoading: true,
        handshakeFailed: true,
        viewerId: "users:abc",
      }),
    ).toBe("/");
  });

  test("an in-flight viewer query waits", () => {
    expect(
      sessionRoute({
        authLoading: false,
        handshakeFailed: true,
        viewerId: undefined,
      }),
    ).toBe("pending");
  });
});
