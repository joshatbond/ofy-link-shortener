import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInPanel } from "../components/auth/sign-in-panel";
import { SignOutButton } from "../components/auth/sign-out-button";
import { PageFrame } from "../components/page-frame";
import { convex } from "../lib/convex";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <PageFrame>
      {convex ? <DashboardSession /> : <p>Backend is not configured.</p>}
    </PageFrame>
  );
}

function DashboardSession() {
  const viewerId = useQuery(api.features.users.viewer, {});

  if (viewerId === undefined) {
    return <p className="text-sm text-neutral-400">Checking session…</p>;
  }

  if (viewerId === null) {
    return <SignInPanel />;
  }

  return <SignedInDashboard />;
}

function SignedInDashboard() {
  const profile = useQuery(api.features.users.viewerProfile, {});
  const label = profile?.name ?? profile?.email ?? "Signed in.";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-3xl">Dashboard</h1>
      <p className="text-neutral-400">{label}</p>
      <SignOutButton />
    </div>
  );
}
