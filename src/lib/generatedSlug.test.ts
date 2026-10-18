import { describe, expect, test } from "vitest";
import { generatedSlug, randomGeneratedSlug } from "./generatedSlug";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

describe("generatedSlug", () => {
  test("builds exactly 5 characters and keeps case", () => {
    const bytes = [0, 26, 52, 61, 1];
    expect(generatedSlug(() => bytes.shift() ?? 0)).toBe("Aa09B");
  });

  test("uses only A–Z, a–z, and 0–9", () => {
    const slug = generatedSlug(() => 10);
    expect(slug).toHaveLength(5);
    for (const character of slug) {
      expect(ALPHABET.includes(character)).toBe(true);
    }
  });

  test("skips biased bytes and does not insert hyphens", () => {
    const bytes = [248, 255, 0, 249, 1, 2, 3, 4];
    expect(generatedSlug(() => bytes.shift() ?? 0)).toBe("ABCDE");
  });

  test("random slugs are 5 characters from that alphabet", () => {
    const slug = randomGeneratedSlug();
    expect(slug).toHaveLength(5);
    expect(slug).toMatch(/^[A-Za-z0-9]{5}$/);
  });
});
