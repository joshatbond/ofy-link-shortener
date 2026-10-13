/**
 * Where the SPA should stay after the auth handshake.
 *
 * `users.viewer` is the gate: an id stays on `/`, null goes to `/home`.
 * `authLoading` is only the Convex Auth handshake (storage read or `?code=`
 * exchange). It is not token presence. A null viewer during that handshake
 * is not signed-out — navigating then drops `?code=` before the client can
 * exchange it, because `<Navigate>` runs in `useLayoutEffect`.
 */
export type SessionRoute = "/" | "/home" | "pending";

export function sessionRoute(input: {
  authLoading: boolean;
  viewerId: string | null | undefined;
}): SessionRoute {
  if (input.authLoading || input.viewerId === undefined) {
    return "pending";
  }

  return input.viewerId === null ? "/home" : "/";
}
