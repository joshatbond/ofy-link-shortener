/**
 * Landing-page slugs are exactly 5 characters from A–Z, a–z, and 0–9.
 * Case stays significant. Custom slugs are only entered in the dashboard.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** 256 is not divisible by 62. Bytes at or above this limit are discarded. */
const UNBIASED_LIMIT = 256 - (256 % ALPHABET.length);

export function generatedSlug(nextByte: () => number): string {
  let slug = "";
  let draws = 0;

  while (slug.length < 5) {
    draws += 1;
    if (draws > 64) {
      throw new Error("Could not generate a slug.");
    }

    const value = nextByte();
    if (value >= UNBIASED_LIMIT) {
      continue;
    }

    const character = ALPHABET[value % ALPHABET.length];
    if (character === undefined) {
      throw new Error("Could not generate a slug.");
    }
    slug += character;
  }

  return slug;
}

export function randomGeneratedSlug(): string {
  return generatedSlug(() => {
    const bytes = new Uint8Array(1);
    crypto.getRandomValues(bytes);
    const value = bytes[0];
    if (value === undefined) {
      throw new Error("Could not generate a slug.");
    }
    return value;
  });
}
