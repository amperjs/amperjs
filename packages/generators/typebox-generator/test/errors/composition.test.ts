import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("errors/composition", async () => {
  const schema = await importSchema("errors/composition", "payload.POST");

  const validPayload = {
    allOfConstraints: 50,
    flexibleValue: "text",
    constrainedString: "hello123",
    positiveNumber: 10,
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // allOf-like: multiple constraints on number (all must pass)
      [
        "allOfConstraints",
        -5,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "allOfConstraints",
        105,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 100 },
      ],
      [
        "allOfConstraints",
        7,
        MESSAGE_CODES.NUMBER_MULTIPLE_OF,
        { multipleOf: 5 },
      ],
      [
        "allOfConstraints",
        3,
        MESSAGE_CODES.NUMBER_MULTIPLE_OF,
        { multipleOf: 5 },
      ],

      // Union type (anyOf-like): must be one of the allowed types
      ["flexibleValue", null, MESSAGE_CODES.TYPE_INVALID, { type: "string" }],
      ["flexibleValue", [], MESSAGE_CODES.TYPE_INVALID, { type: "string" }],
      ["flexibleValue", {}, MESSAGE_CODES.TYPE_INVALID, { type: "string" }],

      // Multiple string constraints (allOf-like)
      [
        "constrainedString",
        "hi",
        MESSAGE_CODES.STRING_MIN_LENGTH,
        { limit: 5 },
      ],
      [
        "constrainedString",
        "a".repeat(25),
        MESSAGE_CODES.STRING_MAX_LENGTH,
        { limit: 20 },
      ],
      [
        "constrainedString",
        "hello!",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^[a-zA-Z0-9]+$" },
      ],
      [
        "constrainedString",
        "hello world",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^[a-zA-Z0-9]+$" },
      ],

      // Positive number constraint
      [
        "positiveNumber",
        -1,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "positiveNumber",
        -100,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
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
