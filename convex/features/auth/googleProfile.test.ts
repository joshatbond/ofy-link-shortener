import { describe, expect, test } from "vitest";
import { googleAccountProfile } from "./googleProfile";

describe("googleAccountProfile", () => {
  test("accepts an @ofy.org account when email_verified is missing or false", () => {
    expect(
      googleAccountProfile({
        sub: "google-user",
        name: "Ada",
        email: "Ada@ofy.org",
        picture: "https://example.com/ada.png",
        email_verified: false,
      }),
    ).toEqual({
      id: "google-user",
      name: "Ada",
      email: "ada@ofy.org",
      image: "https://example.com/ada.png",
      emailVerified: false,
    });

    expect(
      googleAccountProfile({
        sub: "google-user",
        email: "teacher@ofy.org",
      }).emailVerified,
    ).toBe(false);
  });

  test("passes a true email_verified claim through unchanged", () => {
    expect(
      googleAccountProfile({
        sub: "google-user",
        email: "teacher@ofy.org",
        email_verified: true,
      }).emailVerified,
    ).toBe(true);
  });

  test("still rejects an email outside @ofy.org", () => {
    expect(() =>
      googleAccountProfile({
        sub: "google-user",
        email: "teacher@gmail.com",
        email_verified: true,
      }),
    ).toThrow(/@ofy.org/);
  });
});
