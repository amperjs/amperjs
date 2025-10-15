import { describe, expect, test } from "vitest";

import { importSchema } from ".";

describe("response", () => {
  describe("UserProfile", async () => {
    const schema = await importSchema("response/UserProfile", "response.POST");

    const validResponse = {
      id: "user-123456",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15", // String
      phoneNumber: "+1234567890",
      avatar: "https://example.com/avatar.jpg",
      emailVerified: true,
      preferences: {
        newsletter: true,
        notifications: { email: true, sms: false, push: true },
        theme: "dark",
      },
      addresses: [
        {
          id: "addr-123",
          type: "home",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
          isDefault: true,
        },
      ],
      createdAt: new Date("2024-01-15T10:00:00Z"), // Date instance
      updatedAt: new Date("2024-01-15T10:30:00Z"), // Date instance
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["id", "invalid@user!id"],
        ["email", "invalid-email"],
        ["dateOfBirth", "not-a-date"],
        ["phoneNumber", "1234"],
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
        ["createdAt", "invalid-date"], // Should be Date, not string
        ["updatedAt", 123], // Should be Date, not number
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("Order", async () => {
    const schema = await importSchema("response/Order", "response.POST");

    const validResponse = {
      orderId: "ord-123456789",
      status: "confirmed",
      totalAmount: 99.99,
      currency: "USD",
      estimatedDelivery: "2024-01-20T00:00:00Z", // String
      items: [
        {
          productId: "prod-123",
          productName: "Laptop",
          quantity: 1,
          unitPrice: 99.99,
          subtotal: 99.99,
        },
      ],
      shippingAddress: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      paymentStatus: "pending",
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["orderId", "invalid@order!id"],
        ["totalAmount", -50],
        ["currency", "US"],
        ["estimatedDelivery", "not-a-date"],
        [
          "items",
          [
            {
              productId: "invalid@id",
              productName: "Test",
              quantity: 1,
              unitPrice: 10,
              subtotal: 10,
            },
          ],
        ],
        [
          "items",
          [
            {
              productId: "prod-123",
              productName: "Test",
              quantity: 0,
              unitPrice: 10,
              subtotal: 10,
            },
          ],
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
        ],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("BlogPost", async () => {
    const schema = await importSchema("response/BlogPost", "response.POST");

    const validResponse = {
      id: "post-123456",
      title: "My First Blog Post",
      content: "This is the content...",
      excerpt: "A brief excerpt",
      author: {
        id: "user-123",
        name: "John Doe",
        avatar: "https://example.com/avatar.jpg",
      },
      tags: ["tech", "programming"],
      category: "Technology",
      status: "published",
      publishedAt: new Date("2024-01-15T10:30:00Z"), // Date instance
      createdAt: "2024-01-15T10:00:00Z", // String
      updatedAt: "2024-01-15T10:30:00Z", // String
      readTime: 5,
      viewCount: 100,
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["id", "invalid@post!id"],
        ["title", ""],
        ["category", "a".repeat(51)],
        ["publishedAt", "not-a-date"], // Should be Date, not string
        ["createdAt", new Date()], // Should be string, not Date
        ["readTime", -5],
        ["viewCount", -10],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  // response-refined.test.ts

  describe("FileUpload", async () => {
    const schema = await importSchema("response/FileUpload", "response.POST");

    const validResponse = {
      fileId: "file-123456",
      fileName: "document.pdf",
      fileUrl: "https://example.com/files/document.pdf",
      fileSize: 1024000,
      mimeType: "application/pdf",
      uploadStatus: "success",
      uploadedAt: new Date("2024-01-15T10:30:00Z"), // Date instance
      expiresAt: "2024-12-31T23:59:59Z", // String
      thumbnailUrl: "https://example.com/files/document-thumb.jpg",
      metadata: {
        dimensions: { width: 1920, height: 1080 },
        duration: 120,
        checksum:
          "a1b2c3d4e5f6789012345678901234567890123456789012345678901234",
      },
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["fileId", "invalid@file!id"],
        ["fileName", ""],
        ["fileUrl", "not-a-url"],
        ["fileSize", 0],
        ["mimeType", "invalid/mime@type"],
        ["uploadedAt", "not-a-date"], // Should be Date, not string
        ["expiresAt", new Date()], // Should be string, not Date
        ["thumbnailUrl", "invalid-url"],
        ["metadata", { checksum: "short" }],
        [
          "metadata",
          { dimensions: { width: 0, height: 1080 }, checksum: "a1b2c3" },
        ],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("Payment", async () => {
    const schema = await importSchema("response/Payment", "response.POST");

    const validResponse = {
      paymentId: "pay-123456",
      orderId: "ord-123456",
      status: "succeeded",
      amount: 99.99,
      currency: "USD",
      paymentMethod: {
        type: "card",
        last4: "4242",
        brand: "visa",
      },
      processedAt: "2024-01-15T10:30:00Z", // String
      failureReason: undefined,
      nextAction: undefined,
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["paymentId", "invalid@pay!id"],
        ["orderId", "invalid@order!id"],
        ["amount", 0],
        ["currency", "US"],
        ["paymentMethod", { type: "card", last4: "123" }], // Too short
        ["paymentMethod", { type: "card", last4: "12345" }], // Too long
        ["processedAt", new Date()], // Should be string, not Date
        ["nextAction", { type: "redirect", url: "invalid-url" }],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("ApiKey", async () => {
    const schema = await importSchema("response/ApiKey", "response.POST");

    const validResponse = {
      id: "key-123456",
      name: "Production API Key",
      key: "sk_live_1234567890abcdef",
      prefix: "sk_live_123",
      permissions: ["read", "write"],
      createdAt: new Date("2024-01-15T10:00:00Z"), // Date instance
      expiresAt: "2024-12-31T23:59:59Z", // String
      lastUsed: new Date("2024-01-15T10:30:00Z"), // Date instance
      rateLimit: 1000,
      allowedIps: ["192.168.1.1", "10.0.0.1"],
      allowedOrigins: ["https://example.com"],
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["id", "invalid@key!id"],
        ["name", ""],
        ["key", "short"],
        ["prefix", ""],
        ["createdAt", "invalid-date"], // Should be Date, not string
        ["expiresAt", new Date()], // Should be string, not Date
        ["lastUsed", "not-a-date"], // Should be Date, not string
        ["rateLimit", 0],
        ["allowedIps", ["invalid-ip"]],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("SearchResults", async () => {
    const schema = await importSchema(
      "response/SearchResults",
      "response.POST",
    );

    const validResponse = {
      query: "laptop",
      results: [{ id: "prod-123", name: "Gaming Laptop", price: 999.99 }],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      },
      filters: {
        applied: { category: ["electronics"] },
        available: {
          categories: [{ name: "electronics", count: 50 }],
          priceRanges: [{ min: 0, max: 1000, count: 30 }],
          ratings: [{ rating: 4, count: 20 }],
        },
      },
      processingTime: 150,
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["query", ""],
        ["query", "a".repeat(101)],
        [
          "pagination",
          {
            page: 0,
            limit: 20,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        ],
        [
          "pagination",
          {
            page: 1,
            limit: 0,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        ],
        [
          "pagination",
          {
            page: 1,
            limit: 101,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        ],
        [
          "pagination",
          {
            page: 1,
            limit: 20,
            total: -1,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        ],
        [
          "filters",
          {
            available: {
              categories: [{ name: "electronics", count: -1 }],
              priceRanges: [],
              ratings: [],
            },
          },
        ],
        [
          "filters",
          {
            available: {
              categories: [],
              priceRanges: [{ min: -1, max: 1000, count: 30 }],
              ratings: [],
            },
          },
        ],
        [
          "filters",
          {
            available: {
              categories: [],
              priceRanges: [],
              ratings: [{ rating: 0, count: 20 }],
            },
          },
        ],
        ["processingTime", -50],
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("NotificationSubscription", async () => {
    const schema = await importSchema(
      "response/NotificationSubscription",
      "response.POST",
    );

    const validResponse = {
      userId: "user-123456",
      subscriptions: [
        {
          id: "sub-123",
          channel: "email",
          target: "user@example.com",
          events: ["order_created", "payment_failed"],
          status: "active",
          preferences: {
            frequency: "instant",
            quietHours: { start: "22:00", end: "08:00" },
          },
          createdAt: "2024-01-15T10:00:00Z", // String
          lastNotified: new Date("2024-01-15T10:30:00Z"), // Date instance
        },
      ],
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["userId", "invalid@user!id"],
        [
          "subscriptions",
          [
            {
              id: "invalid@sub!id",
              channel: "email",
              target: "test",
              events: [],
              status: "active",
              createdAt: "2024-01-15T10:00:00Z",
              lastNotified: new Date(),
            },
          ],
        ],
        [
          "subscriptions",
          [
            {
              id: "sub-123",
              channel: "email",
              target: "",
              events: [],
              status: "active",
              createdAt: "2024-01-15T10:00:00Z",
              lastNotified: new Date(),
            },
          ],
        ],
        [
          "subscriptions",
          [
            {
              id: "sub-123",
              channel: "email",
              target: "user@example.com",
              events: [],
              status: "active",
              createdAt: "2024-01-15T10:00:00Z",
              lastNotified: "not-a-date",
            },
          ],
        ], // Should be Date, not string
        [
          "subscriptions",
          [
            {
              id: "sub-123",
              channel: "email",
              target: "user@example.com",
              events: [],
              status: "active",
              createdAt: new Date(),
              lastNotified: new Date(),
            },
          ],
        ], // Should be string, not Date
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("MfaSetup", async () => {
    const schema = await importSchema("response/MfaSetup", "response.POST");

    const validResponse = {
      userId: "user-123456",
      method: "sms",
      status: "active",
      setupData: {
        qrCode:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        secret: "JBSWY3DPEHPK3PXP123456789",
        phoneNumber: "+1234567890",
      },
      backupCodes: ["code1", "code2", "code3"],
      deviceInfo: {
        name: "iPhone 13",
        type: "mobile",
        os: "iOS 15",
        browser: "Safari",
      },
      createdAt: new Date("2024-01-15T10:00:00Z"), // Date instance
      verifiedAt: "2024-01-15T10:30:00Z", // String
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["userId", "invalid@user!id"],
        ["setupData", { secret: "short" }],
        ["setupData", { phoneNumber: "1234" }],
        ["setupData", { email: "invalid-email" }],
        ["backupCodes", []], // Empty array
        ["deviceInfo", { name: "", type: "mobile", os: "iOS 15" }],
        ["deviceInfo", { name: "a".repeat(51), type: "mobile", os: "iOS 15" }],
        ["createdAt", "invalid-date"], // Should be Date, not string
        ["verifiedAt", new Date()], // Should be string, not Date
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });

  describe("UserRegistration", async () => {
    const schema = await importSchema(
      "response/UserRegistration",
      "response.POST",
    );

    const validResponse = {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15", // String
      emailVerified: false,
      createdAt: new Date("2024-01-15T10:30:00Z"), // Date instance
      updatedAt: new Date("2024-01-15T10:30:00Z"), // Date instance
    };

    test("valid response", () => {
      expect(schema?.check(validResponse)).toEqual(true);
    });

    test("invalid response properties", () => {
      for (const [name, value] of [
        ["id", "not-a-uuid"],
        ["email", "invalid-email"],
        ["dateOfBirth", "not-a-date"],
        ["emailVerified", "yes"],
        ["createdAt", "invalid-datetime"], // Should be Date, not string
        ["updatedAt", 123], // Should be Date, not number
      ] as const) {
        expect(
          schema?.check({ ...validResponse, [name]: value }),
          `invalid ${name}: ${JSON.stringify(value)}`,
        ).toEqual(false);
      }
    });
  });
});
