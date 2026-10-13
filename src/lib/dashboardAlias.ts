import { authCodeStillUnread } from "./sessionRoute";

/**
 * `/dashboard` is an alias of `/`. TanStack `redirect({ to: "/" })` omits
 * `search`, and `buildLocation` then uses an empty search, so `?code=` is
 * removed before Convex Auth's effect can read it.
 *
 * Stay on the URL that received the code until that param is gone. The
 * post-auth page is still `/` once the code has been consumed.
 */
export function dashboardAlias(search: string): "stay" | "/" {
  return authCodeStillUnread(search) ? "stay" : "/";
}
