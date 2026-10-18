import { useMutation } from "convex/react";
import { useState, type Ref } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { linkActivity, mutationErrorMessage } from "../../lib/dashboardLinks";

const quietButtonClass =
  "rounded border border-neutral-600 px-3 py-2 text-sm disabled:opacity-60";
const dangerButtonClass =
  "rounded border border-red-900 px-3 py-2 text-sm text-red-300 disabled:opacity-60";

export type DashboardLink = {
  _id: Id<"links">;
  slug: string;
  redirectUrl: string;
  description?: string;
  disabled: boolean;
  expiresAt?: number;
};

export function SharedLinkCard(props: { link: DashboardLink; now: number }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-md border border-neutral-700 bg-gradient-to-b from-neutral-900 to-neutral-950 p-4">
      <LinkSummary link={props.link} now={props.now} />
      <p className="text-sm text-neutral-500">View only</p>
    </article>
  );
}

export function OwnerLinkCard(props: {
  link: DashboardLink;
  now: number;
  editing: boolean;
  managingShares: boolean;
  onEdit: () => void;
  onShares: () => void;
  onDeleted: () => void;
  highlighted?: boolean;
  cardRef?: Ref<HTMLElement>;
}) {
  const disableLink = useMutation(api.features.links.disable);
  const updateLink = useMutation(api.features.links.update);
  const removeLink = useMutation(api.features.links.deleteLink);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, setPending] = useState<"disable" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = pending !== null;

  return (
    <article
      ref={props.cardRef}
      tabIndex={props.highlighted ? -1 : undefined}
      className={`flex h-full flex-col gap-3 rounded-md border bg-gradient-to-b from-neutral-900 to-neutral-950 p-4 outline-none focus-visible:ring-2 focus-visible:ring-neutral-100 ${
        props.highlighted || props.editing || props.managingShares
          ? "border-neutral-100"
          : "border-neutral-700"
      }`}
    >
      <LinkSummary link={props.link} now={props.now} />
      {error !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {confirmingDelete ? (
        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm text-neutral-300">Delete this link?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={dangerButtonClass}
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {pending === "delete" ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              className={quietButtonClass}
              disabled={busy}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            className={quietButtonClass}
            aria-pressed={props.editing}
            disabled={busy}
            onClick={props.onEdit}
          >
            Edit
          </button>
          <button
            type="button"
            className={quietButtonClass}
            disabled={busy}
            onClick={() => void handleDisable()}
          >
            {pending === "disable"
              ? props.link.disabled
                ? "Enabling…"
                : "Disabling…"
              : props.link.disabled
                ? "Enable"
                : "Disable"}
          </button>
          <button
            type="button"
            className={dangerButtonClass}
            disabled={busy}
            onClick={() => {
              setError(null);
              setConfirmingDelete(true);
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className={quietButtonClass}
            aria-pressed={props.managingShares}
            disabled={busy}
            onClick={props.onShares}
          >
            Shares
          </button>
        </div>
      )}
    </article>
  );

  async function handleDisable() {
    setError(null);
    setPending("disable");

    try {
      if (props.link.disabled) {
        await updateLink({ linkId: props.link._id, disabled: false });
      } else {
        await disableLink({ linkId: props.link._id });
      }
    } catch (disableError) {
      setError(mutationErrorMessage(disableError));
    } finally {
      setPending(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setPending("delete");

    try {
      await removeLink({ linkId: props.link._id });
      props.onDeleted();
    } catch (deleteError) {
      setError(mutationErrorMessage(deleteError));
      setPending(null);
    }
  }
}

function LinkSummary(props: { link: DashboardLink; now: number }) {
  const activity = linkActivity(props.link, props.now);
  const word =
    activity === "disabled"
      ? "Disabled"
      : activity === "expired"
        ? "Expired"
        : "Active";
  const expiry =
    props.link.expiresAt === undefined
      ? null
      : new Date(props.link.expiresAt).toLocaleString();

  return (
    <div className="space-y-2">
      <h3 className="break-all text-xl font-semibold">{props.link.slug}</h3>
      <p className="break-all font-mono text-sm text-neutral-500">
        /{props.link.slug}
      </p>
      {props.link.description !== undefined && props.link.description.length > 0 ? (
        <p className="text-sm text-neutral-400">{props.link.description}</p>
      ) : null}
      <a
        href={props.link.redirectUrl}
        target="_blank"
        rel="noreferrer"
        className="block break-all text-sm text-neutral-300 underline decoration-neutral-600 underline-offset-2"
      >
        {props.link.redirectUrl}
      </a>
      <p className="text-sm text-neutral-400">
        {word}
        {expiry !== null ? ` · Expires ${expiry}` : ""}
      </p>
    </div>
  );
}
