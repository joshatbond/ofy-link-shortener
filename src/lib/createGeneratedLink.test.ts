import { describe, expect, test } from "vitest";
import { createGeneratedLink } from "./createGeneratedLink";

describe("createGeneratedLink", () => {
  test("skips reserved login, retries a taken slug, and keeps case", async () => {
    const slugs = ["login", "Ab3xY", "Zz901"];
    const created: Array<{ slug: string; redirectUrl: string }> = [];

    const result = await createGeneratedLink({
      destination: " https://example.com/handbook ",
      nextSlug: () => slugs.shift() ?? "zzzzz",
      create: async (args) => {
        created.push(args);
        if (args.slug === "Ab3xY") {
          throw new Error("Uncaught Error: Slug is already in use.\n");
        }
        return "links:new";
      },
    });

    expect(result).toEqual({ linkId: "links:new", slug: "Zz901" });
    expect(created).toEqual([
      { slug: "Ab3xY", redirectUrl: "https://example.com/handbook" },
      { slug: "Zz901", redirectUrl: "https://example.com/handbook" },
    ]);
  });

  test("does not keep trying after a different failure", async () => {
    let calls = 0;

    await expect(
      createGeneratedLink({
        destination: "https://example.com/a",
        nextSlug: () => "Ab3xY",
        create: async () => {
          calls += 1;
          throw new Error("Not authenticated");
        },
      }),
    ).rejects.toThrow(/Not authenticated/);

    expect(calls).toBe(1);
  });
});
