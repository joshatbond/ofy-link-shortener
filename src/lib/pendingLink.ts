/**
 * A landing-page start that still needs a session.
 *
 * The destination and the QR choice live in sessionStorage so the Google
 * round trip and the `/dashboard` redirect can drop query strings without
 * losing the draft. The draft is not stored only in the URL.
 */

export type PendingLinkDraft = {
  destination: string;
  qr: boolean;
};

export type OpenedLink = {
  linkId: string;
  slug: string;
  qr: boolean;
};

export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const PENDING_KEY = "shortcuts.pendingLink";
const OPENED_KEY = "shortcuts.openedLink";

export function savePendingLink(
  store: KeyValueStore,
  draft: PendingLinkDraft,
): void {
  store.setItem(PENDING_KEY, JSON.stringify(draft));
}

export function readPendingLink(store: KeyValueStore): PendingLinkDraft | null {
  return readJson(store, PENDING_KEY, isPendingLinkDraft);
}

export function takePendingLink(store: KeyValueStore): PendingLinkDraft | null {
  const draft = readPendingLink(store);
  if (draft !== null) {
    store.removeItem(PENDING_KEY);
  }
  return draft;
}

export function clearPendingLink(store: KeyValueStore): void {
  store.removeItem(PENDING_KEY);
}

export function saveOpenedLink(store: KeyValueStore, opened: OpenedLink): void {
  store.setItem(OPENED_KEY, JSON.stringify(opened));
}

export function readOpenedLink(store: KeyValueStore): OpenedLink | null {
  return readJson(store, OPENED_KEY, isOpenedLink);
}

export function clearOpenedLink(store: KeyValueStore): void {
  store.removeItem(OPENED_KEY);
}

export function browserKeyValueStore(): KeyValueStore | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  return sessionStorage;
}

function readJson<T>(
  store: KeyValueStore,
  key: string,
  accept: (value: unknown) => value is T,
): T | null {
  const raw = store.getItem(key);
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (accept(parsed)) {
      return parsed;
    }
  } catch {
    // Drop values this app did not write.
  }

  store.removeItem(key);
  return null;
}

function isPendingLinkDraft(value: unknown): value is PendingLinkDraft {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.destination === "string" && typeof record.qr === "boolean";
}

function isOpenedLink(value: unknown): value is OpenedLink {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.linkId === "string" &&
    record.linkId.length > 0 &&
    typeof record.slug === "string" &&
    /^[A-Za-z0-9]{5}$/.test(record.slug) &&
    typeof record.qr === "boolean"
  );
}
