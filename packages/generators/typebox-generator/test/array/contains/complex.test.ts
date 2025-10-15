import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "../..";

describe("array/contains/complex", async () => {
  const schema = await importSchema("array/contains/complex", "payload.POST");

  const validPayload = {
    nestedArray: [
      { user: "admin-john", permissions: ["read", "delete"] },
      { user: "regular", permissions: ["read"] },
    ],
    deepNested: [
      {
        profile: {
          name: "John",
          settings: { theme: "dark", notifications: true },
        },
      },
    ],
    multiConstraint: [
      {
        id: "user_123",
        tags: ["verified"],
        metadata: { createdAt: "2024-01-01" },
      },
    ],
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid complex contains properties", () => {
    for (const [name, value] of [
      ["nestedArray", [{ user: "admin-john", permissions: ["read"] }]],
      ["nestedArray", [{ user: "john", permissions: ["read", "delete"] }]],
      [
        "deepNested",
        [
          {
            profile: {
              name: "John",
              settings: { theme: "light", notifications: true },
            },
          },
        ],
      ],
      [
        "deepNested",
        [
          {
            profile: {
              name: "John",
              settings: { theme: "dark", notifications: false },
            },
          },
        ],
      ],
      [
        "multiConstraint",
        [
          {
            id: "123",
            tags: ["verified"],
            metadata: { createdAt: "2024-01-01" },
          },
        ],
      ],
      [
        "multiConstraint",
        [{ id: "user_123", tags: [], metadata: { createdAt: "2024-01-01" } }],
      ],
      [
        "multiConstraint",
        [{ id: "user_123", tags: ["verified"], metadata: {} }],
      ],
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];
      expect(
        schema?.check(data),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
      expect(error.code).toEqual(MESSAGE_CODES.ARRAY_CONTAINS);
    }
  });
});
