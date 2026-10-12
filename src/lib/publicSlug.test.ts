import { describe, expect, test } from "vitest";
import {
  applyShortLinkQuery,
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

  test("reserved names are case-insensitive and hyphenated lookalikes stay lookups", () => {
    expect(slugFromPathname("/Login")).toBeNull();
    expect(slugFromPathname("/Login/")).toBeNull();
    expect(slugFromPathname("/HOME")).toBeNull();
    expect(slugFromPathname("/HOME/")).toBeNull();
    expect(slugFromPathname("/math")).toBeNull();
    expect(slugFromPathname("/MATH/")).toBeNull();
    expect(slugFromPathname("/Api")).toBeNull();
    expect(slugFromPathname("/Monitoring")).toBeNull();
    expect(slugFromPathname("/Favicon.ico")).toBeNull();
    expect(slugFromPathname("/Logo.PNG")).toBeNull();
    expect(slugFromPathname("/logo-png")).toBe("logo-png");
    expect(slugFromPathname("/favicon-ico")).toBe("favicon-ico");
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

describe("short-link query", () => {
  test("adds a param to a bare destination", () => {
    const location = applyShortLinkQuery(
      "https://example.com/stored",
      new URL("https://sc.ofys.org/Handbook?ref=1"),
    );

    expect(location).toBe("https://example.com/stored?ref=1");
    const url = new URL(location);
    expect(url.origin).toBe("https://example.com");
    expect(url.pathname).toBe("/stored");
  });

  test("merges with an existing destination query", () => {
    const url = new URL(
      applyShortLinkQuery(
        "https://example.com/stored?utm=dest",
        new URL("https://sc.ofys.org/Handbook?ref=1"),
      ),
    );

    expect(url.origin).toBe("https://example.com");
    expect(url.pathname).toBe("/stored");
    expect(url.searchParams.get("utm")).toBe("dest");
    expect(url.searchParams.get("ref")).toBe("1");
    expect(url.hash).toBe("");
  });

  test("short-link values replace the same destination key", () => {
    const url = new URL(
      applyShortLinkQuery(
        "https://example.com/stored?ref=old&other=1",
        new URL("https://sc.ofys.org/Handbook?ref=1"),
      ),
    );

    expect(url.origin).toBe("https://example.com");
    expect(url.pathname).toBe("/stored");
    expect(url.searchParams.getAll("ref")).toEqual(["1"]);
    expect(url.searchParams.get("other")).toBe("1");
  });

  test("passes repeated keys", () => {
    const url = new URL(
      applyShortLinkQuery(
        "https://example.com/stored?tag=keep&color=blue",
        new URL("https://sc.ofys.org/Handbook?tag=a&tag=b"),
      ),
    );

    expect(url.origin).toBe("https://example.com");
    expect(url.pathname).toBe("/stored");
    expect(url.searchParams.getAll("tag")).toEqual(["a", "b"]);
    expect(url.searchParams.get("color")).toBe("blue");
  });

  test("preserves the destination hash", () => {
    expect(
      applyShortLinkQuery(
        "https://example.com/stored?a=1#section",
        new URL("https://sc.ofys.org/Handbook?ref=1"),
      ),
    ).toBe("https://example.com/stored?a=1&ref=1#section");
  });

  test("an empty query leaves the destination unchanged", () => {
    const location = "https://example.com/stored?a=1#section";
    expect(
      applyShortLinkQuery(location, new URL("https://sc.ofys.org/Handbook")),
    ).toBe(location);
    expect(
      applyShortLinkQuery(location, new URL("https://sc.ofys.org/Handbook?")),
    ).toBe(location);
  });

  test("encodes CR and LF so a param cannot inject headers", () => {
    const location = applyShortLinkQuery(
      "https://example.com/stored",
      new URL("https://sc.ofys.org/Handbook?ref=1%0D%0ASet-Cookie:%20evil"),
    );

    expect(location).not.toMatch(/[\u0000\r\n]/);
    const url = new URL(location);
    expect(url.origin).toBe("https://example.com");
    expect(url.pathname).toBe("/stored");
    expect(url.searchParams.get("ref")).toBe("1\r\nSet-Cookie: evil");
  });

  test("does not add a query to /unknown", () => {
    expect(
      applyShortLinkQuery(
        "/unknown",
        new URL("https://sc.ofys.org/missing?ref=1"),
      ),
    ).toBe("/unknown");
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
