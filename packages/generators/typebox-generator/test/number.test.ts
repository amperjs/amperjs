import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from ".";

describe("number", async () => {
  const schema = await importSchema("number", "payload.POST");

  const validPayload = {
    minMax: 50, // Between 0 and 100 inclusive
    exclusiveMin: 1, // Greater than 0
    exclusiveMax: 99, // Less than 100
    exclusiveRange: 50, // Between 0 and 100 exclusive
    multipleOfFive: 25, // Multiple of 5
    complexConstraint: 20, // Between 10-50 and multiple of 2
    negativeRange: -50, // Between -100 and -10
    decimalRange: 0.5, // Between 0.1 and 1.0
    integerMultiple: 42, // Integer (multiple of 1)
    positiveOnly: 100, // Zero or positive
    negativeOnly: -50, // Zero or negative
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("valid payload variants", () => {
    const validVariants = [
      {
        // Minimum boundaries
        minMax: 0, // Exactly minimum
        exclusiveMin: 0.1, // Just above exclusive minimum
        exclusiveMax: 99.9, // Just below exclusive maximum
        exclusiveRange: 1, // Just above exclusive minimum
        multipleOfFive: 0, // Zero is multiple of everything
        complexConstraint: 10, // Exactly minimum
        negativeRange: -100, // Exactly minimum
        decimalRange: 0.1, // Exactly minimum
        integerMultiple: 0, // Zero integer
        positiveOnly: 0, // Exactly zero
        negativeOnly: 0, // Exactly zero
      },
      {
        // Maximum boundaries
        minMax: 100, // Exactly maximum
        exclusiveMin: 1000, // Large positive
        exclusiveMax: -1000, // Large negative
        exclusiveRange: 99, // Just below exclusive maximum
        multipleOfFive: 100, // Large multiple
        complexConstraint: 50, // Exactly maximum
        negativeRange: -10, // Exactly maximum
        decimalRange: 1.0, // Exactly maximum
        integerMultiple: -1, // Negative integer
        positiveOnly: 999, // Large positive
        negativeOnly: -999, // Large negative
      },
      {
        // Middle values
        minMax: 75,
        exclusiveMin: 50,
        exclusiveMax: 50,
        exclusiveRange: 50,
        multipleOfFive: -15, // Negative multiple
        complexConstraint: 24, // Even number in range
        negativeRange: -75,
        decimalRange: 0.75,
        integerMultiple: 123,
        positiveOnly: 0.5, // Positive decimal
        negativeOnly: -0.5, // Negative decimal
      },
    ];

    for (const variant of validVariants) {
      expect(schema?.check(variant)).toEqual(true);
    }
  });

  test("invalid number properties", () => {
    for (const [name, value, errorCode] of [
      // minMax violations
      ["minMax", -1, MESSAGE_CODES.NUMBER_MINIMUM], // Below minimum
      ["minMax", 101, MESSAGE_CODES.NUMBER_MAXIMUM], // Above maximum
      ["minMax", 100.1, MESSAGE_CODES.NUMBER_MAXIMUM], // Decimal above max

      // exclusiveMin violations
      ["exclusiveMin", 0, MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM], // Equal to exclusive minimum (should fail)
      ["exclusiveMin", -1, MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM], // Below exclusive minimum

      // exclusiveMax violations
      ["exclusiveMax", 100, MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM], // Equal to exclusive maximum (should fail)
      ["exclusiveMax", 100.1, MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM], // Above exclusive maximum

      // exclusiveRange violations
      ["exclusiveRange", 0, MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM], // Equal to exclusive minimum
      ["exclusiveRange", 100, MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM], // Equal to exclusive maximum
      ["exclusiveRange", -1, MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM], // Below range
      ["exclusiveRange", 101, MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM], // Above range

      // multipleOfFive violations
      ["multipleOfFive", 1, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Not multiple of 5
      ["multipleOfFive", 22, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Not multiple of 5
      ["multipleOfFive", 3.14, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Decimal not multiple

      // complexConstraint violations
      ["complexConstraint", 9, MESSAGE_CODES.NUMBER_MINIMUM], // Below minimum
      ["complexConstraint", 51, MESSAGE_CODES.NUMBER_MAXIMUM], // Above maximum
      ["complexConstraint", 11, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Not multiple of 2
      ["complexConstraint", 49, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Not multiple of 2

      // negativeRange violations
      ["negativeRange", -101, MESSAGE_CODES.NUMBER_MINIMUM], // Below minimum
      ["negativeRange", -9, MESSAGE_CODES.NUMBER_MAXIMUM], // Above maximum
      ["negativeRange", 0, MESSAGE_CODES.NUMBER_MAXIMUM], // Positive (out of range)

      // decimalRange violations
      ["decimalRange", 0.0, MESSAGE_CODES.NUMBER_MINIMUM], // Below minimum
      ["decimalRange", 1.1, MESSAGE_CODES.NUMBER_MAXIMUM], // Above maximum
      ["decimalRange", -0.1, MESSAGE_CODES.NUMBER_MINIMUM], // Negative (out of range)

      // integerMultiple violations
      ["integerMultiple", 3.14, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Not integer
      ["integerMultiple", 0.5, MESSAGE_CODES.NUMBER_MULTIPLE_OF], // Decimal

      // positiveOnly violations
      ["positiveOnly", -1, MESSAGE_CODES.NUMBER_MINIMUM], // Negative
      ["positiveOnly", -0.1, MESSAGE_CODES.NUMBER_MINIMUM], // Negative decimal

      // negativeOnly violations
      ["negativeOnly", 1, MESSAGE_CODES.NUMBER_MAXIMUM], // Positive
      ["negativeOnly", 0.1, MESSAGE_CODES.NUMBER_MAXIMUM], // Positive decimal

      // Type violations
      ["minMax", "50", MESSAGE_CODES.TYPE_INVALID], // String instead of number
      ["multipleOfFive", true, MESSAGE_CODES.TYPE_INVALID], // Boolean
      ["complexConstraint", null, MESSAGE_CODES.TYPE_INVALID], // Null
      ["decimalRange", undefined, MESSAGE_CODES.TYPE_INVALID], // Undefined
      ["integerMultiple", [42], MESSAGE_CODES.TYPE_INVALID], // Array
      ["positiveOnly", { value: 50 }, MESSAGE_CODES.TYPE_INVALID], // Object
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${value}`,
      ).toEqual(false);
      expect(
        error.code,
        `invalid ${name}: ${value} ${JSON.stringify(error, null, 2)}`,
      ).toEqual(errorCode);
    }
  });

  test("edge cases and boundaries", () => {
    const boundaryCases = [
      {
        description: "minMax exact boundaries",
        payload: {
          ...validPayload,
          minMax: 0, // ✅ Exact minimum
          exclusiveMin: 0.000001, // ✅ Just above exclusive minimum
          exclusiveMax: 99.999999, // ✅ Just below exclusive maximum
        },
        expected: true,
      },
      {
        description: "minMax boundary violations",
        payload: {
          ...validPayload,
          minMax: -0.000001, // ❌ Just below minimum
          exclusiveMin: 0, // ❌ Equal to exclusive minimum
          exclusiveMax: 100, // ❌ Equal to exclusive maximum
        },
        expected: false,
        errorCodes: [
          MESSAGE_CODES.NUMBER_MINIMUM,
          MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM,
          MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM,
        ],
      },
      {
        description: "multipleOf with decimals",
        payload: {
          ...validPayload,
          multipleOfFive: 2.5, // ❌ 2.5 is multiple of 0.5 but not 5
          decimalRange: 0.333333, // ✅ Within decimal range
        },
        expected: false,
        errorCodes: [MESSAGE_CODES.NUMBER_MULTIPLE_OF],
      },
      {
        description: "zero edge cases",
        payload: {
          ...validPayload,
          minMax: 0, // ✅ Zero allowed
          multipleOfFive: 0, // ✅ Zero is multiple of everything
          positiveOnly: 0, // ✅ Zero allowed
          negativeOnly: 0, // ✅ Zero allowed
          exclusiveMin: 0, // ❌ Zero not allowed (exclusive)
          exclusiveMax: 0, // ✅ Zero allowed (less than 100)
        },
        expected: false,
        errorCodes: [MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM],
      },
      {
        description: "large numbers",
        payload: {
          ...validPayload,
          exclusiveMin: 1e6, // ✅ Large positive
          exclusiveMax: -1e6, // ✅ Large negative
          integerMultiple: 999999, // ✅ Large integer
        },
        expected: true,
      },
    ];

    for (const { payload, expected, errorCodes } of boundaryCases) {
      expect(schema?.check(payload)).toEqual(expected);
      if (errorCodes) {
        const errors = schema?.errors(payload) || [];
        expect(errors.map((e) => e.code)).toEqual(errorCodes);
      }
    }
  });
});
