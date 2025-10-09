import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

describe("array/contains/string", async () => {
  const schema = await importSchema("array/contains/string", "payload.POST");

  const validPayload = {
    constContains: ["user", "admin", "guest"],
    patternContains: ["VIP_user", "regular"],
    enumContains: ["pending", "active", "completed"],
    minContains: ["gold", "silver", "gold"],
    maxContains: ["silver", "bronze"],
    minMaxContains: ["premium", "basic"],
    multiConstraintContains: ["Admin", "User", "Guest"],
    emailContains: ["test@example.com", "user"],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid string contains properties", () => {
    for (const [name, value] of [
      ["constContains", ["user", "guest"]],
      ["patternContains", ["user", "regular"]],
      ["enumContains", ["invalid", "status"]],
      ["minContains", ["gold", "silver"]],
      ["minContains", ["silver", "bronze"]],
      ["maxContains", ["silver", "silver", "silver", "silver"]],
      ["minMaxContains", ["basic", "standard"]],
      ["minMaxContains", ["premium", "premium", "premium"]],
      ["multiConstraintContains", ["admin", "user"]],
      ["multiConstraintContains", ["ADMINISTRATOR"]],
      ["multiConstraintContains", ["A"]],
      ["emailContains", ["user", "guest"]],
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
    }
  });
});
