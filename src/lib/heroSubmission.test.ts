import { describe, expect, test } from "vitest";
import { heroSubmission } from "./heroSubmission";

describe("heroSubmission", () => {
  test("a null viewer saves the destination and QR choice for sign-in", () => {
    expect(
      heroSubmission({
        destination: " https://example.com/handbook ",
        intent: "qr",
        viewerId: null,
      }),
    ).toEqual({
      type: "sign-in",
      draft: {
        destination: "https://example.com/handbook",
        qr: true,
      },
    });
  });

  test("a viewer id creates without asking for a slug", () => {
    expect(
      heroSubmission({
        destination: "https://example.com/notes",
        intent: "shorten",
        viewerId: "users:abc",
      }),
    ).toEqual({
      type: "create",
      destination: "https://example.com/notes",
      qr: false,
    });
  });

  test("an empty or non-http destination stays on the form", () => {
    expect(
      heroSubmission({
        destination: "notes",
        intent: "shorten",
        viewerId: null,
      }),
    ).toEqual({
      type: "invalid",
      message: "Enter an http or https URL.",
    });
  });
});
