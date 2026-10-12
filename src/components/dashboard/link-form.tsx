import { useState } from "react";
import {
  mutationErrorMessage,
  slugFieldMessage,
  type LinkDraft,
} from "../../lib/dashboardLinks";

const inputClass = "rounded bg-neutral-900 px-2 py-1 text-neutral-50";
const primaryButtonClass =
  "rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60";
const quietButtonClass =
  "rounded border border-neutral-600 px-3 py-2 text-sm disabled:opacity-60";

export function LinkForm(props: {
  heading: string;
  submitLabel: string;
  pendingLabel: string;
  initial: LinkDraft;
  expiryHint: string;
  onSubmit: (draft: LinkDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(props.initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const slugMessage = slugFieldMessage(draft.slug);

  return (
    <form
      className="space-y-3 rounded-md border border-neutral-700 bg-neutral-950 p-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <h3 className="text-lg">{props.heading}</h3>
      <label className="flex flex-col gap-1 text-sm">
        <span>Slug</span>
        <input
          className={inputClass}
          value={draft.slug}
          onChange={(event) => setField("slug", event.target.value)}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
        />
        <span className="text-neutral-500">
          Letters, digits, and hyphens. Spaces become hyphens. Case is kept.
        </span>
        {slugMessage !== null ? (
          <span
            className={
              slugMessage.tone === "error" ? "text-red-300" : "text-neutral-400"
            }
          >
            {slugMessage.text}
          </span>
        ) : null}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Destination</span>
        <input
          className={inputClass}
          value={draft.redirectUrl}
          onChange={(event) => setField("redirectUrl", event.target.value)}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Description (optional)</span>
        <input
          className={inputClass}
          value={draft.description}
          onChange={(event) => setField("description", event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Expiry (optional)</span>
        <input
          className={`${inputClass} scheme-dark`}
          type="datetime-local"
          value={draft.expiresAt}
          onChange={(event) => setField("expiresAt", event.target.value)}
        />
        <span className="text-neutral-500">{props.expiryHint}</span>
      </label>
      {error !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryButtonClass} disabled={pending}>
          {pending ? props.pendingLabel : props.submitLabel}
        </button>
        <button
          type="button"
          className={quietButtonClass}
          disabled={pending}
          onClick={props.onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  function setField<Key extends keyof LinkDraft>(key: Key, value: LinkDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setPending(true);

    try {
      await props.onSubmit(draft);
    } catch (submitError) {
      setError(mutationErrorMessage(submitError));
    } finally {
      setPending(false);
    }
  }
}
