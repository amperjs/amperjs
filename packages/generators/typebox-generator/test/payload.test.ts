import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from ".";

describe("payload", () => {
  describe("UserRegistration", async () => {
    const schema = await importSchema(
      "payload/UserRegistration",
      "payload.POST",
    );

    const validPayload = {
      email: "john.doe@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15",
      agreeToTerms: true,
      marketingOptIn: false,
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value, errorCode] of [
        ["email", "invalid-email", MESSAGE_CODES.STRING_FORMAT_EMAIL],
        ["email", 123, MESSAGE_CODES.TYPE_INVALID],
        ["password", "short1", MESSAGE_CODES.STRING_PATTERN],
        ["password", 123, MESSAGE_CODES.TYPE_INVALID],
        ["dateOfBirth", "not-a-date", MESSAGE_CODES.STRING_FORMAT_DATE],
        ["dateOfBirth", 1990, MESSAGE_CODES.TYPE_INVALID],
        ["agreeToTerms", "yes", MESSAGE_CODES.TYPE_INVALID],
      ] as const) {
        const data = { ...validPayload, [name]: value };
        const [error] = schema?.errors(data) || [];
        expect(schema?.check(data), `invalid ${name}: ${value}`).toEqual(false);
        expect(
          error.code,
          `invalid ${name}: ${value} ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);
      }
    });
  });

  describe("CreateOrder", async () => {
    const schema = await importSchema("payload/CreateOrder", "payload.POST");
    const validPayload = {
      userId: "user-123",
      items: [
        {
          productId: "prod-456",
          quantity: 2,
          price: 29.99,
          variants: { color: "blue" },
        },
      ],
      shippingAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      paymentMethod: "credit_card",
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value, errorCode] of [
        ["userId", "invalid@user!id", MESSAGE_CODES.STRING_PATTERN],
        ["userId", 123, MESSAGE_CODES.TYPE_INVALID],
        [
          "items",
          [{ productId: "invalid@id", quantity: 1, price: 10 }],
          MESSAGE_CODES.STRING_PATTERN,
        ],
        [
          "items",
          [{ productId: "prod-456", quantity: 0, price: 29.99 }],
          MESSAGE_CODES.NUMBER_MINIMUM,
        ],
        [
          "items",
          [{ productId: "prod-456", quantity: 101, price: 29.99 }],
          MESSAGE_CODES.NUMBER_MAXIMUM,
        ],
        [
          "shippingAddress",
          {
            street: "",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
          },
          MESSAGE_CODES.STRING_MIN_LENGTH,
        ],
        [
          "shippingAddress",
          {
            street: "123 Main St",
            city: "New York",
            state: "N",
            zipCode: "10001",
            country: "USA",
          },
          MESSAGE_CODES.STRING_MIN_LENGTH,
        ],
        [
          "shippingAddress",
          {
            street: "123 Main St",
            city: "New York",
            state: "NY",
            zipCode: "invalid",
            country: "USA",
          },
          MESSAGE_CODES.STRING_PATTERN,
        ],
      ] as const) {
        const data = { ...validPayload, [name]: value };
        const [error] = schema?.errors(data) || [];
        expect(
          schema?.check(data),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
        expect(
          error.code,
          `invalid ${name}: ${value} ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);
      }
    });
  });

  describe("CreateBlogPost", async () => {
    const schema = await importSchema("payload/CreateBlogPost", "payload.POST");

    const validPayload = {
      title: "My First Blog Post",
      content: "This is the content of my blog post...",
      tags: ["tech", "programming"],
      category: "Technology",
      isPublished: true,
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["title", ""],
        ["title", "a".repeat(201)],
        ["category", ""],
        ["category", "a".repeat(51)],
        ["scheduledPublishAt", "not-a-date"],
        ["metaDescription", "a".repeat(161)],
      ] as const) {
        expect(
          schema?.check({ ...validPayload, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("FileUploadRequest", async () => {
    const schema = await importSchema(
      "payload/FileUploadRequest",
      "payload.POST",
    );

    const validPayload = {
      fileName: "document.pdf",
      fileSize: 1024000,
      mimeType: "application/pdf",
      isPublic: false,
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value, errorCode] of [
        ["fileName", "", MESSAGE_CODES.STRING_MIN_LENGTH],
        ["fileName", "a".repeat(256), MESSAGE_CODES.STRING_MAX_LENGTH],
        ["fileSize", 0, MESSAGE_CODES.NUMBER_MINIMUM],
        ["fileSize", 5368709121, MESSAGE_CODES.NUMBER_MAXIMUM],
        ["mimeType", "invalid/mime@type", MESSAGE_CODES.STRING_PATTERN],
        ["mimeType", "application/", MESSAGE_CODES.STRING_PATTERN],
      ] as const) {
        const data = { ...validPayload, [name]: value };
        const [error] = schema?.errors(data) || [];
        expect(
          schema?.check(data),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
        expect(
          error.code,
          `invalid ${name}: ${value} ${JSON.stringify(error, null, 2)}`,
        ).toEqual(errorCode);
      }
    });
  });

  describe("PaymentRequest", async () => {
    const schema = await importSchema("payload/PaymentRequest", "payload.POST");

    const validPayload = {
      orderId: "order-789",
      amount: 99.99,
      currency: "USD",
      paymentMethod: {
        type: "card",
        card: {
          number: "4111111111111111",
          expMonth: 12,
          expYear: 2025,
          cvc: "123",
          holderName: "John Doe",
        },
      },
      billingAddress: {
        line1: "456 Payment St",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
        country: "USA",
      },
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["orderId", "invalid@order!id"],
        ["amount", 0],
        ["amount", 1000001],
        ["currency", "US"],
        ["currency", "usd"],
        [
          "paymentMethod",
          {
            type: "card",
            card: {
              number: "411111111111",
              expMonth: 12,
              expYear: 2025,
              cvc: "123",
              holderName: "John Doe",
            },
          },
        ],
        [
          "paymentMethod",
          {
            type: "card",
            card: {
              number: "4111111111111111",
              expMonth: 0,
              expYear: 2025,
              cvc: "123",
              holderName: "John Doe",
            },
          },
        ],
        [
          "paymentMethod",
          {
            type: "card",
            card: {
              number: "4111111111111111",
              expMonth: 12,
              expYear: 2025,
              cvc: "12",
              holderName: "John Doe",
            },
          },
        ],
        [
          "billingAddress",
          {
            line1: "",
            city: "Chicago",
            state: "IL",
            postalCode: "60601",
            country: "USA",
          },
        ],
        [
          "billingAddress",
          {
            line1: "456 Payment St",
            city: "Chicago",
            state: "I",
            postalCode: "60601",
            country: "USA",
          },
        ],
        [
          "billingAddress",
          {
            line1: "456 Payment St",
            city: "Chicago",
            state: "IL",
            postalCode: "invalid",
            country: "USA",
          },
        ],
      ] as const) {
        expect(
          schema?.check({ ...validPayload, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("UpdateUserProfile", async () => {
    const schema = await importSchema(
      "payload/UpdateUserProfile",
      "payload.POST",
    );
    const validPayload = {
      firstName: "Jane",
      phoneNumber: "+1234567890",
      preferences: {
        newsletter: true,
        notifications: { email: true, sms: false, push: true },
        theme: "dark",
      },
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["dateOfBirth", "not-a-date"],
        ["phoneNumber", "1234"],
        ["phoneNumber", "+123"],
        [
          "addresses",
          [
            {
              type: "home",
              street: "",
              city: "City",
              state: "ST",
              zipCode: "12345",
              country: "US",
              isDefault: true,
            },
          ],
        ],
        [
          "addresses",
          [
            {
              type: "home",
              street: "123 St",
              city: "City",
              state: "S",
              zipCode: "12345",
              country: "US",
              isDefault: true,
            },
          ],
        ],
        [
          "addresses",
          [
            {
              type: "home",
              street: "123 St",
              city: "City",
              state: "ST",
              zipCode: "invalid",
              country: "US",
              isDefault: true,
            },
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

  describe("CreateApiKey", async () => {
    const schema = await importSchema("payload/CreateApiKey", "payload.POST");
    const validPayload = {
      name: "Production API Key",
      permissions: ["read", "write"],
      rateLimit: 1000,
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["name", ""],
        ["name", "a".repeat(101)],
        ["expiresAt", "invalid-date"],
        ["rateLimit", 0],
        ["rateLimit", 10001],
      ] as const) {
        expect(
          schema?.check({ ...validPayload, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("SearchQuery", async () => {
    const schema = await importSchema("payload/SearchQuery", "payload.POST");
    const validPayload = {
      query: "laptop",
      filters: {
        category: ["electronics", "computers"],
        priceRange: { min: 500 },
        rating: 4,
        inStock: true,
      },
      pagination: {
        page: 1,
        limit: 20,
        sortBy: "price",
        sortOrder: "asc",
      },
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["query", ""],
        ["query", "a".repeat(101)],
        ["filters", { priceRange: { min: -1 } }],
        ["filters", { rating: 0 }],
        ["filters", { rating: 6 }],
        [
          "pagination",
          { page: 0, limit: 20, sortBy: "price", sortOrder: "asc" },
        ],
        [
          "pagination",
          { page: 1, limit: 0, sortBy: "price", sortOrder: "asc" },
        ],
        [
          "pagination",
          { page: 1, limit: 101, sortBy: "price", sortOrder: "asc" },
        ],
      ] as const) {
        expect(
          schema?.check({ ...validPayload, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("NotificationSubscription", async () => {
    const schema = await importSchema(
      "payload/NotificationSubscription",
      "payload.POST",
    );

    const validPayload = {
      userId: "user-123",
      channels: [
        {
          type: "email",
          target: "user@example.com",
          events: ["order_created", "payment_failed"],
          preferences: {
            frequency: "instant",
            quietHours: { start: "22:00", end: "08:00" },
          },
        },
      ],
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["userId", "invalid@user!id"],
        ["channels", [{ type: "email", target: "", events: [] }]],
        [
          "channels",
          [
            {
              type: "email",
              target: "user@example.com",
              events: [],
              preferences: {
                frequency: "instant",
                quietHours: { start: "25:00", end: "08:00" },
              },
            },
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

  describe("MfaSetup", async () => {
    const schema = await importSchema("payload/MfaSetup", "payload.POST");

    const validPayload = {
      userId: "user-123",
      method: "sms",
      backupCodes: ["code1", "code2", "code3"],
      deviceInfo: {
        name: "iPhone 13",
        type: "mobile",
        os: "iOS 15",
      },
    };

    test("valid payload", () => {
      expect(schema?.check(validPayload)).toEqual(true);
    });

    test("invalid payload properties", () => {
      for (const [name, value] of [
        ["userId", "invalid@user!id"],
        ["email", "invalid-email"],
        ["deviceInfo", { name: "", type: "mobile", os: "iOS 15" }],
        ["deviceInfo", { name: "a".repeat(51), type: "mobile", os: "iOS 15" }],
      ] as const) {
        expect(
          schema?.check({ ...validPayload, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });
});
