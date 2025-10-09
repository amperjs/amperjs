import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

import { MESSAGE_CODES } from "@/error-handler";

describe("array/prefix/mixed", async () => {
  const schema = await importSchema("array/prefix/mixed", "payload.POST");

  const validPayload = {
    simpleMixed: ["config", 5, true],
    complexMixed: ["Admin", 2.5, false, "end"],
    formatMixed: ["test@example.com", "2024-01-01", 0],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid mixed prefix properties", () => {
    for (const [name, value, errorCode] of [
      ["simpleMixed", ["setup", 5, true], MESSAGE_CODES.CONST_MISMATCH],
      ["simpleMixed", ["config", 0, true], MESSAGE_CODES.NUMBER_MINIMUM],
      ["simpleMixed", ["config", 5], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "complexMixed",
        ["admin", 2.5, false, "end"],
        MESSAGE_CODES.STRING_PATTERN,
      ],
      [
        "complexMixed",
        ["Admin", 2.6, false, "end"],
        MESSAGE_CODES.NUMBER_MULTIPLE_OF,
      ],
      [
        "complexMixed",
        ["Admin", 2.5, false, "toolong"],
        MESSAGE_CODES.STRING_MAX_LENGTH,
      ],
      ["complexMixed", ["Admin", 2.5, false], MESSAGE_CODES.ARRAY_MIN_ITEMS],
      [
        "formatMixed",
        ["invalid-email", "2024-01-01", 0],
        MESSAGE_CODES.STRING_FORMAT_EMAIL,
      ],
      [
        "formatMixed",
        ["test@example.com", "not-a-date", 0],
        MESSAGE_CODES.STRING_FORMAT_DATE,
      ],
      [
        "formatMixed",
        ["test@example.com", "2024-01-01", -1],
        MESSAGE_CODES.NUMBER_MINIMUM,
      ],
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
