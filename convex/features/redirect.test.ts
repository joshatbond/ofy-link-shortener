/// <reference types="vite/client" />
import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { asAuthedUser, initConvexTest } from "../test.setup";
import type { ConvexTest } from "../test.setup";

const SECRET = "https://example.com/secret-destination";

async function dump(response: Response): Promise<string> {
  const headers: string[] = [];
  response.headers.forEach((value, name) => {
    headers.push(`${name}: ${value}`);
  });
  const body = await response.text();
  return `${response.status}\n${headers.join("\n")}\n${body}`;
}

function redirectUrl(slug: string): string {
  return `/redirect?slug=${encodeURIComponent(slug)}`;
}

async function ownerClient() {
  const t = initConvexTest();
  const owner = await asAuthedUser(t, {
    email: "owner@ofy.org",
    name: "Owner",
  });
  return { t, owner };
}

async function fetchSlug(t: ConvexTest, slug: string): Promise<Response> {
  return await t.fetch(redirectUrl(slug));
}

describe("public slug redirect", () => {
  test("hit: an active link 307s to the stored http(s) URL without a session", async () => {
    const { t, owner } = await ownerClient();
    const shared = await asAuthedUser(t, {
      email: "shared@ofy.org",
      name: "Shared",
    });
    const httpsId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: SECRET,
    });
    await owner.client.mutation(api.features.links.share, {
      linkId: httpsId,
      email: "shared@ofy.org",
    });
    await owner.client.mutation(api.features.links.create, {
      slug: "plain",
      redirectUrl: "http://example.com/plain",
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    const https = await fetchSlug(t, "handbook");
    expect(https.status).toBe(307);
    expect(https.headers.get("Location")).toBe(SECRET);
    const httpsDump = await dump(https);
    expect(httpsDump).not.toContain(owner.userId);
    expect(httpsDump).not.toContain(shared.userId);
    expect(httpsDump).not.toContain("owner@ofy.org");
    expect(httpsDump).not.toContain("shared@ofy.org");

    const http = await fetchSlug(t, "plain");
    expect(http.status).toBe(307);
    expect(http.headers.get("Location")).toBe("http://example.com/plain");
  });

  test("miss: an unknown slug 307s to /unknown", async () => {
    const t = initConvexTest();

    const missing = await fetchSlug(t, "missing");
    expect(missing.status).toBe(307);
    expect(missing.headers.get("Location")).toBe("/unknown");
    expect(await dump(missing)).not.toContain("http");

    const blank = await t.fetch("/redirect");
    expect(blank.status).toBe(307);
    expect(blank.headers.get("Location")).toBe("/unknown");
  });

  test("disabled: 307s to /unknown and does not include the destination", async () => {
    const { t, owner } = await ownerClient();
    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: SECRET,
    });
    await owner.client.mutation(api.features.links.disable, { linkId });

    const response = await fetchSlug(t, "handbook");
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("/unknown");
    const text = await dump(response);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain("secret-destination");
    expect(text).not.toContain(owner.userId);
    expect(text).not.toContain("owner@ofy.org");
  });

  test("expired: 307s to /unknown and does not include the destination", async () => {
    const { t, owner } = await ownerClient();
    await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: SECRET,
      expiresAt: 1,
    });

    const response = await fetchSlug(t, "handbook");
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("/unknown");
    const text = await dump(response);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain("secret-destination");
    expect(text).not.toContain(owner.userId);
  });

  test("a non-http destination is never returned", async () => {
    const t = initConvexTest();
    const destinations = [
      "javascript:alert(1)",
      "ftp://example.com/secret-file",
      "https://user:pass@example.com/secret",
    ];

    await t.run(async (ctx) => {
      const userId = await ctx.db.insert("users", {
        email: "owner@ofy.org",
      });
      for (const [index, redirectUrl] of destinations.entries()) {
        await ctx.db.insert("links", {
          ownerId: userId,
          slug: `bad-${index}`,
          redirectUrl,
          disabled: false,
        });
      }
    });

    for (const [index, destination] of destinations.entries()) {
      const response = await fetchSlug(t, `bad-${index}`);
      expect(response.status).toBe(307);
      expect(response.headers.get("Location")).toBe("/unknown");
      const text = await dump(response);
      expect(text).not.toContain(destination);
      expect(text).not.toContain("secret");
    }
  });

  test("slug lookup is case-sensitive", async () => {
    const { t, owner } = await ownerClient();
    await owner.client.mutation(api.features.links.create, {
      slug: "Handbook",
      redirectUrl: "https://example.com/upper",
    });

    const exact = await fetchSlug(t, "Handbook");
    expect(exact.status).toBe(307);
    expect(exact.headers.get("Location")).toBe("https://example.com/upper");

    const lower = await fetchSlug(t, "handbook");
    expect(lower.status).toBe(307);
    expect(lower.headers.get("Location")).toBe("/unknown");
    expect(await dump(lower)).not.toContain("https://example.com/upper");
  });
});
