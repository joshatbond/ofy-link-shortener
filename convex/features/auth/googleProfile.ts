import { assertOfyOrgEmail } from "./ofyEmail";

type GoogleProfile = {
  sub: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  email_verified?: boolean | null;
};

/**
 * An @ofy.org Workspace account is the sign-in gate.
 * Google's `email_verified` claim is not required.
 * A missing or false claim stays false so Convex Auth does not link
 * accounts or set `emailVerificationTime`.
 */
export function googleAccountProfile(profile: GoogleProfile) {
  return {
    id: profile.sub,
    name: profile.name,
    email: assertOfyOrgEmail(profile.email ?? ""),
    image: profile.picture,
    emailVerified: profile.email_verified === true,
  };
}
