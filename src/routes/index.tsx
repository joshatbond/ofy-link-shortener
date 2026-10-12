import { Component, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { convex } from "../lib/convex";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <nav className="flex items-center justify-between p-4 font-semibold">
          <span className="text-2xl">ShortCuts</span>
          <Link to="/login" className="text-sm font-medium underline">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 md:flex-row md:gap-12 xl:gap-20">
          <img
            src="/logo.png"
            alt=""
            width={480}
            height={480}
            className="hidden w-full max-w-40 object-contain md:block xl:max-w-60"
          />
          <div className="max-w-sm space-y-4">
            <h1 className="text-3xl">Link shortening without the hassle.</h1>
            <p className="text-neutral-400">
              Your time is important. Skip the wait and privacy concerns of
              ad-funded shorteners.
            </p>
            <BackendStatus />
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-700 p-4">
        <p className="text-end">© 2026 J. Richardson</p>
      </footer>
    </>
  );
}

function BackendStatus() {
  if (!convex) {
    return <StatusText>Backend is not configured.</StatusText>;
  }

  return (
    <HealthQueryBoundary>
      <HealthStatus />
    </HealthQueryBoundary>
  );
}

function HealthStatus() {
  const health = useQuery(api.health.check, {});
  if (health === undefined) {
    return <StatusText>Checking the backend…</StatusText>;
  }
  if (health.ok) {
    return <StatusText>Backend is ready.</StatusText>;
  }
  return <StatusText>Backend check failed.</StatusText>;
}

function StatusText({ children }: { children: string }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}

type HealthQueryBoundaryProps = {
  children: ReactNode;
};

type HealthQueryBoundaryState = {
  failed: boolean;
};

class HealthQueryBoundary extends Component<
  HealthQueryBoundaryProps,
  HealthQueryBoundaryState
> {
  state: HealthQueryBoundaryState = { failed: false };

  static getDerivedStateFromError(): HealthQueryBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <StatusText>Backend check failed.</StatusText>;
    }
    return this.props.children;
  }
}
