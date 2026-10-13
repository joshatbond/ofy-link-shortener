import {
  assertRedirectUrl,
  isReservedSlug,
} from "../../convex/features/linkPolicy.js";

/**
 * The slug to look up, or null when this path stays on the SPA.
 * `/slug` and `/slug/` are the same slug. Reserved names match link policy
 * and are case-insensitive. The returned slug keeps its stored case.
 */
export function slugFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  if (segments.length !== 1) {
    return null;
  }

  const segment = segments[0];
  if (segment === undefined || isReservedSlug(segment)) {
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

/**
 * Merge a short-link query onto a successful http(s) Location.
 * Origin, path, and hash stay on that Location. Keys from the short link
 * replace the same keys on the destination, including repeated values.
 * An empty query returns `location` unchanged. Non-http locations, including
 * `/unknown`, are returned unchanged.
 */
export function applyShortLinkQuery(location: string, requestUrl: URL): string {
  if (requestUrl.search === "" || requestUrl.search === "?") {
    return location;
  }

  let destination: URL;
  try {
    destination = new URL(location);
  } catch {
    return location;
  }

  if (destination.protocol !== "http:" && destination.protocol !== "https:") {
    return location;
  }

  const origin = destination.origin;
  const pathname = destination.pathname;
  const hash = destination.hash;
  const incoming = requestUrl.searchParams;
  const overrideKeys = new Set<string>();
  for (const key of incoming.keys()) {
    overrideKeys.add(key);
  }
  for (const key of overrideKeys) {
    destination.searchParams.delete(key);
  }
  for (const [key, value] of incoming) {
    destination.searchParams.append(key, value);
  }

  if (
    destination.origin !== origin ||
    destination.pathname !== pathname ||
    destination.hash !== hash
  ) {
    return location;
  }

  const href = destination.href;
  if (/[\u0000\r\n]/.test(href)) {
    return location;
  }
  return href;
}

function firstNonEmpty(...values: Array<string | undefined>): string | null {
  for (const value of values) {
    if (value !== undefined && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}
