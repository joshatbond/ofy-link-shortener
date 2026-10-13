import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { mutationErrorMessage } from "../../lib/dashboardLinks";

const inputClass = "rounded bg-neutral-900 px-2 py-1 text-neutral-50";
const primaryButtonClass =
  "rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60";
const quietButtonClass =
  "rounded border border-neutral-600 px-3 py-2 text-sm disabled:opacity-60";

export function ShareManager(props: {
  linkId: Id<"links">;
  slug: string;
  onClose: () => void;
}) {
  const view = useQuery(api.features.links.get, { linkId: props.linkId });
  const shareLink = useMutation(api.features.links.share);
  const unshareLink = useMutation(api.features.links.unshare);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<"add" | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="space-y-3 rounded-md border border-neutral-700 bg-neutral-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg">Shares for {props.slug}</h3>
          <p className="text-sm text-neutral-400">
            Sharing is view only, with someone who already has an @ofy.org
            account.
          </p>
        </div>
        <button type="button" className={quietButtonClass} onClick={props.onClose}>
          Close
        </button>
      </div>

      {view === undefined ? (
        <p className="text-sm text-neutral-400">Loading shares…</p>
      ) : view === null || view.access !== "owner" ? (
        <p className="text-sm text-neutral-400">
          You can view this link only.
        </p>
      ) : (
        <>
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void handleShare();
            }}
          >
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span>Email</span>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                autoComplete="off"
                placeholder="name@ofy.org"
                required
              />
            </label>
            <button
              type="submit"
              className={primaryButtonClass}
              disabled={pending !== null || email.trim().length === 0}
            >
              {pending === "add" ? "Sharing…" : "Share"}
            </button>
          </form>
          {view.shares.length === 0 ? (
            <p className="text-sm text-neutral-400">Not shared yet.</p>
          ) : (
            <ul className="space-y-2">
              {view.shares.map((share) => (
                <li
                  key={share.userId}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="break-all">{share.email}</span>
                  <button
                    type="button"
                    className={quietButtonClass}
                    disabled={pending !== null}
                    onClick={() => void handleUnshare(share.email)}
                  >
                    {pending === share.email ? "Removing…" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {error !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </section>
  );

  async function handleShare() {
    setError(null);
    setPending("add");

    try {
      await shareLink({ linkId: props.linkId, email });
      setEmail("");
    } catch (shareError) {
      setError(mutationErrorMessage(shareError));
    } finally {
      setPending(null);
    }
  }

  async function handleUnshare(sharedEmail: string) {
    setError(null);
    setPending(sharedEmail);

    try {
      await unshareLink({ linkId: props.linkId, email: sharedEmail });
    } catch (unshareError) {
      setError(mutationErrorMessage(unshareError));
    } finally {
      setPending(null);
    }
  }
}
