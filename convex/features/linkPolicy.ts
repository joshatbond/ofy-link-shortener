const RESERVED_SLUGS = new Set([
  "login",
  "dashboard",
  "home",
  "unknown",
  "math",
  "api",
  "monitoring",
  "assets",
  "favicon.ico",
  "logo.png",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function normalizeSlug(raw: string): string {
  const slug = raw
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length === 0) {
    throw new Error("Enter a slug.");
  }

  if (isReservedSlug(slug)) {
    throw new Error("That slug is reserved.");
  }

  if (!/^[A-Za-z0-9-]+$/.test(slug)) {
    throw new Error("Slug can only contain letters, digits, and hyphens.");
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

  if (parsed.username !== "" || parsed.password !== "") {
    throw new Error(
      "Enter an http or https URL without a username or password.",
    );
  }

  return parsed.href;
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
