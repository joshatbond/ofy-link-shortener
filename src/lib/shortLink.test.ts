import { describe, expect, test } from "vitest";
import { shortLinkLabel, shortLinkUrl } from "./shortLink";

describe("short link", () => {
  test("uses https://ofy.sh and keeps the slug's case", () => {
    expect(shortLinkUrl("Ab3xY")).toBe("https://ofy.sh/Ab3xY");
    expect(shortLinkLabel("Ab3xY")).toBe("ofy.sh/Ab3xY");
    expect(shortLinkUrl("Ab3xY")).not.toContain("sc.ofy.sh");
  });
});
