import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { assertOfyOrgEmail } from "./ofyEmail";
import { isLocalDevDeployment } from "./devOnly";

const google = Google({
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: assertOfyOrgEmail(profile.email),
      image: profile.picture,
      emailVerified: profile.email_verified,
    };
  },
});

const devPassword = Password({
  profile(params) {
    assertDevPasswordAllowed();

    const email = assertOfyOrgEmail(String(params.email ?? ""));
    const at = email.indexOf("@");

    return {
      email,
      name: email.slice(0, at),
    };
  },
  validatePasswordRequirements(password) {
    assertDevPasswordAllowed();

    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters.");
    }
  },
});

export function authProvidersForDeployment() {
  if (isLocalDevDeployment()) {
    return [google, devPassword];
  }

  return [google];
}

function assertDevPasswordAllowed(): void {
  if (!isLocalDevDeployment()) {
    throw new Error("Password auth is only available in local development.");
  }
}
