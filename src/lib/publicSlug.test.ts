import { describe, expect, test } from "vitest";
import {
  convexSiteOrigin,
  forwardLocation,
  slugFromPathname,
} from "./publicSlug";

describe("slug paths", () => {
  test("one segment is a slug, including a trailing slash", () => {
    expect(slugFromPathname("/handbook")).toBe("handbook");
    expect(slugFromPathname("/handbook/")).toBe("handbook");
    expect(slugFromPathname("/Handbook")).toBe("Handbook");
  });

  test("app routes and static files are not lookups", () => {
    expect(slugFromPathname("/")).toBeNull();
    expect(slugFromPathname("/home")).toBeNull();
    expect(slugFromPathname("/home/")).toBeNull();
    expect(slugFromPathname("/login")).toBeNull();
    expect(slugFromPathname("/dashboard")).toBeNull();
    expect(slugFromPathname("/unknown")).toBeNull();
    expect(slugFromPathname("/unknown/")).toBeNull();
    expect(slugFromPathname("/favicon.ico")).toBeNull();
    expect(slugFromPathname("/logo.png")).toBeNull();
    expect(slugFromPathname("/assets")).toBeNull();
    expect(slugFromPathname("/assets/index.js")).toBeNull();
  });

  test("more than one segment is not a lookup", () => {
    expect(slugFromPathname("/handbook/extra")).toBeNull();
    expect(slugFromPathname("/foo/bar/")).toBeNull();
  });
});

describe("convex site origin", () => {
  test("derives the HTTP action origin from the cloud URL", () => {
    expect(
      convexSiteOrigin({
        VITE_CONVEX_URL: "https://happy-animal-123.convex.cloud",
      }),
    ).toBe("https://happy-animal-123.convex.site");
  });

  test("prefers CONVEX_SITE_URL and leaves a custom host alone", () => {
    expect(
      convexSiteOrigin({
        CONVEX_SITE_URL: "https://shortcuts.example/ignored",
        VITE_CONVEX_URL: "https://happy-animal-123.convex.cloud",
      }),
    ).toBe("https://shortcuts.example");
  });

  test("returns null when no absolute http(s) URL is configured", () => {
    expect(convexSiteOrigin({})).toBeNull();
    expect(convexSiteOrigin({ VITE_CONVEX_URL: "convex.cloud" })).toBeNull();
  });
});

describe("forward location", () => {
  test("allows /unknown and http(s), and drops anything else", () => {
    expect(forwardLocation("/unknown")).toBe("/unknown");
    expect(forwardLocation("https://example.com/secret-destination")).toBe(
      "https://example.com/secret-destination",
    );
    expect(forwardLocation("http://example.com/plain")).toBe(
      "http://example.com/plain",
    );
    expect(forwardLocation("javascript:alert(1)")).toBeNull();
    expect(forwardLocation("https://user:pass@example.com/secret")).toBeNull();
    expect(forwardLocation("/handbook")).toBeNull();
    expect(forwardLocation(null)).toBeNull();
  });
});
