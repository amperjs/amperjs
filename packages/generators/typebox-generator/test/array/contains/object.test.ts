import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

describe("array/contains/object", async () => {
  const schema = await importSchema("array/contains/object", "payload.POST");

  const validPayload = {
    simpleObject: [
      { role: "user", level: 1 },
      { role: "manager", level: 3 },
    ],
    multipleProps: [
      { category: "basic", price: 50 },
      { category: "premium", price: 200 },
    ],
    minContains: [
      { status: "low", priority: 1 },
      { status: "critical", priority: 5 },
    ],
    maxContains: [
      { type: "user", enabled: true },
      { type: "admin", enabled: true },
    ],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid object contains properties", () => {
    for (const [name, value] of [
      ["simpleObject", [{ role: "user", level: 1 }]],
      ["simpleObject", [{ role: "manager", level: 1 }]],
      ["multipleProps", [{ category: "basic", price: 50 }]],
      ["multipleProps", [{ category: "premium", price: 50 }]],
      ["minContains", [{ status: "low", priority: 1 }]],
      ["minContains", [{ status: "critical", priority: 3 }]],
      [
        "maxContains",
        [
          { type: "admin", enabled: true },
          { type: "admin", enabled: true },
          { type: "admin", enabled: true },
        ],
      ],
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
    }
  });
});
