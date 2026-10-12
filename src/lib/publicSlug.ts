import { assertRedirectUrl } from "../../convex/features/linkPolicy";

const APP_SEGMENTS = new Set(["home", "login", "dashboard", "unknown"]);
const STATIC_SEGMENTS = new Set(["favicon.ico", "logo.png", "assets"]);

/**
 * The slug to look up, or null when this path is the SPA or a static file.
 * `/slug` and `/slug/` are the same slug. Lookup stays case-sensitive.
 */
export function slugFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  if (segments.length !== 1) {
    return null;
  }

  const segment = segments[0];
  if (segment === undefined) {
    return null;
  }
  if (APP_SEGMENTS.has(segment) || STATIC_SEGMENTS.has(segment)) {
    return null;
  }

  return segment;
}

export function convexSiteOrigin(env: {
  CONVEX_SITE_URL?: string | undefined;
  VITE_CONVEX_URL?: string | undefined;
}): string | null {
  const candidate = firstNonEmpty(env.CONVEX_SITE_URL, env.VITE_CONVEX_URL);
  if (candidate === null) {
    return null;
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (url.hostname.endsWith(".convex.cloud")) {
      url.hostname = url.hostname.replace(/\.convex\.cloud$/, ".convex.site");
    }
    return url.origin;
  } catch {
    return null;
  }
}

/** `/unknown` stays on this host. Any other location must be an http(s) URL. */
export function forwardLocation(location: string | null): string | null {
  if (location === "/unknown") {
    return "/unknown";
  }
  if (location === null) {
    return null;
  }

  try {
    return assertRedirectUrl(location);
  } catch {
    return null;
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string | null {
  for (const value of values) {
    if (value !== undefined && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}
