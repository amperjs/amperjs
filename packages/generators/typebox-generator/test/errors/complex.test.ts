import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "..";

describe("errors/complex", async () => {
  const schema = await importSchema("errors/complex", "payload.POST");

  const validPayload = {
    userRegistration: {
      username: "john_doe",
      email: "john@example.com",
      password: "SecurePass123",
      age: 25,
      roles: ["user"],
    },
    pagination: {
      page: 1,
      pageSize: 20,
      sortBy: "name",
      sortOrder: "asc",
    },
    product: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Product Name",
      price: 29.99,
      tags: ["electronics", "sale"],
      dimensions: {
        width: 10,
        height: 20,
        depth: 5,
      },
      metadata: {
        brand: "BrandName",
        color: "blue",
      },
    },
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  describe("invalid payload properties", () => {
    test("userRegistration", () => {
      for (const [path, value, errorCode, errorParams] of [
        // username
        [
          "userRegistration.username",
          "ab",
          MESSAGE_CODES.STRING_MIN_LENGTH,
          { limit: 3 },
        ],
        [
          "userRegistration.username",
          "a".repeat(21),
          MESSAGE_CODES.STRING_MAX_LENGTH,
          { limit: 20 },
        ],
        [
          "userRegistration.username",
          "user-name!",
          MESSAGE_CODES.STRING_PATTERN,
          { pattern: "^[a-zA-Z0-9_]+$" },
        ],

        // email
        [
          "userRegistration.email",
          "invalid-email",
          MESSAGE_CODES.STRING_FORMAT_EMAIL,
          { format: "email" },
        ],
        [
          "userRegistration.email",
          "user@",
          MESSAGE_CODES.STRING_FORMAT_EMAIL,
          { format: "email" },
        ],

        // password
        [
          "userRegistration.password",
          "short",
          MESSAGE_CODES.STRING_PATTERN,
          { pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)" },
        ],
        [
          "userRegistration.password",
          "alllowercase",
          MESSAGE_CODES.STRING_PATTERN,
          { pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)" },
        ],

        // age
        [
          "userRegistration.age",
          10,
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 13 },
        ],
        [
          "userRegistration.age",
          150,
          MESSAGE_CODES.NUMBER_MAXIMUM,
          { comparison: "<=", limit: 120 },
        ],

        // roles
        [
          "userRegistration.roles",
          [],
          MESSAGE_CODES.ARRAY_MIN_ITEMS,
          { limit: 1 },
        ],
        [
          "userRegistration.roles",
          ["user", "user"],
          MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
          { duplicateItems: [1] },
        ],
        [
          "userRegistration.roles",
          ["invalid"],
          MESSAGE_CODES.ENUM_MISMATCH,
          { allowedValues: ["user", "admin", "moderator"] },
        ],
      ] as const) {
        const [parent, prop] = path.split(".");

        const data = {
          ...validPayload,
          [parent]: {
            ...validPayload[parent as keyof typeof validPayload],
            [prop]: value,
          },
        };

        const [error] = schema?.errors(data) || [];

        expect(
          schema?.check(data),
          `invalid ${path}: ${JSON.stringify(value)}`,
        ).toEqual(false);

        expect(
          error?.code,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);

        expect(
          error?.params,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toMatchObject(errorParams);
      }
    });

    test("pagination", () => {
      for (const [path, value, errorCode, errorParams] of [
        // page
        [
          "pagination.page",
          0,
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 1 },
        ],
        [
          "pagination.page",
          -5,
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 1 },
        ],

        // pageSize
        [
          "pagination.pageSize",
          0,
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 1 },
        ],
        [
          "pagination.pageSize",
          101,
          MESSAGE_CODES.NUMBER_MAXIMUM,
          { comparison: "<=", limit: 100 },
        ],

        // sortBy
        [
          "pagination.sortBy",
          "invalid",
          MESSAGE_CODES.ENUM_MISMATCH,
          { allowedValues: ["name", "date", "price"] },
        ],

        // sortOrder
        [
          "pagination.sortOrder",
          "random",
          MESSAGE_CODES.ENUM_MISMATCH,
          { allowedValues: ["asc", "desc"] },
        ],
      ] as const) {
        const [parent, prop] = path.split(".");

        const data = {
          ...validPayload,
          [parent]: {
            ...validPayload[parent as keyof typeof validPayload],
            [prop]: value,
          },
        };

        const [error] = schema?.errors(data) || [];

        expect(
          schema?.check(data),
          `invalid ${path}: ${JSON.stringify(value)}`,
        ).toEqual(false);

        expect(
          error?.code,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);

        expect(
          error?.params,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toMatchObject(errorParams);
      }
    });

    test("product", () => {
      for (const [path, value, errorCode, errorParams] of [
        // id
        [
          "product.id",
          "not-a-uuid",
          MESSAGE_CODES.STRING_FORMAT_UUID,
          { format: "uuid" },
        ],

        // name
        ["product.name", "", MESSAGE_CODES.STRING_MIN_LENGTH, { limit: 1 }],
        [
          "product.name",
          "x".repeat(101),
          MESSAGE_CODES.STRING_MAX_LENGTH,
          { limit: 100 },
        ],

        // price
        [
          "product.price",
          -5,
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 0 },
        ],
        [
          "product.price",
          29.999,
          MESSAGE_CODES.NUMBER_MULTIPLE_OF,
          { multipleOf: 0.01 },
        ],

        // tags
        ["product.tags", [], MESSAGE_CODES.ARRAY_MIN_ITEMS, { limit: 1 }],
        [
          "product.tags",
          Array(11).fill("tag"),
          MESSAGE_CODES.ARRAY_MAX_ITEMS,
          { limit: 10 },
        ],
        [
          "product.tags",
          ["tag", "tag"],
          MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
          { duplicateItems: [1] },
        ],

        // dimensions
        [
          "product.dimensions",
          { width: -5, height: 10, depth: 5 },
          MESSAGE_CODES.NUMBER_MINIMUM,
          { comparison: ">=", limit: 0 },
        ],

        // metadata
        [
          "product.metadata",
          Object.fromEntries(
            Array(21)
              .fill(0)
              .map((_, i) => [`key${i}`, "value"]),
          ),
          MESSAGE_CODES.OBJECT_MAX_PROPERTIES,
          { limit: 20 },
        ],
      ] as const) {
        const [parent, prop] = path.split(".");

        const data = {
          ...validPayload,
          [parent]: {
            ...validPayload[parent as keyof typeof validPayload],
            [prop]: value,
          },
        };

        const [error] = schema?.errors(data) || [];

        expect(
          schema?.check(data),
          `invalid ${path}: ${JSON.stringify(value)}`,
        ).toEqual(false);

        expect(
          error?.code,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);

        expect(
          error?.params,
          `invalid ${path}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
        ).toMatchObject(errorParams);
      }
    });
  });
});
