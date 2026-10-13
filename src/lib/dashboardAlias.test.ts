import { describe, expect, test } from "vitest";
import { dashboardAlias } from "./dashboardAlias";

describe("dashboardAlias", () => {
  test("stays while the OAuth code is unread", () => {
    expect(dashboardAlias("?code=67749730")).toBe("stay");
  });

  test("goes to / once the code is gone", () => {
    expect(dashboardAlias("")).toBe("/");
    expect(dashboardAlias("?foo=1")).toBe("/");
  });

  test("an empty code is not the OAuth code", () => {
    expect(dashboardAlias("?code=")).toBe("/");
  });
});
