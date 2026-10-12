import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ConvexProvider } from "convex/react";
import { convex } from "../lib/convex";

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

  return <ConvexProvider client={convex}>{shell}</ConvexProvider>;
}
