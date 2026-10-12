import { describe, expect, test } from "vitest";
import {
  createLinkFields,
  expiryInputValue,
  filterListedLinks,
  linkActivity,
  mutationErrorMessage,
  parseOptionalExpiry,
  slugFieldMessage,
  updateLinkFields,
  type ListedLink,
} from "./dashboardLinks";

const handbook: ListedLink = {
  slug: "Handbook",
  redirectUrl: "https://example.com/staff",
  description: "Staff handbook",
};

const notes: ListedLink = {
  slug: "notes",
  redirectUrl: "http://localhost:3000/notes",
};

describe("filterListedLinks", () => {
  test("keeps order and ignores a blank query", () => {
    const links = [handbook, notes];
    expect(filterListedLinks(links, "   ")).toEqual(links);
    expect(filterListedLinks(links, "   ")).not.toBe(links);
  });

  test("matches slug, destination, or description without case", () => {
    const links = [handbook, notes];
    expect(filterListedLinks(links, "hand")).toEqual([handbook]);
    expect(filterListedLinks(links, "LOCALHOST")).toEqual([notes]);
    expect(filterListedLinks(links, "staff handbook")).toEqual([handbook]);
  });

  test("treats the query as text, not a pattern, and ignores other fields", () => {
    const extra = { ...notes, ownerEmail: "secret@ofy.org" };
    expect(filterListedLinks([handbook, extra], ".*")).toEqual([]);
    expect(filterListedLinks([extra], "secret")).toEqual([]);
  });
});

describe("slug field", () => {
  test("turns spaces into a single hyphen and keeps case", () => {
    expect(slugFieldMessage("  My   Link  ")).toEqual({
      tone: "preview",
      text: "Slug will be My-Link.",
    });
    expect(slugFieldMessage("My-Link")).toBeNull();
    expect(slugFieldMessage("")).toBeNull();
  });

  test("surfaces the existing normalizer when a character is not allowed", () => {
    expect(slugFieldMessage("My_Link")).toEqual({
      tone: "error",
      text: "Slug can only contain letters, digits, and hyphens.",
    });
    expect(slugFieldMessage("café")).toEqual({
      tone: "error",
      text: "Slug can only contain letters, digits, and hyphens.",
    });
    expect(slugFieldMessage("dashboard")).toEqual({
      tone: "error",
      text: "That slug is reserved.",
    });
    expect(slugFieldMessage("   ")).toEqual({
      tone: "error",
      text: "Enter a slug.",
    });
  });
});

describe("expiry input", () => {
  test("parses a datetime-local value and round-trips it", () => {
    const value = "2026-10-12T23:30";
    const parsed = parseOptionalExpiry(value);
    expect(parsed).toBe(new Date(value).getTime());
    expect(expiryInputValue(parsed)).toBe(value);
  });

  test("treats a blank expiry as unset and rejects anything else", () => {
    expect(parseOptionalExpiry("  ")).toBeUndefined();
    expect(expiryInputValue(undefined)).toBe("");
    expect(expiryInputValue(Number.NaN)).toBe("");
    expect(() => parseOptionalExpiry("tomorrow")).toThrow(
      "Enter a valid expiry.",
    );
    expect(() => parseOptionalExpiry("2026-10-12")).toThrow(
      "Enter a valid expiry.",
    );
  });
});

describe("link form fields", () => {
  const draft = {
    slug: "  My   Link  ",
    redirectUrl: " https://example.com/handbook ",
    description: "  Staff handbook  ",
    expiresAt: "2026-10-12T23:30",
  };

  test("create uses the existing slug and http(s) rules", () => {
    expect(createLinkFields(draft)).toEqual({
      slug: "My-Link",
      redirectUrl: "https://example.com/handbook",
      description: "Staff handbook",
      expiresAt: new Date("2026-10-12T23:30").getTime(),
    });
  });

  test("create omits a blank description and expiry", () => {
    expect(
      createLinkFields({
        slug: "Handbook",
        redirectUrl: "http://localhost:3000/path?q=1",
        description: "   ",
        expiresAt: "",
      }),
    ).toEqual({
      slug: "Handbook",
      redirectUrl: "http://localhost:3000/path?q=1",
    });
  });

  test("rejects an odd slug and a non-http destination", () => {
    expect(() =>
      createLinkFields({
        ...draft,
        slug: "hello/world",
      }),
    ).toThrow(/slug/i);
    expect(() =>
      createLinkFields({
        ...draft,
        redirectUrl: "javascript:alert(1)",
      }),
    ).toThrow(/http or https/);
    expect(() =>
      createLinkFields({
        ...draft,
        redirectUrl: "https://user:pass@example.com/path",
      }),
    ).toThrow(/username or password/);
  });

  test("update clears description and expiry by sending null", () => {
    expect(
      updateLinkFields({
        slug: "Handbook",
        redirectUrl: "https://example.com/handbook",
        description: " ",
        expiresAt: "",
      }),
    ).toEqual({
      slug: "Handbook",
      redirectUrl: "https://example.com/handbook",
      description: null,
      expiresAt: null,
    });
  });
});

describe("link activity", () => {
  const now = 1_000;

  test("disabled wins, and expiry uses the same instant as the redirect", () => {
    expect(linkActivity({ disabled: true, expiresAt: 1 }, now)).toBe(
      "disabled",
    );
    expect(linkActivity({ disabled: false, expiresAt: now }, now)).toBe(
      "expired",
    );
    expect(linkActivity({ disabled: false, expiresAt: now + 1 }, now)).toBe(
      "active",
    );
    expect(linkActivity({ disabled: false }, now)).toBe("active");
  });
});

describe("mutationErrorMessage", () => {
  test("reads the server sentence out of a Convex wrapper", () => {
    const error = new Error(
      "[CONVEX M(features/links:create)] Server Error\nUncaught Error: Slug is already in use.\n    at handler (links.ts:1:1)",
    );
    expect(mutationErrorMessage(error)).toBe("Slug is already in use.");
  });

  test("keeps a plain error and falls back otherwise", () => {
    expect(mutationErrorMessage(new Error("Share with an @ofy.org user."))).toBe(
      "Share with an @ofy.org user.",
    );
    expect(mutationErrorMessage("nope")).toBe("Something went wrong.");
  });
});
