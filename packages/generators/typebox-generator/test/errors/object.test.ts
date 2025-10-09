import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("errors/object", async () => {
  const schema = await importSchema("errors/object", "payload.POST");

  const validPayload = {
    requiredProps: {
      id: "123",
      name: "John",
      email: "john@example.com",
    },
    optionalProps: {
      id: "456",
      description: "Optional text",
    },
    noAdditionalProps: {
      id: "789",
      name: "Jane",
    },
    minProperties: {
      prop1: "value1",
      prop2: "value2",
    },
    maxProperties: {
      a: 1,
      b: 2,
      c: 3,
    },
    nestedObject: {
      user: {
        profile: {
          name: "Alice",
          settings: {
            theme: "dark",
            notifications: true,
          },
        },
      },
    },
    dynamicKeys: {
      validkey: 10,
      anotherkey: 20,
    },
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // Required properties
      [
        "requiredProps",
        { id: "123", name: "John" },
        MESSAGE_CODES.OBJECT_REQUIRED,
        { requiredProperties: ["email"] },
      ],
      [
        "requiredProps",
        { id: "123" },
        MESSAGE_CODES.OBJECT_REQUIRED,
        { requiredProperties: ["name", "email"] },
      ],
      [
        "requiredProps",
        {},
        MESSAGE_CODES.OBJECT_REQUIRED,
        { requiredProperties: ["id", "name", "email"] },
      ],

      // Additional properties
      [
        "noAdditionalProps",
        { id: "789", name: "Jane", extra: "not-allowed" },
        MESSAGE_CODES.OBJECT_ADDITIONAL_PROPERTIES,
        { additionalProperties: ["extra"] },
      ],

      // Property count
      [
        "minProperties",
        { prop1: "value" },
        MESSAGE_CODES.OBJECT_MIN_PROPERTIES,
        { limit: 2 },
      ],
      [
        "maxProperties",
        { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 },
        MESSAGE_CODES.OBJECT_MAX_PROPERTIES,
        { limit: 5 },
      ],

      // Nested validation
      [
        "nestedObject",
        {
          user: {
            profile: { name: "Alice", settings: { notifications: true } },
          },
        },
        MESSAGE_CODES.OBJECT_REQUIRED,
        { requiredProperties: ["theme"] },
      ],
      [
        "nestedObject",
        {
          user: {
            profile: {
              name: "Alice",
              settings: { theme: "invalid", notifications: true },
            },
          },
        },
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: ["light", "dark"] },
      ],

      // Property names pattern
      [
        "dynamicKeys",
        { "Invalid-Key": 10 },
        MESSAGE_CODES.OBJECT_PROPERTY_NAMES,
        { propertyNames: ["Invalid-Key"] },
      ],
      [
        "dynamicKeys",
        { "123number": 10 },
        MESSAGE_CODES.OBJECT_PROPERTY_NAMES,
        { propertyNames: ["123number"] },
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
