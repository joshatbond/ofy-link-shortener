import { afterEach, describe, expect, test } from "vitest";
import { beginPendingLinkCreate, resetLandingHandoffForTests } from "./landingHandoff";
import { readPendingLink, savePendingLink, type KeyValueStore } from "./pendingLink";

function memoryStore(): KeyValueStore {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
}

afterEach(() => {
  resetLandingHandoffForTests();
});

describe("beginPendingLinkCreate", () => {
  test("a second start while the first is running does not create twice", async () => {
    const store = memoryStore();
    savePendingLink(store, {
      destination: "https://example.com/handbook",
      qr: true,
    });

    let calls = 0;
    const create = async () => {
      calls += 1;
      await Promise.resolve();
      return { linkId: "links:new", slug: "Ab3xY", qr: true };
    };

    const first = beginPendingLinkCreate(store, create);
    const second = beginPendingLinkCreate(store, create);

    expect(second).toBe(first);
    await expect(first).resolves.toEqual({
      linkId: "links:new",
      slug: "Ab3xY",
      qr: true,
    });
    expect(calls).toBe(1);
    expect(readPendingLink(store)).toBeNull();
  });

  test("no draft does not call create", () => {
    let calls = 0;
    expect(
      beginPendingLinkCreate(memoryStore(), async () => {
        calls += 1;
        return { linkId: "links:new", slug: "Ab3xY", qr: false };
      }),
    ).toBeNull();
    expect(calls).toBe(0);
  });
});
