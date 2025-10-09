import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("errors/array", async () => {
  const schema = await importSchema("errors/array", "payload.POST");

  const validPayload = {
    minItems: [1],
    maxItems: [1, 2, 3],
    minMaxItems: [1, 2, 3],
    uniqueItems: [1, 2, 3, 4, 5],
    uniqueStrings: ["a", "b", "c"],
    containsNumber: [1, "text", true],
    containsPositive: [1, 2, 3],
    numberArray: [1, 2, 3],
    stringArray: ["hello", "world"],
    objectArray: [{ id: "1", value: 10 }],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // minItems
      ["minItems", [], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 1 }],

      // maxItems
      [
        "maxItems",
        [1, 2, 3, 4, 5, 6],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
        { limit: 5 },
      ],

      // minMaxItems
      ["minMaxItems", [1], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 2 }],
      [
        "minMaxItems",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
        { limit: 10 },
      ],

      // uniqueItems
      [
        "uniqueItems",
        [1, 2, 3, 2, 4],
        MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
        { duplicateItems: [3] },
      ],
      [
        "uniqueItems",
        [1, 1, 1],
        MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
        { duplicateItems: [1, 2] },
      ],
      [
        "uniqueStrings",
        ["a", "b", "a"],
        MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
        { duplicateItems: [2] },
      ],

      // contains
      [
        "containsNumber",
        ["text", true, false],
        MESSAGE_CODES.ARRAY_CONTAINS,
        { minContains: 1 },
      ],
      [
        "containsPositive",
        [-1, -2, -3],
        MESSAGE_CODES.ARRAY_CONTAINS,
        { minContains: 1 },
      ],

      // typed arrays
      ["numberArray", [], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 1 }],
      [
        "numberArray",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
        { limit: 10 },
      ],
      ["stringArray", ["a"], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 2 }],
      [
        "stringArray",
        ["a", "b", "a"],
        MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
        { duplicateItems: [2] },
      ],

      // object arrays
      ["objectArray", [], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 1 }],
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];

      expect(
        schema?.check(data),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);

      expect(
        error?.code,
        `invalid ${name}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
      ).toEqual(errorCode);

      expect(
        error?.params,
        `invalid ${name}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
      ).toMatchObject(errorParams);
    }
  });
});
