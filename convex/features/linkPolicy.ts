const RESERVED_SLUGS = new Set([
  "login",
  "dashboard",
  "unknown",
  "math",
  "api",
  "monitoring",
  "assets",
  "favicon.ico",
  "logo.png",
]);

export function normalizeSlug(raw: string): string {
  const slug = raw.trim();

  if (slug.length === 0) {
    throw new Error("Enter a slug.");
  }

  if (slug.includes("/")) {
    throw new Error("Slug cannot contain a slash.");
  }

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    throw new Error("That slug is reserved.");
  }

  return slug;
}

export function assertRedirectUrl(raw: string): string {
  const redirectUrl = raw.trim();
  let parsed: URL;

  try {
    parsed = new URL(redirectUrl);
  } catch {
    throw new Error("Enter an http or https URL.");
  }

  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.hostname === ""
  ) {
    throw new Error("Enter an http or https URL.");
  }

  return redirectUrl;
}

export function normalizeDescription(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const description = value.trim();
  if (description.length === 0) {
    return undefined;
  }

  return description;
}
