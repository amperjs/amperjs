import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("errors/tuple", async () => {
  const schema = await importSchema("errors/tuple", "payload.POST");

  const validPayload = {
    stringNumberTuple: ["hello", 42],
    booleanStringTuple: [true, "world"],
    minLengthTuple: ["test", 10],
    maxLengthTuple: ["a", 1, false],
    emailAgeTuple: ["user@example.com", 25],
    configTuple: ["config", 5],
    rangeTuple: [10, 90],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // Type mismatches
      [
        "stringNumberTuple",
        [123, "wrong"],
        MESSAGE_CODES.TYPE_INVALID,
        { type: "string" },
      ],
      [
        "stringNumberTuple",
        ["hello", "not-number"],
        MESSAGE_CODES.TYPE_INVALID,
        { type: "number" },
      ],
      [
        "booleanStringTuple",
        ["not-boolean", "text"],
        MESSAGE_CODES.TYPE_INVALID,
        { type: "boolean" },
      ],

      // Length constraints
      ["minLengthTuple", ["x"], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 2 }],

      [
        "maxLengthTuple",
        ["a", 1, true, "extra"],
        MESSAGE_CODES.ARRAY_ITEMS,
        {},
      ],

      // Refined tuple elements
      [
        "emailAgeTuple",
        ["invalid-email", 25],
        MESSAGE_CODES.STRING_FORMAT_EMAIL,
        { format: "email" },
      ],
      [
        "emailAgeTuple",
        ["user@example.com", -5],
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "emailAgeTuple",
        ["user@example.com", 150],
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 120 },
      ],

      // Const values in tuples
      [
        "configTuple",
        ["wrong", 5],
        MESSAGE_CODES.CONST_MISMATCH,
        { allowedValue: "config" },
      ],
      [
        "configTuple",
        ["config", 0],
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 1 },
      ],

      // Range tuple
      [
        "rangeTuple",
        [-5, 50],
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "rangeTuple",
        [50, 150],
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 100 },
      ],
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
