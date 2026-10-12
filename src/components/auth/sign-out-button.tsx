import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function SignOutButton(props: { className?: string }) {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={
        props.className ??
        "rounded border border-neutral-600 px-3 py-2 text-sm disabled:opacity-60"
      }
      disabled={pending}
      onClick={() => void handleClick()}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );

  async function handleClick() {
    setPending(true);

    try {
      await signOut();
      await navigate({ to: "/" });
    } finally {
      setPending(false);
    }
  }
}
