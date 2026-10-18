import { useEffect, useRef, useState } from "react";
import { createGeneratedLink } from "../../lib/createGeneratedLink";
import { randomGeneratedSlug } from "../../lib/generatedSlug";
import { beginPendingLinkCreate } from "../../lib/landingHandoff";
import { mutationErrorMessage } from "../../lib/dashboardLinks";
import {
  browserKeyValueStore,
  clearOpenedLink,
  readOpenedLink,
  saveOpenedLink,
  savePendingLink,
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

    const existing = readOpenedLink(store);
    if (existing !== null) {
      setOpened(existing);
    }

    const pending = beginPendingLinkCreate(store, async (draft) => {
      try {
        const created = await createGeneratedLink({
          destination: draft.destination,
          nextSlug: randomGeneratedSlug,
          create: (args) => createRef.current(args),
        });
        const next: OpenedLink = {
          linkId: created.linkId,
          slug: created.slug,
          qr: draft.qr,
        };
        saveOpenedLink(store, next);
        return next;
      } catch (error) {
        savePendingLink(store, draft);
        throw error;
      }
    });

    if (pending === null) {
      return;
    }

    let cancelled = false;
    void pending.then(
      (next) => {
        if (!cancelled) {
          setOpened(next);
        }
      },
      (reason: unknown) => {
        if (!cancelled) {
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
