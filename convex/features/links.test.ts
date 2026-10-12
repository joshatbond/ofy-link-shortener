/// <reference types="vite/client" />
import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import { asAuthedUser, initConvexTest } from "../test.setup";

const RESERVED_SLUGS = [
  "login",
  "dashboard",
  "home",
  "unknown",
  "math",
  "api",
  "monitoring",
  "assets",
  "favicon.ico",
  "logo.png",
] as const;

async function twoMembers() {
  const t = initConvexTest();
  const owner = await asAuthedUser(t, {
    email: "owner@ofy.org",
    name: "Owner",
  });
  const other = await asAuthedUser(t, {
    email: "other@ofy.org",
    name: "Other",
  });
  return { t, owner, other };
}

describe("link rules", () => {
  test("an unauthenticated caller cannot list or create links", async () => {
    const t = initConvexTest();

    await expect(t.query(api.features.links.listMine, {})).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.mutation(api.features.links.create, {
        slug: "handbook",
        redirectUrl: "https://example.com/handbook",
      }),
    ).rejects.toThrow(/Not authenticated/);
  });

  test("a non-@ofy.org account cannot create a link", async () => {
    const t = initConvexTest();
    const outsider = await asAuthedUser(t, { email: "outsider@gmail.com" });

    await expect(
      outsider.client.mutation(api.features.links.create, {
        slug: "handbook",
        redirectUrl: "https://example.com/handbook",
      }),
    ).rejects.toThrow(/@ofy.org/);
  });

  test("create stores the signed-in user as owner and keeps expiry on the document", async () => {
    const { owner } = await twoMembers();

    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: " https://example.com/handbook ",
      description: " Staff handbook ",
      expiresAt: 1,
    });

    const link = await owner.client.query(api.features.links.get, { linkId });
    expect(link).toMatchObject({
      _id: linkId,
      ownerId: owner.userId,
      slug: "handbook",
      redirectUrl: "https://example.com/handbook",
      description: "Staff handbook",
      disabled: false,
      expiresAt: 1,
      access: "owner",
      shares: [],
    });

    const mine = await owner.client.query(api.features.links.listMine, {});
    expect(mine).toEqual([
      expect.objectContaining({
        _id: linkId,
        ownerId: owner.userId,
        slug: "handbook",
        redirectUrl: "https://example.com/handbook",
        description: "Staff handbook",
        disabled: false,
        expiresAt: 1,
      }),
    ]);
  });

  test("http and https destinations are accepted", async () => {
    const { owner } = await twoMembers();

    const httpsId = await owner.client.mutation(api.features.links.create, {
      slug: "secure",
      redirectUrl: "https://example.com/a",
    });
    const httpId = await owner.client.mutation(api.features.links.create, {
      slug: "plain",
      redirectUrl: "http://localhost:3000/path?q=1",
    });

    expect(
      await owner.client.query(api.features.links.get, { linkId: httpsId }),
    ).toMatchObject({ redirectUrl: "https://example.com/a" });
    expect(
      await owner.client.query(api.features.links.get, { linkId: httpId }),
    ).toMatchObject({ redirectUrl: "http://localhost:3000/path?q=1" });
  });

  test.each([
    "ftp://example.com",
    "javascript:alert(1)",
    "example.com",
    "https://",
    "",
    "   ",
  ])("rejects destination %j", async (redirectUrl) => {
    const { owner } = await twoMembers();

    await expect(
      owner.client.mutation(api.features.links.create, {
        slug: "ok-slug",
        redirectUrl,
      }),
    ).rejects.toThrow(/http or https/);
  });

  test.each(["", "   ", "a/b", "/handbook", "handbook/"])(
    "rejects slug %j",
    async (slug) => {
      const { owner } = await twoMembers();

      await expect(
        owner.client.mutation(api.features.links.create, {
          slug,
          redirectUrl: "https://example.com",
        }),
      ).rejects.toThrow(/slug/i);
    },
  );

  test.each(RESERVED_SLUGS)("rejects reserved slug %s", async (slug) => {
    const { owner } = await twoMembers();

    await expect(
      owner.client.mutation(api.features.links.create, {
        slug: slug.toUpperCase(),
        redirectUrl: "https://example.com",
      }),
    ).rejects.toThrow(/reserved/i);
  });

  test("slug is unique across owners", async () => {
    const { owner, other } = await twoMembers();

    await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: "https://example.com/a",
    });

    await expect(
      other.client.mutation(api.features.links.create, {
        slug: "handbook",
        redirectUrl: "https://example.com/b",
      }),
    ).rejects.toThrow(/already in use/i);

    await expect(
      owner.client.mutation(api.features.links.create, {
        slug: "handbook",
        redirectUrl: "https://example.com/c",
      }),
    ).rejects.toThrow(/already in use/i);
  });

  test("owner can update, disable, and delete", async () => {
    const { owner } = await twoMembers();
    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: "https://example.com/old",
      description: "Old",
      expiresAt: 1,
    });

    await owner.client.mutation(api.features.links.update, {
      linkId,
      slug: "staff",
      redirectUrl: "https://example.com/new",
      description: null,
      expiresAt: null,
    });
    await owner.client.mutation(api.features.links.disable, { linkId });
    expect(
      await owner.client.query(api.features.links.get, { linkId }),
    ).toMatchObject({ disabled: true });

    await owner.client.mutation(api.features.links.update, {
      linkId,
      disabled: false,
    });
    expect(
      await owner.client.query(api.features.links.get, { linkId }),
    ).toMatchObject({
      slug: "staff",
      redirectUrl: "https://example.com/new",
      disabled: false,
    });
    await owner.client.mutation(api.features.links.disable, { linkId });
    expect(
      await owner.client.query(api.features.links.get, { linkId }),
    ).not.toHaveProperty("description");
    expect(
      await owner.client.query(api.features.links.get, { linkId }),
    ).not.toHaveProperty("expiresAt");

    const listed = await owner.client.query(api.features.links.listMine, {});
    expect(listed.map((link) => link.slug)).toEqual(["staff"]);
    expect(listed[0]?.disabled).toBe(true);

    await owner.client.mutation(api.features.links.deleteLink, { linkId });
    expect(await owner.client.query(api.features.links.get, { linkId })).toBeNull();
    expect(await owner.client.query(api.features.links.listMine, {})).toEqual([]);

    const reused = await owner.client.mutation(api.features.links.create, {
      slug: "staff",
      redirectUrl: "https://example.com/again",
    });
    expect(reused).not.toBe(linkId);
  });

  test("update rejects a reserved or taken slug and a non-http destination", async () => {
    const { owner, other } = await twoMembers();
    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: "https://example.com/a",
    });
    await other.client.mutation(api.features.links.create, {
      slug: "taken",
      redirectUrl: "https://example.com/b",
    });

    await expect(
      owner.client.mutation(api.features.links.update, {
        linkId,
        slug: "login",
      }),
    ).rejects.toThrow(/reserved/i);
    await expect(
      owner.client.mutation(api.features.links.update, {
        linkId,
        slug: "taken",
      }),
    ).rejects.toThrow(/already in use/i);
    await expect(
      owner.client.mutation(api.features.links.update, {
        linkId,
        redirectUrl: "javascript:alert(1)",
      }),
    ).rejects.toThrow(/http or https/);

    expect(await owner.client.query(api.features.links.get, { linkId })).toMatchObject({
      slug: "handbook",
      redirectUrl: "https://example.com/a",
    });
  });

  test("listMine is newest first and does not include someone else's links", async () => {
    const { owner, other } = await twoMembers();
    await owner.client.mutation(api.features.links.create, {
      slug: "older",
      redirectUrl: "https://example.com/older",
    });
    await owner.client.mutation(api.features.links.create, {
      slug: "newer",
      redirectUrl: "https://example.com/newer",
    });
    await other.client.mutation(api.features.links.create, {
      slug: "theirs",
      redirectUrl: "https://example.com/theirs",
    });

    const mine = await owner.client.query(api.features.links.listMine, {});
    expect(mine.map((link) => link.slug)).toEqual(["newer", "older"]);
  });
});

