import { describe, expect, test } from "vitest";

import { importSchema } from "..";

describe("string/length", async () => {
  const schema = await importSchema("string/length", "payload.POST");

  const validPayload = {
    minLength: "", // Empty string (minLength: 0 allows empty)
    maxLength: "12345", // Exactly 5 characters
    mixLength: "abc", // Between 0 and 5 characters
  };

  test("valid payload", () => {
    expect(schema?.check(validPayload)).toEqual(true);
  });

  test("valid payload variants", () => {
    // Test various valid combinations
    const validVariants = [
      {
        minLength: "", // Empty string
        maxLength: "1", // Single character
        mixLength: "", // Empty string
      },
      {
        minLength: "a", // Single character
        maxLength: "12", // Two characters
        mixLength: "a", // Single character
      },
      {
        minLength: "hello", // Multiple characters
        maxLength: "", // Empty string
        mixLength: "12345", // Exactly 5 characters
      },
      {
        minLength: "test", // 4 characters
        maxLength: "1234", // 4 characters
        mixLength: "ab", // 2 characters
      },
      {
        minLength: "x", // 1 character
        maxLength: "12345", // Exactly 5 characters (max)
        mixLength: "x", // 1 character
      },
      {
        minLength: " ", // Space character
        maxLength: "     ", // 5 spaces
        mixLength: "  ", // 2 spaces
      },
      {
        minLength: "🎉", // Single emoji (multiple code points)
        maxLength: "🎉🎉", // Two emojis
        mixLength: "🎉", // Single emoji
      },
      {
        minLength: "ñ", // Single accented character
        maxLength: "ññññ", // 4 accented characters
        mixLength: "ññ", // 2 accented characters
      },
    ];

    for (const variant of validVariants) {
      expect(schema?.check(variant)).toEqual(true);
    }
  });

  test("invalid payload properties", () => {
    for (const [name, value] of [
      // minLength violations (none since minLength: 0 allows everything)

      // maxLength violations
      ["maxLength", "123456"], // 6 characters (exceeds maxLength: 5)
      ["maxLength", "too long"], // 8 characters
      ["maxLength", "🎉🎉🎉🎉🎉🎉"], // 6 emojis
      ["maxLength", "     _"], // 6 characters with space and underscore

      // mixLength violations
      ["mixLength", "123456"], // 6 characters (exceeds maxLength: 5)
      ["mixLength", "too long"], // 8 characters
      ["mixLength", "🎉🎉🎉🎉🎉🎉"], // 6 emojis
      ["mixLength", "      "], // 6 spaces

      // Type violations
      ["minLength", 123], // Wrong type
      ["maxLength", null], // Wrong type
      ["mixLength", undefined], // Wrong type
      ["minLength", true], // Wrong type
      ["maxLength", { length: 3 }], // Wrong type
      ["mixLength", ["a", "b", "c"]], // Wrong type
    ] as const) {
      expect(
        schema?.check({ ...validPayload, [name]: value }),
        `invalid ${name}: ${JSON.stringify(value)}`,
      ).toEqual(false);
    }
  });

  test("edge cases and boundaries", () => {
    // Test exact boundaries
    const boundaryCases = [
      {
        description: "maxLength at exact boundary",
        payload: {
          minLength: "a",
          maxLength: "12345", // Exactly 5 characters ✅
          mixLength: "a",
        },
        expected: true,
      },
      {
        description: "mixLength at exact boundary",
        payload: {
          minLength: "a",
          maxLength: "1",
          mixLength: "12345", // Exactly 5 characters ✅
        },
        expected: true,
      },
      {
        description: "maxLength one character over boundary",
        payload: {
          minLength: "a",
          maxLength: "123456", // 6 characters ❌
          mixLength: "a",
        },
        expected: false,
      },
      {
        description: "mixLength one character over boundary",
        payload: {
          minLength: "a",
          maxLength: "1",
          mixLength: "123456", // 6 characters ❌
        },
        expected: false,
      },
      {
        description: "all empty strings",
        payload: {
          minLength: "", // ✅ minLength: 0 allows empty
          maxLength: "", // ✅ maxLength: 5 allows empty
          mixLength: "", // ✅ mixLength: 0-5 allows empty
        },
        expected: true,
      },
      {
        description: "unicode characters counting",
        payload: {
          minLength: "🎉", // 1 grapheme, multiple code points ✅
          maxLength: "ññññ", // 4 characters ✅
          mixLength: "café", // 4 characters ✅
        },
        expected: true,
      },
    ];

    for (const { description, payload, expected } of boundaryCases) {
      expect(schema?.check(payload), `boundary case: ${description}`).toEqual(
        expected,
      );
    }
  });
});
