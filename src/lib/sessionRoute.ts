/**
 * Where the SPA should stay after sign-in.
 *
 * `users.viewer` is the gate. An id stays on `/`. Only a settled null goes
 * to `/home`. `undefined` means the query has not resolved, and that must
 * not redirect. `?code=` still on the URL must not redirect either:
 * `<Navigate>` runs in `useLayoutEffect` and would drop the code before
 * Convex Auth reads it.
 *
 * This does not look at token presence or `isLoading`. A null that arrived
 * from a query issued before `setAuth` is not a settled viewer; the caller
 * must not subscribe until that handshake has paused the socket.
 */
export type SessionRoute = "/" | "/home" | "pending";

export function sessionRoute(input: {
  codeUnread: boolean;
  viewerId: string | null | undefined;
}): SessionRoute {
  if (input.codeUnread || input.viewerId === undefined) {
    return "pending";
  }

  return input.viewerId === null ? "/home" : "/";
}

/** True when the OAuth return still has a `code` Convex Auth has not read. */
export function authCodeStillUnread(search: string): boolean {
  const code = new URLSearchParams(search).get("code");
  return code !== null && code.length > 0;
}

/**
 * Start `users.viewer` only after the route effect has run.
 *
 * `useQuery` subscribes during render, via `getCurrentValue` → `watchQuery`.
 * `@convex-dev/auth` clears `isLoading` inside `setToken`, and
 * `ConvexAuthStateFirstEffect` calls `client.setAuth` in a passive effect
 * that runs after that render. Subscribing in the `isLoading === false`
 * render sends the query with no JWT. The server answers null, and a
 * settled null is `/home`.
 *
 * The route effect is a later sibling of that `setAuth` effect, so arming
 * there subscribes on the following render, after `setAuth` has paused the
 * socket. `handshakeSettled` is `isLoading === false` or a thrown code
 * exchange. It only delays the subscription. It is not the route decision.
 * A thrown exchange never clears `isLoading`, so that failure still has to
 * subscribe and follow a settled null.
 */
export function shouldSubscribeViewer(input: {
  codeUnread: boolean;
  handshakeSettled: boolean;
  subscriptionArmed: boolean;
}): boolean {
  return (
    input.subscriptionArmed &&
    input.handshakeSettled &&
    !input.codeUnread
  );
}
