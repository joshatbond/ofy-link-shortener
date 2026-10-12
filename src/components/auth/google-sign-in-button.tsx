import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export function GoogleSignInButton(props: {
  redirectTo: string;
  className?: string;
}) {
  const configured = useQuery(api.features.auth.google.isConfigured, {});
  const { signIn } = useAuthActions();
  const [pending, setPending] = useState(false);

  if (configured !== true) {
    return null;
  }

  return (
    <button
      type="button"
      className={
        props.className ??
        "rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
      }
      disabled={pending}
      onClick={() => void handleClick()}
    >
      {pending ? "Signing in…" : "Sign in with Google"}
    </button>
  );

  async function handleClick() {
    setPending(true);

    try {
      await signIn("google", {
        redirectTo: absoluteRedirect(props.redirectTo),
      });
    } finally {
      setPending(false);
    }
  }
}

function absoluteRedirect(redirectTo: string): string {
  if (redirectTo.startsWith("http://") || redirectTo.startsWith("https://")) {
    return redirectTo;
  }

  return new URL(redirectTo, window.location.origin).href;
}