describe("link shares", () => {
  test("a second user cannot read or edit an unshared link, and can view but not change it after a share", async () => {
    const t = initConvexTest();
    const owner = await asAuthedUser(t, {
      email: "owner@ofy.org",
      name: "Owner",
    });
    const second = await asAuthedUser(t, {
      email: "second@ofy.org",
      name: "Second",
    });
    const third = await asAuthedUser(t, {
      email: "third@ofy.org",
      name: "Third",
    });

    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: "https://example.com/handbook",
      description: "Staff handbook",
      expiresAt: 1,
    });

    expect(await second.client.query(api.features.links.get, { linkId })).toBeNull();
    expect(await second.client.query(api.features.links.listMine, {})).toEqual([]);
    expect(
      await second.client.query(api.features.links.listSharedWithMe, {}),
    ).toEqual([]);
    await expect(
      second.client.mutation(api.features.links.update, {
        linkId,
        slug: "hijack",
      }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.disable, { linkId }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.deleteLink, { linkId }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.share, {
        linkId,
        email: "third@ofy.org",
      }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.unshare, {
        linkId,
        email: "owner@ofy.org",
      }),
    ).rejects.toThrow(/Link not found/);

    await owner.client.mutation(api.features.links.share, {
      linkId,
      email: "Second@OFY.org",
    });
    await owner.client.mutation(api.features.links.share, {
      linkId,
      email: "second@ofy.org",
    });

    const sharedView = await second.client.query(api.features.links.get, {
      linkId,
    });
    expect(sharedView).toEqual({
      _id: linkId,
      _creationTime: expect.any(Number) as number,
      ownerId: owner.userId,
      slug: "handbook",
      redirectUrl: "https://example.com/handbook",
      description: "Staff handbook",
      disabled: false,
      expiresAt: 1,
      access: "shared",
    });
    expect(sharedView).not.toHaveProperty("shares");

    expect(await second.client.query(api.features.links.listMine, {})).toEqual([]);
    expect(
      await second.client.query(api.features.links.listSharedWithMe, {}),
    ).toEqual([
      expect.objectContaining({
        _id: linkId,
        slug: "handbook",
        ownerId: owner.userId,
        expiresAt: 1,
        disabled: false,
      }),
    ]);

    const ownerView = await owner.client.query(api.features.links.get, {
      linkId,
    });
    expect(ownerView).toMatchObject({
      access: "owner",
      shares: [{ userId: second.userId, email: "second@ofy.org" }],
    });

    await expect(
      second.client.mutation(api.features.links.update, {
        linkId,
        redirectUrl: "https://evil.example",
      }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.disable, { linkId }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.deleteLink, { linkId }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.share, {
        linkId,
        email: "third@ofy.org",
      }),
    ).rejects.toThrow(/Link not found/);
    await expect(
      second.client.mutation(api.features.links.unshare, {
        linkId,
        email: "second@ofy.org",
      }),
    ).rejects.toThrow(/Link not found/);

    expect(await owner.client.query(api.features.links.get, { linkId })).toMatchObject({
      slug: "handbook",
      redirectUrl: "https://example.com/handbook",
      disabled: false,
      shares: [{ userId: second.userId, email: "second@ofy.org" }],
    });

    expect(await third.client.query(api.features.links.listMine, {})).toEqual([]);
    expect(
      await third.client.query(api.features.links.listSharedWithMe, {}),
    ).toEqual([]);
    expect(await third.client.query(api.features.links.get, { linkId })).toBeNull();

    await owner.client.mutation(api.features.links.unshare, {
      linkId,
      email: "second@ofy.org",
    });
    expect(await second.client.query(api.features.links.get, { linkId })).toBeNull();
    expect(
      await second.client.query(api.features.links.listSharedWithMe, {}),
    ).toEqual([]);
  });

  test("share target must be another existing @ofy.org user", async () => {
    const t = initConvexTest();
    const owner = await asAuthedUser(t, { email: "owner@ofy.org" });
    await asAuthedUser(t, { email: "outsider@gmail.com" });
    const linkId = await owner.client.mutation(api.features.links.create, {
      slug: "handbook",
      redirectUrl: "https://example.com/handbook",
    });

    await expect(
      owner.client.mutation(api.features.links.share, {
        linkId,
        email: "owner@ofy.org",
      }),
    ).rejects.toThrow(/yourself/i);
    await expect(
      owner.client.mutation(api.features.links.share, {
        linkId,
        email: "outsider@gmail.com",
      }),
    ).rejects.toThrow(/@ofy.org/);
    await expect(
      owner.client.mutation(api.features.links.share, {
        linkId,
        email: "missing@ofy.org",
      }),
    ).rejects.toThrow(/No user with that email/);
  });
});
