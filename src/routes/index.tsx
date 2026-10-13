import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignedInDashboard } from "../components/dashboard/signed-in-dashboard";
import { PageFrame } from "../components/page-frame";
import { useAuthCodeExchangeFailed } from "../lib/authCodeExchange";
import { convex } from "../lib/convex";
import { sessionRoute } from "../lib/sessionRoute";

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
  const { isLoading } = useConvexAuth();
  const handshakeFailed = useAuthCodeExchangeFailed();
  const viewerId = useQuery(
    api.features.users.viewer,
    isLoading && !handshakeFailed ? "skip" : {},
  );
  const route = sessionRoute({
    authLoading: isLoading,
    handshakeFailed,
    viewerId,
  });

  if (route === "pending") {
    return (
      <PageFrame>
        <p className="text-sm text-neutral-400">Checking session…</p>
      </PageFrame>
    );
  }

  if (route === "/home") {
    return <Navigate to="/home" replace />;
  }

  return (
    <PageFrame>
      <SignedInDashboard />
    </PageFrame>
  );
}

