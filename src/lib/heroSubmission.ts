import { assertRedirectUrl } from "../../convex/features/linkPolicy";
import type { PendingLinkDraft } from "./pendingLink";

export type HeroIntent = "shorten" | "qr";

export type HeroSubmission =
  | { type: "invalid"; message: string }
  | { type: "sign-in"; draft: PendingLinkDraft }
  | { type: "create"; destination: string; qr: boolean };

/**
 * The landing hero asks only for a destination.
 * A settled null viewer saves a draft and signs in. An id creates now.
 * This does not look at token presence.
 */
export function heroSubmission(input: {
  destination: string;
  intent: HeroIntent;
  viewerId: string | null;
}): HeroSubmission {
  let destination: string;
  try {
    destination = assertRedirectUrl(input.destination);
  } catch (error) {
    return {
      type: "invalid",
      message:
        error instanceof Error ? error.message : "Enter an http or https URL.",
    };
  }

  const qr = input.intent === "qr";
  if (input.viewerId === null) {
    return {
      type: "sign-in",
      draft: { destination, qr },
    };
  }

  return { type: "create", destination, qr };
}
