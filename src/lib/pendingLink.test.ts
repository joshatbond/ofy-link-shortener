import { describe, expect, test } from "vitest";
import {
  clearOpenedLink,
  readOpenedLink,
  readPendingLink,
  saveOpenedLink,
  savePendingLink,
  takePendingLink,
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

describe("pending link draft", () => {
  test("keeps the destination and QR choice without a query string", () => {
    const store = memoryStore();
    savePendingLink(store, {
      destination: "https://example.com/handbook",
      qr: true,
    });

    expect(readPendingLink(store)).toEqual({
      destination: "https://example.com/handbook",
      qr: true,
    });
    expect(store.getItem("shortcuts.pendingLink")).not.toContain("?");
  });

  test("take removes the draft so a second read is empty", () => {
    const store = memoryStore();
    savePendingLink(store, {
      destination: "https://example.com/notes",
      qr: false,
    });

    expect(takePendingLink(store)?.destination).toBe("https://example.com/notes");
    expect(readPendingLink(store)).toBeNull();
    expect(takePendingLink(store)).toBeNull();
  });

  test("drops a corrupt draft", () => {
    const store = memoryStore();
    store.setItem("shortcuts.pendingLink", "{");
    expect(readPendingLink(store)).toBeNull();
    expect(store.getItem("shortcuts.pendingLink")).toBeNull();
  });
});

describe("opened link", () => {
  test("remembers the created link until it is cleared", () => {
    const store = memoryStore();
    saveOpenedLink(store, {
      linkId: "links:abc",
      slug: "Ab3xY",
      qr: true,
    });

    expect(readOpenedLink(store)).toEqual({
      linkId: "links:abc",
      slug: "Ab3xY",
      qr: true,
    });

    clearOpenedLink(store);
    expect(readOpenedLink(store)).toBeNull();
  });

  test("rejects a slug that is not the 5-character landing slug", () => {
    const store = memoryStore();
    store.setItem(
      "shortcuts.openedLink",
      JSON.stringify({ linkId: "links:abc", slug: "handbook", qr: false }),
    );
    expect(readOpenedLink(store)).toBeNull();
  });
});
