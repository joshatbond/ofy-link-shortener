import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { convex } from "../lib/convex";
import { notifyLocationReplaced } from "../lib/locationReplace";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const shell = (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] bg-neutral-950 text-neutral-50">
      <Outlet />
    </div>
  );

  if (!convex) {
    return shell;
  }

  return (
    <ConvexAuthProvider
      client={convex}
      replaceURL={(relativeUrl) => {
        const url = new URL(relativeUrl, window.location.origin);
        window.history.replaceState(
          {},
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
        notifyLocationReplaced();
      }}
    >
      {shell}
    </ConvexAuthProvider>
  );
}
