import { describe, expect, test } from "vitest";

import { importSchema } from "..";

describe("string/format", () => {
  describe("date-time", async () => {
    const schema = await importSchema(
      "string/format/date-time",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "2024-01-15T10:30:00Z",
        "2024-01-15T10:30:00+02:00",
        "2024-01-15T10:30:00.123Z",
        "2024-01-15T10:30:00-05:00",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "2024-01-15",
        "10:30:00",
        "not-a-date",
        "2024-13-45T10:30:00Z",
        "2024-01-15T25:30:00Z",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("time", async () => {
    const schema = await importSchema("string/format/time", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "10:30:00Z", // basic time with UTC
        "23:59:59Z", // max time with UTC
        "00:00:00Z", // min time with UTC
        "10:30:00+00:00", // with zero offset
        "10:30:00+02:00", // with positive offset
        "10:30:00-05:00", // with negative offset
        "10:30:00.123Z", // with milliseconds and UTC
        "10:30:00.123456Z", // with microseconds and UTC
        "10:30:00.123+02:00", // with milliseconds and offset
        "10:30:00.123456-05:00", // with microseconds and offset
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "14:30:00", // no timezone
        "23:59:59", // no timezone
        "00:00:00", // no timezone
        "10:30:00.123", // fractional seconds but no timezone
        "10:30:00.123456", // fractional seconds but no timezone
        "25:30:00Z", // invalid hour
        "10:60:00Z", // invalid minute
        "10:30:60Z", // invalid second
        "10:30:00.123.456Z", // double decimal
        "10:30:00+25:00", // invalid timezone offset
        "10:30:00+2:00", // single digit timezone
        "10:30:00+0200", // missing colon in offset
        "10:30:00+02", // incomplete timezone
        "not-a-time", // completely invalid
        "10:30:00 ", // trailing space
        " 10:30:00Z", // leading space
        "10:30:00+", // incomplete timezone
        "10:30:00.Z", // decimal without digits
        "10:30:00+02:00:00", // too many timezone components
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("date", async () => {
    const schema = await importSchema("string/format/date", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "2024-01-15",
        "1990-12-31",
        "2020-02-29",
        "2024-12-01",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "2024/01/15",
        "15-01-2024",
        "2024-13-45",
        "01-15-2024",
        "not-a-date",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("email", async () => {
    const schema = await importSchema("string/format/email", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "test@example.com",
        "user.name+tag@domain.co.uk",
        "a@b.cd",
        "user@sub.domain.com",
        "first.last@example.org",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "invalid",
        "test@",
        "@domain.com",
        "test@.com",
        "user@.domain.com",
        "user@domain.",
        "user@domain..com",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("idn-email", async () => {
    const schema = await importSchema(
      "string/format/idn-email",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "test@例子.测试", // Chinese domain
        "user@müller.example.com", // German umlaut in subdomain
        "test@스타벅스.코리아", // Korean domain
        "user@παράδειγμα.δοκιμή", // Greek domain
        "test@россия.рф", // Cyrillic domain
        "user@東京.jp", // Japanese domain
        "test@fußball.example.com", // German eszett in subdomain
        "user@café.fr", // French accent
        "test@bücher.example.com", // German umlaut
        "user@example.com", // Regular ASCII email (should also work)
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "invalid",
        "test@",
        "@例子.测试",
        "user@.例子.测试",
        "test@例子.", // incomplete domain
        "user@..例子.测试", // double dot
        "test@例子.测试.", // trailing dot
        "user@-例子.测试", // leading hyphen in label
        "test@例子.-测试", // leading hyphen
        "user@例子.测试 ", // trailing space
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("hostname", async () => {
    const schema = await importSchema("string/format/hostname", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "example.com",
        "sub.domain.co.uk",
        "localhost",
        "a.b.c",
        "test-hostname.example.org",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "-invalid.com",
        "test_.com",
        "..domain.com",
        "example..com",
        "test .com",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("idn-hostname", async () => {
    const schema = await importSchema(
      "string/format/idn-hostname",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "例子.测试", // Chinese
        "müller.example.com", // German umlaut
        "스타벅스.코리아", // Korean
        "παράδειγμα.δοκιμή", // Greek
        "россия.рф", // Cyrillic
        "東京.jp", // Japanese
        "fußball.example.com", // German eszett
        "café.fr", // French accent
        "bücher.example.com", // German umlaut
        "example.com", // Regular ASCII (should also work)
        "sub.例子.测试", // Mixed subdomain
        "a.b.c.例子.测试", // Multiple subdomains
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "-例子.测试", // leading hyphen
        "例子.-测试", // leading hyphen in label
        "例子..测试", // double dot
        "例子.测试.", // trailing dot
        ".例子.测试", // leading dot
        "例子 .测试", // space in hostname
        `例子.${"a".repeat(64)}.测试`, // label too long
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("ipv4", async () => {
    const schema = await importSchema("string/format/ipv4", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "192.168.1.1",
        "8.8.8.8",
        "255.255.255.255",
        "0.0.0.0",
        "127.0.0.1",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "256.256.256.256",
        "192.168.1",
        "192.168.1.1.1",
        "not-an-ip",
        "192.168.1.256",
        "192.168.1.-1",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("ipv6", async () => {
    const schema = await importSchema("string/format/ipv6", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "::1",
        "2001:db8::1",
        "::",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "2001:db8:xyz::1",
        ":::",
        "192.168.1.1",
        "2001:db8:::1",
        "gggg::1",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("url", async () => {
    const schema = await importSchema("string/format/url", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "https://example.com",
        "ftp://files.example.com/path",
        "https://example.com/path?query=value#fragment",
        "http://user:pass@example.com:8080",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "not-a-url",
        "example.com",
        "http://",
        "https://example.com/ path",
        "http://example .com",
        "://example.com",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("uuid", async () => {
    const schema = await importSchema("string/format/uuid", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "a8098c1a-f86e-11da-bd1a-00112444be1e",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "not-a-uuid",
        "f47ac10b-58cc-4372-a567-0e02b2c3d47",
        "f47ac10b58cc4372a5670e02b2c3d479",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479-extra",
        "gggggggg-gggg-gggg-gggg-gggggggggggg",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });
});
