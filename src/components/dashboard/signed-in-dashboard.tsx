import { Component, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import {
  createLinkFields,
  expiryInputValue,
  filterListedLinks,
  updateLinkFields,
  type LinkDraft,
} from "../../lib/dashboardLinks";
import { SignOutButton } from "../auth/sign-out-button";
import { OwnerLinkCard, SharedLinkCard, type DashboardLink } from "./link-card";
import { LinkForm } from "./link-form";
import { ShareManager } from "./share-manager";

const primaryButtonClass =
  "rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60";
const inputClass = "w-full rounded bg-neutral-900 px-2 py-1 text-neutral-50";

const emptyDraft: LinkDraft = {
  slug: "",
  redirectUrl: "",
  description: "",
  expiresAt: "",
};

type Panel =
  | { kind: "create" }
  | { kind: "edit"; linkId: Id<"links"> }
  | { kind: "shares"; linkId: Id<"links"> };

export function SignedInDashboard() {
  return (
    <DashboardBoundary>
      <DashboardContent />
    </DashboardBoundary>
  );
}

function DashboardContent() {
  const profile = useQuery(api.features.users.viewerProfile, {});
  const mine = useQuery(api.features.links.listMine, {});
  const shared = useQuery(api.features.links.listSharedWithMe, {});
  const createLink = useMutation(api.features.links.create);
  const updateLink = useMutation(api.features.links.update);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel | null>(null);
  const now = Date.now();

  const myLinks = mine === undefined ? undefined : filterListedLinks(mine, query);
  const sharedLinks =
    shared === undefined ? undefined : filterListedLinks(shared, query);
  const editing =
    panel?.kind === "edit" ? findLink(mine, panel.linkId) : undefined;
  const sharing =
    panel?.kind === "shares" ? findLink(mine, panel.linkId) : undefined;
  const name = profile?.name?.trim() || undefined;
  const email = profile?.email?.trim() || undefined;
  const label = name ?? email ?? "Signed in.";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-neutral-400">{label}</p>
          {name !== undefined && email !== undefined ? (
            <p className="text-sm text-neutral-500">{email}</p>
          ) : null}
        </div>
        <SignOutButton />
      </div>

      <label className="flex max-w-sm flex-col gap-1 text-sm">
        <span>Search</span>
        <input
          className={inputClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Slug, destination, or description"
        />
      </label>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">My links</h2>
          <button
            type="button"
            className={primaryButtonClass}
            aria-expanded={panel?.kind === "create"}
            onClick={() =>
              setPanel((current) =>
                current?.kind === "create" ? null : { kind: "create" },
              )
            }
          >
            New link
          </button>
        </div>

        {panel?.kind === "create" ? (
          <LinkForm
            heading="New link"
            submitLabel="Create link"
            pendingLabel="Creating…"
            initial={emptyDraft}
            expiryHint="Leave blank to keep the link until you disable or delete it."
            onCancel={() => setPanel(null)}
            onSubmit={async (draft) => {
              await createLink(createLinkFields(draft));
              setPanel(null);
            }}
          />
        ) : null}

        {panel?.kind === "edit" ? (
          mine === undefined ? (
            <p className="text-sm text-neutral-400">Loading links…</p>
          ) : editing !== undefined ? (
            <LinkForm
              key={editing._id}
              heading={`Edit ${editing.slug}`}
              submitLabel="Save"
              pendingLabel="Saving…"
              initial={draftFromLink(editing)}
              expiryHint="Leave blank to remove the expiry."
              onCancel={() => setPanel(null)}
              onSubmit={async (draft) => {
                await updateLink({
                  linkId: editing._id,
                  ...updateLinkFields(draft),
                });
                setPanel(null);
              }}
            />
          ) : (
            <MissingLink onClose={() => setPanel(null)} />
          )
        ) : null}

        {panel?.kind === "shares" ? (
          mine === undefined ? (
            <p className="text-sm text-neutral-400">Loading links…</p>
          ) : sharing !== undefined ? (
            <ShareManager
              linkId={sharing._id}
              slug={sharing.slug}
              onClose={() => setPanel(null)}
            />
          ) : (
            <MissingLink onClose={() => setPanel(null)} />
          )
        ) : null}

        <LinkGrid
          links={myLinks}
          empty={
            mine !== undefined && mine.length > 0
              ? "No matches."
              : "No links yet."
          }
          renderLink={(link) => (
            <OwnerLinkCard
              link={link}
              now={now}
              editing={panel?.kind === "edit" && panel.linkId === link._id}
              managingShares={
                panel?.kind === "shares" && panel.linkId === link._id
              }
              onEdit={() => setPanel({ kind: "edit", linkId: link._id })}
              onShares={() => setPanel({ kind: "shares", linkId: link._id })}
              onDeleted={() => {
                setPanel((current) =>
                  current !== null &&
                  current.kind !== "create" &&
                  current.linkId === link._id
                    ? null
                    : current,
                );
              }}
            />
          )}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl">Shared with me</h2>
        <LinkGrid
          links={sharedLinks}
          empty={
            shared !== undefined && shared.length > 0
              ? "No matches."
              : "Nothing shared with you."
          }
          renderLink={(link) => <SharedLinkCard link={link} now={now} />}
        />
      </section>
    </div>
  );
}

function LinkGrid(props: {
  links: DashboardLink[] | undefined;
  empty: string;
  renderLink: (link: DashboardLink) => ReactNode;
}) {
  if (props.links === undefined) {
    return <p className="text-sm text-neutral-400">Loading links…</p>;
  }

  if (props.links.length === 0) {
    return <p className="text-sm text-neutral-400">{props.empty}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {props.links.map((link) => (
        <li key={link._id} className="min-w-0">
          {props.renderLink(link)}
        </li>
      ))}
    </ul>
  );
}

function MissingLink(props: { onClose: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-700 p-4">
      <p className="text-sm text-neutral-400">This link is no longer available.</p>
      <button
        type="button"
        className="rounded border border-neutral-600 px-3 py-2 text-sm"
        onClick={props.onClose}
      >
        Close
      </button>
    </div>
  );
}

function findLink(
  links: DashboardLink[] | undefined,
  linkId: Id<"links">,
): DashboardLink | undefined {
  return links?.find((link) => link._id === linkId);
}

function draftFromLink(link: DashboardLink): LinkDraft {
  return {
    slug: link.slug,
    redirectUrl: link.redirectUrl,
    description: link.description ?? "",
    expiresAt: expiryInputValue(link.expiresAt),
  };
}

type DashboardBoundaryProps = {
  children: ReactNode;
};

type DashboardBoundaryState = {
  failed: boolean;
};

class DashboardBoundary extends Component<
  DashboardBoundaryProps,
  DashboardBoundaryState
> {
  state: DashboardBoundaryState = { failed: false };

  static getDerivedStateFromError(): DashboardBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto flex max-w-sm flex-col gap-4">
          <p role="alert" className="text-sm text-red-300">
            Could not load the dashboard.
          </p>
          <SignOutButton />
        </div>
      );
    }

    return this.props.children;
  }
}
