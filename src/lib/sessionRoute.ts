/**
 * Where the SPA should stay after the auth handshake.
 *
 * `users.viewer` is the gate: an id stays on `/`, null goes to `/home`.
 * `authLoading` is only the Convex Auth handshake (storage read or `?code=`
 * exchange). It is not token presence. A null viewer during that handshake
 * is not signed-out — navigating then drops `?code=` before the client can
 * read it, because `<Navigate>` runs in `useLayoutEffect`.
 *
 * `handshakeFailed` is set when `auth:signIn` throws after the library has
 * already deleted `?code=`. `isLoading` never clears on that path, so a
 * failed handshake must stop waiting and follow the viewer.
 */
export type SessionRoute = "/" | "/home" | "pending";

export function sessionRoute(input: {
  authLoading: boolean;
  handshakeFailed: boolean;
  viewerId: string | null | undefined;
}): SessionRoute {
  const handshakeOpen = input.authLoading && !input.handshakeFailed;
  if (handshakeOpen || input.viewerId === undefined) {
    return "pending";
  }

  return input.viewerId === null ? "/home" : "/";
}
