import type { ReactNode } from "react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { SignInPanel } from "../components/auth/sign-in-panel";
import { PageFrame } from "../components/page-frame";
import { convex } from "../lib/convex";
import { useSessionDestination } from "../lib/useSessionDestination";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  if (!convex) {
    return (
      <LoginFrame>
        <h1 className="text-3xl">Sign in</h1>
        <p className="text-neutral-400">
          Google sign-in is not configured on this deployment.
        </p>
      </LoginFrame>
    );
  }

  return <LoginSession />;
}

function LoginSession() {
  const route = useSessionDestination();

  if (route === "pending") {
    return (
      <LoginFrame>
        <p className="text-sm text-neutral-400">Checking session…</p>
      </LoginFrame>
    );
  }

  if (route === "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginFrame>
      <h1 className="text-3xl">Sign in</h1>
      <p className="text-neutral-400">Use your @ofy.org Google account.</p>
      <SignInPanel />
    </LoginFrame>
  );
}

function LoginFrame(props: { children: ReactNode }) {
  return (
    <PageFrame>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        {props.children}
      </div>
    </PageFrame>
  );
}
