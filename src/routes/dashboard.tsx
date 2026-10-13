import { Navigate, createFileRoute, redirect } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { PageFrame } from "../components/page-frame";
import { dashboardAlias } from "../lib/dashboardAlias";
import { subscribeLocationReplaced } from "../lib/locationReplace";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const search = typeof window === "undefined" ? "" : window.location.search;
    if (dashboardAlias(search) === "stay") {
      return;
    }
    throw redirect({ to: "/" });
  },
  component: DashboardAlias,
});

function DashboardAlias() {
  const search = useSyncExternalStore(
    subscribeLocationReplaced,
    () => window.location.search,
    () => "",
  );

  if (dashboardAlias(search) === "stay") {
    return (
      <PageFrame>
        <p className="text-sm text-neutral-400">Checking session…</p>
      </PageFrame>
    );
  }

  return <Navigate to="/" replace />;
}
