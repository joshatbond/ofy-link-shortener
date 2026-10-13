import type { ReactNode } from "react";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInPanel } from "../components/auth/sign-in-panel";
import { useAuthCodeExchangeFailed } from "../lib/authCodeExchange";
import { convex } from "../lib/convex";
import { sessionRoute } from "../lib/sessionRoute";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  if (!convex) {
    return <MarketingPage signIn={null} />;
  }

  return <HomeSession />;
}

function HomeSession() {
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
      <MarketingPage
        signIn={<p className="text-sm text-neutral-400">Checking session…</p>}
      />
    );
  }

  if (route === "/") {
    return <Navigate to="/" replace />;
  }

  return <MarketingPage signIn={<SignInPanel />} />;
}

function MarketingPage(props: { signIn: ReactNode }) {
  return (
    <>
      <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <nav className="p-4 font-semibold">
          <span className="text-2xl">ShortCuts</span>
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
            {props.signIn}
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-700 p-4">
        <p className="text-end">© 2026 J. Richardson</p>
      </footer>
    </>
  );
}
