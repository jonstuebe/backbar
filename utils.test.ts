import { describe, expect, test } from "@jest/globals";

import { convertToCents } from "./utils";

describe("convertToCents", () => {
  test("converts dollar & cents in string to cents in a number", () => {
    expect(convertToCents("1.00")).toEqual(100);
    expect(convertToCents("10.00")).toEqual(1000);
    expect(convertToCents("5.75")).toEqual(575);
  });
});
