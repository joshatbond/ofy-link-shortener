import { afterEach, describe, expect, test } from "vitest";
import {
  abandonLandingHandoff,
  beginPendingLinkCreate,
  resetLandingHandoffForTests,
} from "./landingHandoff";
import {
  readOpenedLink,
  readPendingLink,
  saveOpenedLink,
  savePendingLink,
  type KeyValueStore,
} from "./pendingLink";

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

  test("keeps the draft until create settles", async () => {
    const store = memoryStore();
    const draft = {
      destination: "https://example.com/handbook",
      qr: false,
    };
    savePendingLink(store, draft);

    let release: (opened: { linkId: string; slug: string; qr: boolean }) => void =
      () => {};
    const gate = new Promise<{ linkId: string; slug: string; qr: boolean }>(
      (resolve) => {
        release = resolve;
      },
    );
    const pending = beginPendingLinkCreate(store, () => gate);

    expect(readPendingLink(store)).toEqual(draft);
    release({ linkId: "links:new", slug: "Ab3xY", qr: false });
    await pending;
    expect(readPendingLink(store)).toBeNull();
  });

  test("a failed create discards the draft instead of retrying it", async () => {
    const store = memoryStore();
    savePendingLink(store, {
      destination: "https://example.com/notes",
      qr: true,
    });

    await expect(
      beginPendingLinkCreate(store, async () => {
        throw new Error("Enter an http or https URL.");
      }),
    ).rejects.toThrow("Enter an http or https URL.");
    expect(readPendingLink(store)).toBeNull();

    let calls = 0;
    expect(
      beginPendingLinkCreate(store, async () => {
        calls += 1;
        return { linkId: "links:new", slug: "Ab3xY", qr: true };
      }),
    ).toBeNull();
    expect(calls).toBe(0);
  });

  test("sign-out drops the draft and the opened link without erasing a later draft", async () => {
    const store = memoryStore();
    savePendingLink(store, {
      destination: "https://example.com/old",
      qr: false,
    });
    saveOpenedLink(store, {
      linkId: "links:old",
      slug: "Ab3xY",
      qr: false,
    });

    let release: (opened: { linkId: string; slug: string; qr: boolean }) => void =
      () => {};
    const gate = new Promise<{ linkId: string; slug: string; qr: boolean }>(
      (resolve) => {
        release = resolve;
      },
    );
    const first = beginPendingLinkCreate(store, () => gate);
    abandonLandingHandoff(store);

    expect(readPendingLink(store)).toBeNull();
    expect(readOpenedLink(store)).toBeNull();

    savePendingLink(store, {
      destination: "https://example.com/new",
      qr: true,
    });
    release({ linkId: "links:old", slug: "Ab3xY", qr: false });
    await first;

    expect(readPendingLink(store)).toEqual({
      destination: "https://example.com/new",
      qr: true,
    });
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
