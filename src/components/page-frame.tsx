import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <nav className="p-4 font-semibold">
          <Link to="/" className="text-2xl">
            ShortCuts
          </Link>
        </nav>
      </header>
      <main className="bg-gradient-to-r from-neutral-950 to-gray-700/20 px-4 py-16">
        {children}
      </main>
      <footer className="border-t border-neutral-700 p-4">
        <p className="text-end">© 2026 J. Richardson</p>
      </footer>
    </>
  );
}
