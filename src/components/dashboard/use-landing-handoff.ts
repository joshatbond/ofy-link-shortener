import { useEffect, useRef, useState } from "react";
import { createGeneratedLink } from "../../lib/createGeneratedLink";
import { randomGeneratedSlug } from "../../lib/generatedSlug";
import {
  beginPendingLinkCreate,
  landingHandoffGeneration,
} from "../../lib/landingHandoff";
import { mutationErrorMessage } from "../../lib/dashboardLinks";
import {
  browserKeyValueStore,
  clearOpenedLink,
  readOpenedLink,
  saveOpenedLink,
  type OpenedLink,
} from "../../lib/pendingLink";

/**
 * After sign-in, turn a landing draft into a link and open its dialog.
 * A link already created on `/home` is restored from sessionStorage.
 */
export function useLandingHandoff(
  createLink: (args: { slug: string; redirectUrl: string }) => Promise<string>,
) {
  const [opened, setOpened] = useState<OpenedLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createRef = useRef(createLink);
  createRef.current = createLink;

  useEffect(() => {
    const store = browserKeyValueStore();
    if (store === null) {
      return;
    }

    const startedGeneration = landingHandoffGeneration();
    const existing = readOpenedLink(store);
    if (existing !== null) {
      setOpened(existing);
    }

    const pending = beginPendingLinkCreate(store, async (draft) => {
      if (landingHandoffGeneration() !== startedGeneration) {
        throw new Error("This draft was discarded.");
      }
      const created = await createGeneratedLink({
        destination: draft.destination,
        nextSlug: randomGeneratedSlug,
        create: (args) => createRef.current(args),
      });
      if (landingHandoffGeneration() !== startedGeneration) {
        throw new Error("This draft was discarded.");
      }
      const next: OpenedLink = {
        linkId: created.linkId,
        slug: created.slug,
        qr: draft.qr,
      };
      saveOpenedLink(store, next);
      return next;
    });

    if (pending === null) {
      return;
    }

    let cancelled = false;
    void pending.then(
      (next) => {
        if (!cancelled && landingHandoffGeneration() === startedGeneration) {
          setOpened(next);
        }
      },
      (reason: unknown) => {
        if (!cancelled && landingHandoffGeneration() === startedGeneration) {
          setError(mutationErrorMessage(reason));
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    const store = browserKeyValueStore();
    if (store !== null) {
      clearOpenedLink(store);
    }
    setOpened(null);
  }

  return { opened, error, dismiss };
}
