import { describe, expect, test } from "vitest";

import { MESSAGE_CODES } from "@/error-handler";

import { importSchema } from "..";

describe("errors/string", async () => {
  const schema = await importSchema("errors/string", "payload.POST");

  const validPayload = {
    minLength: "hello",
    maxLength: "short",
    minMaxLength: "medium",
    alphanumeric: "abc123",
    hexColor: "#FF5733",
    email: "user@example.com",
    date: "2024-01-15",
    dateTime: "2024-01-15T10:30:00Z",
    time: "10:30:00Z",
    uri: "https://example.com/path",
    url: "https://example.com",
    uuid: "123e4567-e89b-12d3-a456-426614174000",
    ipv4: "192.168.1.1",
    ipv6: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    hostname: "example.com",
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("invalid payload properties", () => {
    for (const [name, value, errorCode, errorParams] of [
      // minLength
      ["minLength", "hi", MESSAGE_CODES.STRING_MIN_LENGTH, { limit: 5 }],
      ["minLength", "", MESSAGE_CODES.STRING_MIN_LENGTH, { limit: 5 }],

      // maxLength
      [
        "maxLength",
        "this is too long",
        MESSAGE_CODES.STRING_MAX_LENGTH,
        { limit: 10 },
      ],

      // minMaxLength
      ["minMaxLength", "hi", MESSAGE_CODES.STRING_MIN_LENGTH, { limit: 3 }],
      [
        "minMaxLength",
        "this string is way too long",
        MESSAGE_CODES.STRING_MAX_LENGTH,
        { limit: 20 },
      ],

      // pattern
      [
        "alphanumeric",
        "abc-123",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^[a-zA-Z0-9]+$" },
      ],
      [
        "alphanumeric",
        "abc 123",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^[a-zA-Z0-9]+$" },
      ],
      [
        "hexColor",
        "FF5733",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" },
      ],
      [
        "hexColor",
        "#GG5733",
        MESSAGE_CODES.STRING_PATTERN,
        { pattern: "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" },
      ],

      // format: email
      [
        "email",
        "invalid-email",
        MESSAGE_CODES.STRING_FORMAT_EMAIL,
        { format: "email" },
      ],
      [
        "email",
        "user@",
        MESSAGE_CODES.STRING_FORMAT_EMAIL,
        { format: "email" },
      ],
      [
        "email",
        "@example.com",
        MESSAGE_CODES.STRING_FORMAT_EMAIL,
        { format: "email" },
      ],

      // format: date
      [
        "date",
        "2024-13-01",
        MESSAGE_CODES.STRING_FORMAT_DATE,
        { format: "date" },
      ],
      [
        "date",
        "not-a-date",
        MESSAGE_CODES.STRING_FORMAT_DATE,
        { format: "date" },
      ],

      // format: date-time
      [
        "dateTime",
        "2024-01-15",
        MESSAGE_CODES.STRING_FORMAT_DATETIME,
        { format: "date-time" },
      ],
      [
        "dateTime",
        "invalid",
        MESSAGE_CODES.STRING_FORMAT_DATETIME,
        { format: "date-time" },
      ],

      // format: time
      [
        "time",
        "25:00:00",
        MESSAGE_CODES.STRING_FORMAT_TIME,
        { format: "time" },
      ],
      ["time", "10:30", MESSAGE_CODES.STRING_FORMAT_TIME, { format: "time" }],

      // format: uri
      ["uri", "not a uri", MESSAGE_CODES.STRING_FORMAT_URI, { format: "uri" }],

      // format: url
      ["url", "not-a-url", MESSAGE_CODES.STRING_FORMAT_URL, { format: "url" }],
      [
        "url",
        "ftp//example.com",
        MESSAGE_CODES.STRING_FORMAT_URL,
        { format: "url" },
      ],

      // format: uuid
      [
        "uuid",
        "not-a-uuid",
        MESSAGE_CODES.STRING_FORMAT_UUID,
        { format: "uuid" },
      ],
      [
        "uuid",
        "123e4567-e89b-12d3-a456",
        MESSAGE_CODES.STRING_FORMAT_UUID,
        { format: "uuid" },
      ],

      // format: ipv4
      [
        "ipv4",
        "999.999.999.999",
        MESSAGE_CODES.STRING_FORMAT_IPV4,
        { format: "ipv4" },
      ],
      [
        "ipv4",
        "192.168.1",
        MESSAGE_CODES.STRING_FORMAT_IPV4,
        { format: "ipv4" },
      ],

      // format: ipv6
      [
        "ipv6",
        "not-an-ipv6",
        MESSAGE_CODES.STRING_FORMAT_IPV6,
        { format: "ipv6" },
      ],
      [
        "ipv6",
        "2001:0db8:85a3",
        MESSAGE_CODES.STRING_FORMAT_IPV6,
        { format: "ipv6" },
      ],

      // format: hostname
      [
        "hostname",
        "invalid_hostname",
        MESSAGE_CODES.STRING_FORMAT_HOSTNAME,
        { format: "hostname" },
      ],
      [
        "hostname",
        "-example.com",
        MESSAGE_CODES.STRING_FORMAT_HOSTNAME,
        { format: "hostname" },
      ],
    ] as const) {
      const data = { ...validPayload, [name]: value };
      const [error] = schema?.errors(data) || [];

      expect(
        schema?.check(data),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);

      expect(error?.code, `invalid ${name}: ${JSON.stringify(value)}`).toEqual(
        errorCode,
      );

      expect(
        error?.params,
        `invalid ${name}: ${JSON.stringify(value)} - ${JSON.stringify(error, null, 2)}`,
      ).toMatchObject(errorParams);
    }
  });
});
