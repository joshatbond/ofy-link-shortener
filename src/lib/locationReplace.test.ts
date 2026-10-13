import { describe, expect, test } from "vitest";
import {
  notifyLocationReplaced,
  subscribeLocationReplaced,
} from "./locationReplace";

describe("notifyLocationReplaced", () => {
  test("tells subscribers the auth client replaced the URL", () => {
    let calls = 0;
    const unsubscribe = subscribeLocationReplaced(() => {
      calls += 1;
    });

    notifyLocationReplaced();
    expect(calls).toBe(1);

    unsubscribe();
    notifyLocationReplaced();
    expect(calls).toBe(1);
  });
});
