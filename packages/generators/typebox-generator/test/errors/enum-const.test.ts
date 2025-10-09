import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("errors/enum-const", async () => {
  const schema = await importSchema("errors/enum-const", "payload.POST");

  const validPayload = {
    status: "active",
    priority: 3,
    booleanEnum: true,
    version: "1.0.0",
    apiVersion: 2,
    enabled: true,
    mixedEnum: "auto",
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // Enum validation
      [
        "status",
        "invalid",
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: ["pending", "active", "completed", "failed"] },
      ],
      [
        "status",
        "pending-review",
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: ["pending", "active", "completed", "failed"] },
      ],
      [
        "priority",
        0,
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: [1, 2, 3, 4, 5] },
      ],
      [
        "priority",
        6,
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: [1, 2, 3, 4, 5] },
      ],

      // Const validation
      [
        "version",
        "2.0.0",
        MESSAGE_CODES.CONST_MISMATCH,
        { allowedValue: "1.0.0" },
      ],
      [
        "version",
        "1.0.1",
        MESSAGE_CODES.CONST_MISMATCH,
        { allowedValue: "1.0.0" },
      ],
      ["apiVersion", 1, MESSAGE_CODES.CONST_MISMATCH, { allowedValue: 2 }],
      ["apiVersion", 3, MESSAGE_CODES.CONST_MISMATCH, { allowedValue: 2 }],
      ["enabled", false, MESSAGE_CODES.CONST_MISMATCH, { allowedValue: true }],

      // Mixed enum
      [
        "mixedEnum",
        "manual",
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: ["auto", 0, 100] },
      ],
      [
        "mixedEnum",
        50,
        MESSAGE_CODES.ENUM_MISMATCH,
        { allowedValues: ["auto", 0, 100] },
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
