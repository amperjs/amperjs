import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "..";

describe("errors/conditional", async () => {
  const schema = await importSchema("errors/conditional", "payload.POST");

  const validPayload = {
    shippingAddress: {
      country: "US",
      zipCode: "12345",
    },
    userInfo: {
      age: 25,
      hasDriverLicense: true,
    },
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // if/then - US address requires zipCode
      [
        "shippingAddress",
        { country: "US" },
        MESSAGE_CODES.CONDITIONAL_IF,
        { failingKeyword: "then" },
      ],

      // if/then - age >= 18 requires hasDriverLicense
      [
        "userInfo",
        { age: 18 },
        MESSAGE_CODES.CONDITIONAL_IF,
        { failingKeyword: "then" },
      ],
      [
        "userInfo",
        { age: 25 },
        MESSAGE_CODES.CONDITIONAL_IF,
        { failingKeyword: "then" },
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
