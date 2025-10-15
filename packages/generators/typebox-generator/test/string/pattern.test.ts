import { describe, expect, test } from "vitest";

import { importSchema } from "..";

describe("string/pattern", () => {
  describe("hex-color", async () => {
    const schema = await importSchema(
      "string/pattern/hex-color",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "#ff0000",
        "#00FF00",
        "#000",
        "#fff",
        "#abc123",
        "#ABCDEF",
        "#123456",
        "#f0f",
        "#0f0",
        "#00f",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "ff0000",
        "#ff",
        "#ffff",
        "#gggggg",
        "#12345",
        "#1234567",
        "red",
        "#ff00000",
        "# 123456",
        "#ff-0000",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("mime-type", async () => {
    const schema = await importSchema(
      "string/pattern/mime-type",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "image/jpeg",
        "application/json",
        "application/json+xml",
        "text/plain",
        "video/mp4",
        "application/pdf",
        "multipart/form-data",
        "text/html",
        "application/xml",
        "image/png",
        "audio/mpeg",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "image/",
        "/jpeg",
        "image jpeg",
        "IMAGE/JPEG",
        "application/json;",
        "text/plain ",
        "application/",
        "invalid",
        "text/html;charset=utf-8",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("credit-card", async () => {
    const schema = await importSchema(
      "string/pattern/credit-card",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "4111111111111111",
        "5500000000000004",
        "340000000000009",
        "6011000000000004",
        "378282246310005",
        "1234567812345678",
        "1111222233334444",
        "9999888877776666",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "4111-1111-1111-1111",
        "411111111111",
        "41111111111111111111",
        "abcdabcdabcdabcd",
        "1234",
        "abc",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("phone-number", async () => {
    const schema = await importSchema(
      "string/pattern/phone-number",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "+1234567890",
        "1234567890",
        "+441234567890",
        "+33123456789",
        "123456789012345",
        "+123456789012345",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "1234",
        "+123",
        "+1234567890123456",
        "abc1234567",
        "+123-456-7890",
        " 1234567890",
        "1234567890 ",
        "+0123456789",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("password", async () => {
    const schema = await importSchema(
      "string/pattern/password",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "password123",
        "hello1234",
        "TEST2024",
        "abc123def",
        "12345678a",
        "a1b2c3d4",
        "simplepass1",
        "winter2024",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "short1",
        "password",
        "12345678",
        "abc",
        "onlyletters",
        "123456",
        "!@#$%^&*",
        "pass word123",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("slug", async () => {
    const schema = await importSchema("string/pattern/slug", "payload.POST");

    test("valid payload", () => {
      for (const value of [
        "hello-world",
        "test-slug-123",
        "a-b-c",
        "123-456",
        "word",
        "multiple-words-here",
        "slug-2024",
        "test",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "Hello-World",
        "test_slug",
        "test--slug",
        "-starts-with-dash",
        "ends-with-dash-",
        "test slug",
        "test.slug",
        "UPPERCASE",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("username", async () => {
    const schema = await importSchema(
      "string/pattern/username",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "john_doe",
        "user123",
        "test-user",
        "admin",
        "jane_2024",
        "a_b_c",
        "username123",
        "test",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "ab",
        "username_with_more_than_twenty_chars",
        "user@name",
        "user name",
        "user.name",
        "",
        "user!name",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("semantic-version", async () => {
    const schema = await importSchema(
      "string/pattern/semantic-version",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "1.0.0",
        "2.1.5",
        "0.1.0",
        "10.20.30",
        "1.0.0-alpha",
        "1.0.0-beta.1",
        "1.0.0+20240115",
        "1.0.0-alpha+001",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "1.0",
        "1",
        "1.0.0.0",
        "01.0.0",
        "1.00.0",
        "1.0.0-",
        "1.0.0+",
        "version1.0.0",
        "1.a.0",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("currency-code", async () => {
    const schema = await importSchema(
      "string/pattern/currency-code",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "CNY",
        "INR",
        "BRL",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "usd",
        "US",
        "USDD",
        "123",
        "U S D",
        "USD ",
        " USD",
        "U$D",
        "",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });

  describe("country-code", async () => {
    const schema = await importSchema(
      "string/pattern/country-code",
      "payload.POST",
    );

    test("valid payload", () => {
      for (const value of [
        "US",
        "GB",
        "FR",
        "DE",
        "JP",
        "CA",
        "AU",
        "BR",
        "IN",
        "CN",
      ] as const) {
        expect(schema?.check({ value })).toEqual(true);
      }
    });

    test("invalid payload", () => {
      for (const value of [
        "usa",
        "USA",
        "U",
        "US ",
        " US",
        "U S",
        "12",
        "U1",
        "",
      ] as const) {
        expect(schema?.check({ value })).toEqual(false);
      }
    });
  });
});
