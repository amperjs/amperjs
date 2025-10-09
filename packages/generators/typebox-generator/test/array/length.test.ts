import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("array/length", async () => {
  const schema = await importSchema("array/length", "payload.POST");

  const validPayload = {
    stringMinItems: ["item"],
    stringMaxItems: ["a", "b", "c", "d", "e"],
    stringMixedLength: ["one", "two"],
    numberMinItems: [1, 2],
    numberMaxItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    numberMixedLength: [10, 20],
    booleanMinItems: [true],
    booleanMaxItems: [true, false],
    uniqueStrings: ["a", "b", "c"],
    uniqueNumbers: [1, 2, 3],
    uniqueBooleans: [true, false],
    complexLength: ["a", "b", "c"],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid length properties", () => {
    for (const [name, value, errorCode] of [
      ["stringMinItems", [], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "stringMaxItems",
        ["a", "b", "c", "d", "e", "f"],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
      ],
      ["stringMixedLength", [], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "stringMixedLength",
        ["a", "b", "c", "d", "e", "f"],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
      ],
      ["numberMinItems", [1], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "numberMaxItems",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
      ],
      ["numberMixedLength", [1], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "numberMixedLength",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
      ],
      ["booleanMinItems", [], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "booleanMaxItems",
        [true, false, true, false],
        MESSAGE_CODES.ARRAY_MAX_ITEMS,
      ],
      ["uniqueStrings", ["a", "a", "b"], MESSAGE_CODES.ARRAY_UNIQUE_ITEMS],
      ["uniqueNumbers", [1, 2, 2], MESSAGE_CODES.ARRAY_UNIQUE_ITEMS],
      ["uniqueBooleans", [true, true], MESSAGE_CODES.ARRAY_UNIQUE_ITEMS],
      ["complexLength", ["a"], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      ["complexLength", ["a", "b", "c", "d"], MESSAGE_CODES.ARRAY_MAX_ITEMS],
      ["complexLength", ["a", "a", "b"], MESSAGE_CODES.ARRAY_UNIQUE_ITEMS],
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];
      expect(
        schema?.check(data),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
      expect(error.code).toEqual(errorCode);
    }
  });
});
