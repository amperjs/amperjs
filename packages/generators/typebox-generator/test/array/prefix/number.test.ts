import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

describe("array/prefix/number", async () => {
  const schema = await importSchema("array/prefix/number", "payload.POST");

  const validPayload = {
    rangeTuple: [0, 100],
    valueTuple: [1, 2, 3],
    complexTuple: [1, 10, 15],
    decimalTuple: [0.5, 0.25],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid number prefix properties", () => {
    for (const [name, value] of [
      ["rangeTuple", [-1, 100]],
      ["rangeTuple", [0, 101]],
      ["valueTuple", [1, 2]],
      ["valueTuple", [1, 2, 4]],
      ["complexTuple", [0, 10, 15]],
      ["complexTuple", [1, 7, 15]],
      ["complexTuple", [1, 10, 25]],
      ["decimalTuple", [-0.1, 0.25]], // ❌ First item < 0.0
      ["decimalTuple", [1.1, 0.25]], // ❌ First item > 1.0
      ["decimalTuple", [0.5, 0.3]], // ❌ Second item not multiple of 0.25
      ["decimalTuple", [0.5, 0.26]], // ❌ Second item not multiple of 0.25
      ["decimalTuple", [0.5]], // ❌ Missing second item
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
    }
  });
});
