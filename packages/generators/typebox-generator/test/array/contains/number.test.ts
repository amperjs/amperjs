import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("array/contains/number", async () => {
  const schema = await importSchema("array/contains/number", "payload.POST");

  const validPayload = {
    valueContains: [10, 42, 30],
    rangeContains: [15, 25, 5],
    multipleContains: [5, 10, 15, 3],
    minContains: [100, 150, 200, 50],
    maxContains: [-1, 1, 2],
    minMaxContains: [60, 70, 80, 40],
    exclusiveContains: [1, 50, 99],
    integerContains: [1, 2.0, 3],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid number contains properties", () => {
    for (const [name, value] of [
      ["valueContains", [10, 20, 30]],
      ["rangeContains", [5, 25, 30]],
      ["multipleContains", [1, 2, 3]],
      ["minContains", [50, 60, 70]],
      ["minContains", [100]],
      ["maxContains", [0, -1, -2]],
      ["maxContains", [1, 0, -1]],
      ["minMaxContains", [40, 45, 110]],
      ["minMaxContains", [60, 60, 60, 60, 60]],
      ["exclusiveContains", [0, 100, 150]], // ❌ No numbers between 0-100 exclusive
      ["exclusiveContains", [-10, -5, 0]], // ❌ All numbers ≤ 0
      ["exclusiveContains", [100, 101, 200]], // ❌ All numbers ≥ 100
      ["exclusiveContains", []], // ❌ Empty array (no matches)
      ["integerContains", [1.5, 2.7]],
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];
      expect(
        schema?.check(data),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
      expect(error.code).toEqual(MESSAGE_CODES.ARRAY_CONTAINS);
    }
  });
});
