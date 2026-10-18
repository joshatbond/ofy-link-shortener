import {
  clearOpenedLink,
  clearPendingLink,
  readPendingLink,
  type KeyValueStore,
  type OpenedLink,
  type PendingLinkDraft,
} from "./pendingLink";

/**
 * One in-flight redemption of the landing draft.
 * React Strict Mode runs the effect twice; the second call must not create
 * a second link. The draft stays until create settles. Sign-out abandons
 * it so the next session in this tab does not inherit the link.
 */
let inflight: Promise<OpenedLink> | null = null;
let generation = 0;

export function resetLandingHandoffForTests(): void {
  inflight = null;
  generation = 0;
}

export function landingHandoffGeneration(): number {
  return generation;
}

/**
 * Drop the draft and the success dialog for this tab.
 * A create that is already running must not write them back.
 */
export function abandonLandingHandoff(store: KeyValueStore): void {
  generation += 1;
  inflight = null;
  clearPendingLink(store);
  clearOpenedLink(store);
}

export function beginPendingLinkCreate(
  store: KeyValueStore,
  create: (draft: PendingLinkDraft) => Promise<OpenedLink>,
): Promise<OpenedLink> | null {
  if (inflight !== null) {
    return inflight;
  }

  const draft = readPendingLink(store);
  if (draft === null) {
    return null;
  }

  const startedGeneration = generation;
  const pending = create(draft).then(
    (opened) => {
      if (generation === startedGeneration) {
        clearPendingLink(store);
      }
      return opened;
    },
    (error: unknown) => {
      if (generation === startedGeneration) {
        clearPendingLink(store);
      }
      throw error;
    },
  );
  const tracked = pending.finally(() => {
    if (inflight === tracked) {
      inflight = null;
    }
  });
  inflight = tracked;
  return tracked;
}
