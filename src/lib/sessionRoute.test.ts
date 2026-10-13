import { describe, expect, test } from "vitest";
import { sessionRoute } from "./sessionRoute";

describe("sessionRoute", () => {
  test("a viewer id stays on /", () => {
    expect(
      sessionRoute({ authLoading: false, viewerId: "users:abc" }),
    ).toBe("/");
  });

  test("a null viewer goes to /home once auth has settled", () => {
    expect(sessionRoute({ authLoading: false, viewerId: null })).toBe("/home");
  });

  test("a null viewer is not signed out while the handshake is in progress", () => {
    expect(sessionRoute({ authLoading: true, viewerId: null })).toBe(
      "pending",
    );
  });

  test("an in-flight viewer query waits", () => {
    expect(
      sessionRoute({ authLoading: false, viewerId: undefined }),
    ).toBe("pending");
  });
});
