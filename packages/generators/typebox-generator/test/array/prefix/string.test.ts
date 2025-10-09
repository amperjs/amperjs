import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

describe("array/prefix/string", async () => {
  const schema = await importSchema("array/prefix/string", "payload.POST");

  const validPayload = {
    constTuple: ["start", "end"],
    patternTuple: ["Admin", "username"],
    lengthTuple: ["a", "abcde", "xyz"],
    mixedString: ["user", "test@example.com", "123-456-7890"],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid string prefix properties", () => {
    for (const [name, value] of [
      ["constTuple", ["begin", "end"]],
      ["constTuple", ["start"]],
      ["patternTuple", ["admin", "username"]],
      ["patternTuple", ["Admin", "User123"]],
      ["lengthTuple", ["", "abcde", "xyz"]],
      ["lengthTuple", ["a", "abcdef", "xyz"]],
      ["lengthTuple", ["a", "abcde", "x"]],
      ["mixedString", ["admin", "test@example.com", "123-456-7890"]],
      ["mixedString", ["user", "invalid-email", "123-456-7890"]],
      ["mixedString", ["user", "test@example.com", "1234567890"]],
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
    }
  });
});
