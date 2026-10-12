// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import middleware from "../../middleware";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Same shape `@vercel/routing-utils` `pathToRegexp("316", matcher)` returns:
 * slashes escaped, case-insensitive, one optional trailing slash, hash, or query.
 */
function vercelMiddlewareRegexp(matcher: string): RegExp {
  const body = matcher.slice(1).replaceAll("/", "\\/");
  return new RegExp(`^(?:\\/${body})[\\/#\\?]?$`, "i");
}

function matcherLiteral(): string {
  const source = readFileSync(resolve(root, "middleware.ts"), "utf8");
  const match = source.match(/matcher:\s*\[\s*"((?:\\.|[^"\\])*)"\s*\]/);
  const literal = match?.[1];
  if (literal === undefined) {
    throw new Error("middleware.ts is missing a string matcher literal.");
  }
  return JSON.parse(`"${literal}"`) as string;
}

describe("middleware matcher", () => {
  test("matches favicon.ico and logo.png literally", () => {
    const regexp = vercelMiddlewareRegexp(matcherLiteral());

    expect(regexp.test("/logo-png")).toBe(true);
    expect(regexp.test("/logo-png/")).toBe(true);
    expect(regexp.test("/favicon-ico")).toBe(true);
    expect(regexp.test("/favicon-ico/")).toBe(true);
    expect(regexp.test("/logo.png")).toBe(false);
    expect(regexp.test("/favicon.ico")).toBe(false);
    expect(regexp.test("/LOGO.PNG")).toBe(false);
    expect(regexp.test("/assets/app.js")).toBe(false);
    expect(regexp.test("/Login")).toBe(true);
    expect(regexp.test("/handbook")).toBe(true);
  });

  test("the matcher is only declared on the proxy entrypoint", () => {
    const vercel = JSON.parse(
      readFileSync(resolve(root, "vercel.json"), "utf8"),
    ) as { proxy?: { entrypoint?: string; matcher?: unknown } };

    expect(vercel.proxy?.entrypoint).toBe("middleware.ts");
    expect(vercel.proxy?.matcher).toBeUndefined();
  });
});

describe("middleware reserved paths", () => {
  test("reserved names fall through and hyphenated lookalikes redirect", async () => {
    const previousSite = process.env.CONVEX_SITE_URL;
    const previousCloud = process.env.VITE_CONVEX_URL;
    delete process.env.CONVEX_SITE_URL;
    delete process.env.VITE_CONVEX_URL;

    try {
      for (const path of ["/Login", "/HOME", "/HOME/", "/math", "/Login?ref=1"]) {
        const response = await middleware(new Request(`https://sc.ofys.org${path}`));
        expect(response.status, path).toBe(200);
        expect(response.headers.get("x-middleware-next"), path).toBe("1");
        expect(response.headers.get("Location"), path).toBeNull();
      }

      for (const path of ["/logo-png", "/favicon-ico"]) {
        const response = await middleware(new Request(`https://sc.ofys.org${path}`));
        expect(response.status, path).toBe(307);
        expect(response.headers.get("Location"), path).toBe("/unknown");
        expect(await response.text(), path).toBe("");
      }
    } finally {
      restoreEnv("CONVEX_SITE_URL", previousSite);
      restoreEnv("VITE_CONVEX_URL", previousCloud);
    }
  });
});

describe("short-link query forwarding", () => {
  test("adds the short-link query to the stored destination", async () => {
    await withLookup("https://example.com/stored", async () => {
      const response = await middleware(
        new Request("https://sc.ofys.org/Handbook?ref=1"),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe(
        "https://example.com/stored?ref=1",
      );
      expect(await response.text()).toBe("");
    });
  });

  test("an unknown slug does not forward the query", async () => {
    await withLookup("/unknown", async (calls) => {
      const response = await middleware(
        new Request("https://sc.ofys.org/missing?ref=1&dest=https://example.com/secret"),
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("/unknown");
      expect(await response.text()).toBe("");
      expect(calls.map((url) => url.searchParams.get("slug"))).toEqual([
        "missing",
      ]);
      expect(calls.every((url) => url.search === "?slug=missing")).toBe(true);
    });
  });
});

async function withLookup(
  location: string,
  run: (calls: URL[]) => Promise<void>,
): Promise<void> {
  const previousSite = process.env.CONVEX_SITE_URL;
  const previousCloud = process.env.VITE_CONVEX_URL;
  const previousFetch = globalThis.fetch;
  process.env.CONVEX_SITE_URL = "https://happy-animal-123.convex.site";
  delete process.env.VITE_CONVEX_URL;
  const calls: URL[] = [];

  globalThis.fetch = async (input, init) => {
    const href =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    calls.push(new URL(href));
    expect(init).toMatchObject({ redirect: "manual" });
    return new Response(null, {
      status: 307,
      headers: { Location: location },
    });
  };

  try {
    await run(calls);
  } finally {
    globalThis.fetch = previousFetch;
    restoreEnv("CONVEX_SITE_URL", previousSite);
    restoreEnv("VITE_CONVEX_URL", previousCloud);
  }
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
