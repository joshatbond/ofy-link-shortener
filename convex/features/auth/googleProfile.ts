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
 */
export function googleAccountProfile(profile: GoogleProfile) {
  return {
    id: profile.sub,
    name: profile.name,
    email: assertOfyOrgEmail(profile.email ?? ""),
    image: profile.picture,
    emailVerified: true,
  };
}
