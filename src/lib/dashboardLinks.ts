import {
  assertRedirectUrl,
  normalizeDescription,
  normalizeSlug,
} from "../../convex/features/linkPolicy";

/**
 * Form helpers for the existing link API. Slug and destination rules stay in
 * `linkPolicy`; this module does not add a second normalizer.
 */

export type ListedLink = {
  slug: string;
  redirectUrl: string;
  description?: string;
};

export type LinkDraft = {
  slug: string;
  redirectUrl: string;
  description: string;
  expiresAt: string;
};

export type CreateLinkFields = {
  slug: string;
  redirectUrl: string;
  description?: string;
  expiresAt?: number;
};

export type UpdateLinkFields = {
  slug: string;
  redirectUrl: string;
  description: string | null;
  expiresAt: number | null;
};

export type LinkActivity = "active" | "disabled" | "expired";

export type SlugFieldMessage = {
  tone: "preview" | "error";
  text: string;
};

const EXPIRY_INPUT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Case-insensitive filter over the links already loaded for this user. */
export function filterListedLinks<T extends ListedLink>(
  links: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...links];
  }

  return links.filter((link) => {
    const description = link.description ?? "";
    return (
      link.slug.toLowerCase().includes(needle) ||
      link.redirectUrl.toLowerCase().includes(needle) ||
      description.toLowerCase().includes(needle)
    );
  });
}

export function slugFieldMessage(raw: string): SlugFieldMessage | null {
  if (raw.length === 0) {
    return null;
  }

  try {
    const slug = normalizeSlug(raw);
    if (slug === raw) {
      return null;
    }
    return { tone: "preview", text: `Slug will be ${slug}.` };
  } catch (error) {
    return {
      tone: "error",
      text: error instanceof Error ? error.message : "Enter a slug.",
    };
  }
}

/** Empty is no expiry. A datetime-local value becomes epoch milliseconds. */
export function parseOptionalExpiry(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (!EXPIRY_INPUT.test(trimmed)) {
    throw new Error("Enter a valid expiry.");
  }

  const parsed = new Date(trimmed).getTime();
  if (Number.isNaN(parsed)) {
    throw new Error("Enter a valid expiry.");
  }

  return parsed;
}

/** Value for an `<input type="datetime-local">`, in local time. */
export function expiryInputValue(expiresAt: number | undefined): string {
  if (expiresAt === undefined) {
    return "";
  }

  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createLinkFields(draft: LinkDraft): CreateLinkFields {
  const slug = normalizeSlug(draft.slug);
  const redirectUrl = assertRedirectUrl(draft.redirectUrl);
  const description = normalizeDescription(draft.description);
  const expiresAt = parseOptionalExpiry(draft.expiresAt);

  return {
    slug,
    redirectUrl,
    ...(description !== undefined ? { description } : {}),
    ...(expiresAt !== undefined ? { expiresAt } : {}),
  };
}

export function updateLinkFields(draft: LinkDraft): UpdateLinkFields {
  const created = createLinkFields(draft);
  return {
    slug: created.slug,
    redirectUrl: created.redirectUrl,
    description: created.description ?? null,
    expiresAt: created.expiresAt ?? null,
  };
}

/**
 * Disabled wins over expiry, matching the redirect action's check order.
 * `expiresAt <= now` is expired, same as the public redirect.
 */
export function linkActivity(
  link: { disabled: boolean; expiresAt?: number },
  now: number,
): LinkActivity {
  if (link.disabled) {
    return "disabled";
  }

  if (link.expiresAt !== undefined && link.expiresAt <= now) {
    return "expired";
  }

  return "active";
}

export function mutationErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Something went wrong.";
  const uncaught = /Uncaught Error:\s*([^\n]+)/.exec(raw);
  const extracted = uncaught?.[1];
  if (extracted !== undefined && extracted.trim().length > 0) {
    return extracted.trim();
  }

  const line = raw
    .split("\n")
    .map((part) => part.trim())
    .find((part) => part.length > 0);

  return line ?? "Something went wrong.";
}
