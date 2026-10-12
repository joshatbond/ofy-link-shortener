import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DevPasswordSignInForm } from "./dev-password-sign-in-form";
import { GoogleSignInButton } from "./google-sign-in-button";

export function SignInPanel() {
  const devPassword = useQuery(api.features.auth.devPassword.isEnabled, {});
  const google = useQuery(api.features.auth.google.isConfigured, {});
  const showDevPassword = devPassword === true;
  const showGoogle = google === true;
  const resolved = devPassword !== undefined && google !== undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      {showGoogle ? <GoogleSignInButton redirectTo="/" /> : null}
      {showDevPassword ? <DevPasswordSignInForm /> : null}
      {resolved && !showGoogle && !showDevPassword ? (
        <p className="text-sm text-neutral-400">
          Google sign-in is not configured on this deployment.
        </p>
      ) : null}
    </div>
  );
}
