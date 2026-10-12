import { env } from "../../_generated/server";

/**
 * Post-auth paths allowed for this app. Convex Auth `callbacks.redirect`
 * must return an absolute URL. Anything else falls back to `/dashboard`.
 */
const ALLOWED_APP_BASE_PATHS = ["/dashboard"] as const;

const FALLBACK_PATH = "/dashboard";

export function resolvePostAuthRedirect(
  redirectTo: string | undefined | null,
): string {
  const siteUrl = env.SITE_URL;

  if (siteUrl === undefined || siteUrl === "") {
    throw new Error(
      "SITE_URL is not configured on the Convex deployment (set SITE_URL and optionally ALLOWED_SITE_URLS)",
    );
  }

  const path = resolveAppPath(redirectTo);
  const allowedOrigins = allowedSiteOrigins(siteUrl);
  const baseUrl = siteUrl.replace(/\/$/, "");

  if (redirectTo?.startsWith("http")) {
    const requestOrigin = new URL(redirectTo).origin;

    if (allowedOrigins.includes(requestOrigin)) {
      return `${requestOrigin}${path}`;
    }
  }

  return `${baseUrl}${path}`;
}

function siteOrigin(siteUrl: string): string {
  return new URL(siteUrl.includes("://") ? siteUrl : `https://${siteUrl}`)
    .origin;
}

/** Origins allowed for post-auth redirects (`SITE_URL` plus optional `ALLOWED_SITE_URLS`). */
function allowedSiteOrigins(siteUrl: string): Array<string> {
  const origins = new Set<string>();

  for (const raw of [siteUrl, env.ALLOWED_SITE_URLS]) {
    if (raw === undefined || raw === "") {
      continue;
    }

    for (const part of raw.split(",")) {
      const trimmed = part.trim();

      if (trimmed !== "") {
        origins.add(siteOrigin(trimmed));
      }
    }
  }

  return [...origins];
}

function resolveAppPath(redirectTo: string | undefined | null): string {
  const safe = redirectTo ?? FALLBACK_PATH;
  const path = safe.startsWith("http")
    ? new URL(safe).pathname
    : (safe.split("?")[0] ?? safe);
  const allowed = ALLOWED_APP_BASE_PATHS.some(
    (base) => path === base || path.startsWith(`${base}/`),
  );

  if (!allowed) {
    return FALLBACK_PATH;
  }

  if (safe.startsWith("http")) {
    const url = new URL(safe);
    return `${path}${url.search}`;
  }

  const query = safe.includes("?") ? safe.slice(safe.indexOf("?")) : "";
  return `${path}${query}`;
}
