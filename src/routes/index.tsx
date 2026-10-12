import { createFileRoute } from "@tanstack/react-router";
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
        <nav className="p-4 font-semibold">
          <span className="text-2xl">ShortCuts</span>
        </nav>
      </header>

      <main className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 md:flex-row md:gap-12 xl:gap-20">
          <img
            src="/logo.png"
            alt=""
            className="hidden h-full w-full max-w-40 object-contain md:block xl:max-w-60"
          />
          <div className="max-w-sm space-y-4">
            <h1 className="text-3xl">Link shortening without the hassle.</h1>
            <p className="text-neutral-400">
              Your time is important. Skip the wait and privacy concerns of
              ad-funded shorteners.
            </p>
            {convex ? <BackendStatus /> : null}
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
  const health = useQuery(api.health.check, {});

  return (
    <p className="text-sm text-neutral-500">
      {health === undefined ? "Checking the backend…" : "Backend is ready."}
    </p>
  );
}
