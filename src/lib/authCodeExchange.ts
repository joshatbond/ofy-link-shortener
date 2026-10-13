import { useSyncExternalStore } from "react";

/**
 * `@convex-dev/auth` deletes `?code=` and the verifier, then calls
 * `auth:signIn` with no catch. `isLoading` flips only inside `setToken`.
 * A throw from `beforeSessionCreation` leaves the flag stuck, so the route
 * records that rejection and stops waiting.
 */
let failed = false;
const listeners = new Set<() => void>();

export function authCodeExchangeFailed(): boolean {
  return failed;
}

export function resetAuthCodeExchangeForTests(): void {
  failed = false;
  listeners.clear();
}

function markAuthCodeExchangeFailed(): void {
  if (failed) {
    return;
  }
  failed = true;
  for (const listener of listeners) {
    listener();
  }
}

function subscribeAuthCodeExchange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAuthCodeExchangeFailed(): boolean {
  return useSyncExternalStore(
    subscribeAuthCodeExchange,
    authCodeExchangeFailed,
    () => false,
  );
}

/** The OAuth return calls `signIn(undefined, { code })`, which hits `client.action`. */
export function isAuthCodeExchange(action: unknown, args: unknown): boolean {
  if (action !== "auth:signIn") {
    return false;
  }
  if (args === null || typeof args !== "object") {
    return false;
  }
  const call = args as { provider?: unknown; params?: unknown };
  if (call.provider !== undefined) {
    return false;
  }
  if (call.params === null || typeof call.params !== "object") {
    return false;
  }
  return typeof (call.params as { code?: unknown }).code === "string";
}

export type AuthActionClient = {
  action: (action: unknown, ...args: unknown[]) => Promise<unknown>;
};

export function observeAuthCodeExchange(client: AuthActionClient): void {
  const call = client.action.bind(client);
  client.action = async (action, ...args) => {
    try {
      return await call(action, ...args);
    } catch (error) {
      if (isAuthCodeExchange(action, args[0])) {
        markAuthCodeExchangeFailed();
      }
      throw error;
    }
  };
}
