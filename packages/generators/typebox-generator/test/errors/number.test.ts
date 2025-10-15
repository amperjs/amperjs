import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "..";

describe("errors/number", async () => {
  const schema = await importSchema("errors/number", "payload.POST");

  const validPayload = {
    minimum: 10,
    maximum: 50,
    minMax: 45,
    exclusiveMinimum: 1,
    exclusiveMaximum: 99,
    exclusiveRange: 50,
    multipleOf5: 15,
    multipleOfDecimal: 2.5,
    positiveMultiple: 20,
    negativeOnly: -5,
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // minimum
      [
        "minimum",
        -1,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "minimum",
        -10,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],

      // maximum
      [
        "maximum",
        101,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 100 },
      ],
      [
        "maximum",
        200,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 100 },
      ],

      // minMax
      [
        "minMax",
        5,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 10 },
      ],
      [
        "minMax",
        95,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 90 },
      ],

      // exclusiveMinimum
      [
        "exclusiveMinimum",
        0,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM,
        { comparison: ">", limit: 0 },
      ],
      [
        "exclusiveMinimum",
        -5,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM,
        { comparison: ">", limit: 0 },
      ],

      // exclusiveMaximum
      [
        "exclusiveMaximum",
        100,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM,
        { comparison: "<", limit: 100 },
      ],
      [
        "exclusiveMaximum",
        101,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM,
        { comparison: "<", limit: 100 },
      ],

      // exclusiveRange
      [
        "exclusiveRange",
        0,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM,
        { comparison: ">", limit: 0 },
      ],
      [
        "exclusiveRange",
        100,
        MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM,
        { comparison: "<", limit: 100 },
      ],

      // multipleOf
      ["multipleOf5", 7, MESSAGE_CODES.NUMBER_MULTIPLE_OF, { multipleOf: 5 }],
      ["multipleOf5", 13, MESSAGE_CODES.NUMBER_MULTIPLE_OF, { multipleOf: 5 }],
      [
        "multipleOfDecimal",
        2.3,
        MESSAGE_CODES.NUMBER_MULTIPLE_OF,
        { multipleOf: 0.25 },
      ],

      // combined constraints
      [
        "positiveMultiple",
        -10,
        MESSAGE_CODES.NUMBER_MINIMUM,
        { comparison: ">=", limit: 0 },
      ],
      [
        "positiveMultiple",
        15,
        MESSAGE_CODES.NUMBER_MULTIPLE_OF,
        { multipleOf: 10 },
      ],
      [
        "negativeOnly",
        1,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 0 },
      ],
      [
        "negativeOnly",
        10,
        MESSAGE_CODES.NUMBER_MAXIMUM,
        { comparison: "<=", limit: 0 },
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
