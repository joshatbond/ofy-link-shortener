import {
  takePendingLink,
  type KeyValueStore,
  type OpenedLink,
  type PendingLinkDraft,
} from "./pendingLink";

/**
 * One in-flight redemption of the landing draft.
 * React Strict Mode runs the effect twice; the second call must not create
 * a second link after the first call already took the draft.
 */
let inflight: Promise<OpenedLink> | null = null;

export function resetLandingHandoffForTests(): void {
  inflight = null;
}

export function beginPendingLinkCreate(
  store: KeyValueStore,
  create: (draft: PendingLinkDraft) => Promise<OpenedLink>,
): Promise<OpenedLink> | null {
  if (inflight !== null) {
    return inflight;
  }

  const draft = takePendingLink(store);
  if (draft === null) {
    return null;
  }

  const pending = create(draft).finally(() => {
    inflight = null;
  });
  inflight = pending;
  return pending;
}
