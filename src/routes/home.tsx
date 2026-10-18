import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import { DestinationHero } from "../components/landing/destination-hero";
import { convex } from "../lib/convex";
import { createGeneratedLink } from "../lib/createGeneratedLink";
import { mutationErrorMessage } from "../lib/dashboardLinks";
import { randomGeneratedSlug } from "../lib/generatedSlug";
import { heroSubmission, type HeroIntent } from "../lib/heroSubmission";
import {
  browserKeyValueStore,
  clearOpenedLink,
  clearPendingLink,
  saveOpenedLink,
  savePendingLink,
} from "../lib/pendingLink";
import { useSessionDestination } from "../lib/useSessionDestination";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

type ViewerState = "pending" | "signed-in" | "signed-out";

function HomePage() {
  if (!convex) {
    return <HomeComposer viewer="signed-out" createLink={null} />;
  }

  return <HomeSession />;
}

function HomeSession() {
  const route = useSessionDestination();
  const createLink = useMutation(api.features.links.create);
  const viewer: ViewerState =
    route === "pending" ? "pending" : route === "/" ? "signed-in" : "signed-out";

  return <HomeComposer viewer={viewer} createLink={(args) => createLink(args)} />;
}

function HomeComposer(props: {
  viewer: ViewerState;
  createLink:
    | ((args: { slug: string; redirectUrl: string }) => Promise<string>)
    | null;
}) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [queued, setQueued] = useState<{
    destination: string;
    intent: HeroIntent;
  } | null>(null);
  const queuedRef = useRef(queued);
  const submitLock = useRef(false);
  queuedRef.current = queued;

  useEffect(() => {
    if (props.viewer === "pending") {
      return;
    }
    const next = queuedRef.current;
    if (next === null) {
      return;
    }
    queuedRef.current = null;
    setQueued(null);
    void run(next.destination, next.intent);
  }, [props.viewer, queued]);

  return (
    <>
      <header className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <nav className="flex items-center justify-between gap-3 p-4">
          <Link to="/home" className="text-2xl font-semibold">
            ShortCuts
          </Link>
          {props.viewer === "signed-in" ? (
            <Button variant="outline" asChild>
              <Link to="/">Dashboard</Link>
            </Button>
          ) : props.viewer === "signed-out" ? (
            <Button variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          ) : (
            <p className="text-sm text-neutral-400">Checking session…</p>
          )}
        </nav>
      </header>
      <main className="bg-gradient-to-r from-neutral-950 to-gray-700/20">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:max-w-lg sm:py-16">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Make a short link
            </h1>
            <p className="text-neutral-400">
              Paste a destination. ShortCuts makes a short link or a QR code
              for it.
            </p>
          </div>
          <DestinationHero
            pending={pending}
            error={error}
            onSubmit={(destination, intent) => {
              if (props.viewer === "pending") {
                queuedRef.current = { destination, intent };
                setQueued({ destination, intent });
                setError(null);
                return;
              }
              void run(destination, intent);
            }}
          />
        </div>
      </main>
      <footer className="border-t border-neutral-700 p-4">
        <p className="text-end">© 2026 J. Richardson</p>
      </footer>
    </>
  );

  async function run(destination: string, intent: HeroIntent) {
    if (submitLock.current) {
      return;
    }
    submitLock.current = true;
    setPending(true);
    let handedOff = false;

    try {
      const store = browserKeyValueStore();
      if (store === null) {
        setError("This browser cannot keep a link draft.");
        return;
      }

      const decision = heroSubmission({
        destination,
        intent,
        viewerId: props.viewer === "signed-in" ? "signed-in" : null,
      });

      if (decision.type === "invalid") {
        setError(decision.message);
        return;
      }

      setError(null);

      if (decision.type === "sign-in") {
        savePendingLink(store, decision.draft);
        clearOpenedLink(store);
        handedOff = true;
        await navigate({ to: "/login" });
        return;
      }

      if (props.createLink === null) {
        setError("Link creation is not configured on this deployment.");
        return;
      }

      const created = await createGeneratedLink({
        destination: decision.destination,
        nextSlug: randomGeneratedSlug,
        create: props.createLink,
      });
      clearPendingLink(store);
      saveOpenedLink(store, {
        linkId: created.linkId,
        slug: created.slug,
        qr: decision.qr,
      });
      handedOff = true;
      await navigate({ to: "/" });
    } catch (createError) {
      handedOff = false;
      setError(mutationErrorMessage(createError));
    } finally {
      if (!handedOff) {
        submitLock.current = false;
        setPending(false);
      }
    }
  }
}
