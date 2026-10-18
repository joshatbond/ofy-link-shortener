import {
  assertRedirectUrl,
  isReservedSlug,
} from "../../convex/features/linkPolicy";
import { mutationErrorMessage } from "./dashboardLinks";

const MAX_ATTEMPTS = 8;

/**
 * Create a landing-page link with a generated slug.
 * A reserved slug (`login` is 5 letters) or "Slug is already in use."
 * tries the next slug. Any other failure stops.
 */
export async function createGeneratedLink(input: {
  destination: string;
  nextSlug: () => string;
  create: (args: { slug: string; redirectUrl: string }) => Promise<string>;
}): Promise<{ linkId: string; slug: string }> {
  const redirectUrl = assertRedirectUrl(input.destination);
  let lastConflict: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const slug = input.nextSlug();
    if (isReservedSlug(slug)) {
      lastConflict = new Error("That slug is reserved.");
      continue;
    }

    try {
      const linkId = await input.create({ slug, redirectUrl });
      return { linkId, slug };
    } catch (error) {
      if (mutationErrorMessage(error) !== "Slug is already in use.") {
        throw error;
      }
      lastConflict = new Error("Slug is already in use.");
    }
  }

  throw lastConflict ?? new Error("Slug is already in use.");
}
