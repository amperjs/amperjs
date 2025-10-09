import { describe, expect, test } from "vitest";

import { importSchema } from "@test/lib";

describe("array/prefix/object", async () => {
  const schema = await importSchema("array/prefix/object", "payload.POST");

  const validPayload = {
    simpleObject: [{ name: "John", age: 25 }],
    multiObject: [
      { user: "john_doe", role: "admin" },
      { enabled: true, priority: 3 },
    ],
    nestedObject: [{ profile: { name: "Alice", settings: { theme: "dark" } } }],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid object prefix properties", () => {
    for (const [name, value] of [
      ["simpleObject", [{ name: "J", age: 25 }]],
      ["simpleObject", [{ name: "John", age: 17 }]],
      [
        "multiObject",
        [
          { user: "john doe", role: "admin" },
          { enabled: true, priority: 3 },
        ],
      ],
      [
        "multiObject",
        [
          { user: "john_doe", role: "moderator" },
          { enabled: true, priority: 3 },
        ],
      ],
      [
        "multiObject",
        [
          { user: "john_doe", role: "admin" },
          { enabled: true, priority: 0 },
        ],
      ],
      ["nestedObject", [{}]], // ❌ Missing "profile" entirely
      ["nestedObject", [{ profile: { name: "Alice" } }]], // ❌ Missing "settings" object
      ["nestedObject", [{ profile: { name: "Alice", settings: {} } }]], // ❌ Missing "theme" property
      [
        "nestedObject",
        [{ profile: { name: "", settings: { theme: "light" } } }],
      ], // ❌ Empty name
      [
        "nestedObject",
        [{ profile: { name: "Alice", settings: { theme: "blue" } } }],
      ], // ❌ Invalid theme value
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value, null, 2)}`,
      ).toEqual(false);
    }
  });
});
