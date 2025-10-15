import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "..";

describe("errors/type", async () => {
  const schema = await importSchema("errors/type", "payload.POST");

  const validPayload = {
    stringType: "hello",
    numberType: 42,
    booleanType: true,
    arrayType: [1, 2, 3],
    objectType: { key: "value" },
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      ["stringType", 123, MESSAGE_CODES.TYPE_INVALID, { type: "string" }],
      ["stringType", true, MESSAGE_CODES.TYPE_INVALID, { type: "string" }],
      ["numberType", "123", MESSAGE_CODES.TYPE_INVALID, { type: "number" }],
      ["numberType", false, MESSAGE_CODES.TYPE_INVALID, { type: "number" }],
      ["booleanType", "true", MESSAGE_CODES.TYPE_INVALID, { type: "boolean" }],
      ["booleanType", 1, MESSAGE_CODES.TYPE_INVALID, { type: "boolean" }],
      ["arrayType", {}, MESSAGE_CODES.TYPE_INVALID, { type: "array" }],
      ["arrayType", "[]", MESSAGE_CODES.TYPE_INVALID, { type: "array" }],
      ["objectType", [], MESSAGE_CODES.TYPE_INVALID, { type: "object" }],
      ["objectType", "object", MESSAGE_CODES.TYPE_INVALID, { type: "object" }],
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
