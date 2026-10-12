import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function DevPasswordSignInForm() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <fieldset>
        <label className="flex flex-col gap-1 text-sm">
          <span>Email</span>
          <input
            type="email"
            className="rounded bg-neutral-900 px-2 py-1 text-neutral-50"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
      </fieldset>
      <fieldset>
        <label className="flex flex-col gap-1 text-sm">
          <span>Password</span>
          <input
            type="password"
            className="rounded bg-neutral-900 px-2 py-1 text-neutral-50"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            minLength={4}
            required
          />
        </label>
      </fieldset>
      <p className="text-sm text-neutral-400">
        Local dev only — creates a test account if one does not exist yet.
      </p>
      {error !== null ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in with password"}
      </button>
    </form>
  );

  async function handleSubmit() {
    setError(null);
    setPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signIn",
      });
      await navigate({ to: "/dashboard" });
    } catch (signInError) {
      try {
        await signIn("password", {
          email: normalizedEmail,
          password,
          flow: "signUp",
        });
        await navigate({ to: "/dashboard" });
      } catch (signUpError) {
        setError(
          signUpError instanceof Error
            ? signUpError.message
            : signInError instanceof Error
              ? signInError.message
              : "Sign in failed.",
        );
      }
    } finally {
      setPending(false);
    }
  }
}
