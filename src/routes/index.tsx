import { useConvexAuth } from "@convex-dev/auth/react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../components/auth/sign-out-button";
import { PageFrame } from "../components/page-frame";
import { convex } from "../lib/convex";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  if (!convex) {
    return <Navigate to="/home" replace />;
  }

  return <DashboardSession />;
}

function DashboardSession() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <PageFrame>
        <p className="text-sm text-neutral-400">Checking session…</p>
      </PageFrame>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <PageFrame>
      <SignedInDashboard />
    </PageFrame>
  );
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
