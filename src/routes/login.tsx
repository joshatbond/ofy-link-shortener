import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInPanel } from "../components/auth/sign-in-panel";
import { PageFrame } from "../components/page-frame";
import { convex } from "../lib/convex";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <PageFrame>
      {convex ? <LoginSession /> : <p>Backend is not configured.</p>}
    </PageFrame>
  );
}

function LoginSession() {
  const viewerId = useQuery(api.features.users.viewer, {});
  const navigate = useNavigate();

  useEffect(() => {
    if (viewerId !== undefined && viewerId !== null) {
      void navigate({ to: "/dashboard" });
    }
  }, [navigate, viewerId]);

  if (viewerId === undefined || viewerId !== null) {
    return <p className="text-sm text-neutral-400">Checking session…</p>;
  }

  return <SignInPanel />;
}
