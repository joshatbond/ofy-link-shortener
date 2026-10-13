const listeners = new Set<() => void>();

/** Convex Auth replaces the URL outside the router. Tell subscribers. */
export function notifyLocationReplaced(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeLocationReplaced(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
