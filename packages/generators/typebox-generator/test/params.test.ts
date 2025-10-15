import { describe, expect, test } from "vitest";

import { generatePathCombinations, importSchema } from ".";

describe("params", () => {
  describe("string param", async () => {
    const schema = await importSchema("params/[string]", "params");

    test("accepts any string, even empty", () => {
      expect(schema?.check({ string: "test" })).toEqual(true);
      /*
       * An empty string is still a string.
       * This is mostly a synthetic test;
       * in practice, this situation is unlikely because the API would return
       * a 404 error before reaching any validation middleware
       * if a required parameter is missing.
       * */
      expect(schema?.check({ string: "" })).toBeTruthy();
    });

    test("fail on non-string values", () => {
      expect(schema?.check({ string: 1 })).toEqual(false);
      expect(schema?.check({ string: true })).toEqual(false);
      expect(schema?.check({ string: [] })).toEqual(false);
      expect(schema?.check({ string: {} })).toEqual(false);
    });

    test("fail if no param provided", () => {
      expect(schema?.check({})).toEqual(false);
    });
  });

  describe("string param with refinements", async () => {
    const schema = await importSchema(
      "params/[stringWithRefinements]",
      "params",
    );

    test("accepts a string within range", () => {
      expect(schema?.check({ stringWithRefinements: "test" })).toEqual(true);
    });

    test("fail if less than minLength", () => {
      expect(schema?.check({ stringWithRefinements: "" })).toEqual(false);
    });

    test("fail if more than maxLength", () => {
      expect(schema?.check({ stringWithRefinements: "testtest" })).toEqual(
        false,
      );
    });

    test("fail if no param provided", () => {
      expect(schema?.check({})).toEqual(false);
    });
  });

  describe("number param", async () => {
    const schema = await importSchema("params/[number]", "params");

    test("accepts any number", () => {
      expect(schema?.check({ number: 4356345 })).toEqual(true);
      expect(schema?.check({ number: -356345 })).toEqual(true);
      expect(schema?.check({ number: 0 })).toEqual(true);
    });

    test("fail on non-number values", () => {
      expect(schema?.check({ number: "" })).toEqual(false);
      expect(schema?.check({ number: true })).toEqual(false);
      expect(schema?.check({ number: [] })).toEqual(false);
      expect(schema?.check({ number: {} })).toEqual(false);
    });

    test("fail if no param provided", () => {
      expect(schema?.check({})).toEqual(false);
    });
  });

  describe("number param with refinements", async () => {
    const schema = await importSchema(
      "params/[numberWithRefinements]",
      "params",
    );

    test("accepts a number within range", () => {
      expect(schema?.check({ numberWithRefinements: 0 })).toEqual(true);
      expect(schema?.check({ numberWithRefinements: 1 })).toEqual(true);
      expect(schema?.check({ numberWithRefinements: 5 })).toEqual(true);
    });

    test("fail if lt minimum", () => {
      expect(schema?.check({ numberWithRefinements: -1 })).toEqual(false);
    });

    test("fail if gt maximum", () => {
      expect(schema?.check({ numberWithRefinements: 100 })).toEqual(false);
    });

    test("fail if no param provided", () => {
      expect(schema?.check({})).toEqual(false);
    });
  });

  describe("intersection param", async () => {
    const schema = await importSchema("params/[intersection]", "params");

    test("accepts a valid value", () => {
      expect(schema?.check({ intersection: "R" })).toEqual(true);
      expect(schema?.check({ intersection: "G" })).toEqual(true);
      expect(schema?.check({ intersection: "B" })).toEqual(true);
    });

    test("fail on invalid value", () => {
      expect(schema?.check({ intersection: "" })).toEqual(false);
      expect(schema?.check({ intersection: 1 })).toEqual(false);
      expect(schema?.check({ intersection: true })).toEqual(false);
      expect(schema?.check({ intersection: [] })).toEqual(false);
      expect(schema?.check({ intersection: {} })).toEqual(false);
    });

    test("pass if no param provided", () => {
      expect(schema?.check({})).toEqual(false);
    });
  });

  describe("optional intersection param", async () => {
    const schema = await importSchema(
      "params/[[optionalIntersection]]",
      "params",
    );

    test("accepts a valid value", () => {
      expect(schema?.check({ optionalIntersection: "R" })).toEqual(true);
      expect(schema?.check({ optionalIntersection: "G" })).toEqual(true);
      expect(schema?.check({ optionalIntersection: "B" })).toEqual(true);
    });

    test("fail on invalid value", () => {
      expect(schema?.check({ optionalIntersection: "" })).toEqual(false);
      expect(schema?.check({ optionalIntersection: 1 })).toEqual(false);
      expect(schema?.check({ optionalIntersection: true })).toEqual(false);
      expect(schema?.check({ optionalIntersection: [] })).toEqual(false);
      expect(schema?.check({ optionalIntersection: {} })).toEqual(false);
    });

    test("pass if no param provided", () => {
      expect(schema?.check({})).toEqual(true);
    });
  });

  describe("optional param", async () => {
    const schema = await importSchema("params/[[optional]]", "params");

    test("accepts any string, even empty", () => {
      expect(schema?.check({ optional: "test" })).toEqual(true);
      expect(schema?.check({ optional: "" })).toBeTruthy();
    });

    test("pass if no param provided", () => {
      expect(schema?.check({})).toEqual(true);
    });

    test("fail on non-string values", () => {
      expect(schema?.check({ optional: 1 })).toEqual(false);
      expect(schema?.check({ optional: true })).toEqual(false);
      expect(schema?.check({ optional: [] })).toEqual(false);
      expect(schema?.check({ optional: {} })).toEqual(false);
    });
  });

  describe("optional param with refinements", async () => {
    const schema = await importSchema(
      "params/[[optionalWithRefinements]]",
      "params",
    );

    test("accepts a string within range", () => {
      expect(schema?.check({ optionalWithRefinements: "test" })).toEqual(true);
    });

    test("fail if param given but is less than minLength", () => {
      expect(schema?.check({ optionalWithRefinements: "" })).toEqual(false);
    });

    test("fail if param given but is more than maxLength", () => {
      expect(schema?.check({ optionalWithRefinements: "testtest" })).toEqual(
        false,
      );
    });

    test("pass if no param provided", () => {
      expect(schema?.check({})).toEqual(true);
    });
  });

  describe("rest params", async () => {
    const schema = await importSchema("params/[...path]", "params");

    test("pass without tokens", () => {
      expect(schema?.check({ path: [] })).toBe(true);
    });

    test("pass with valid tokens", () => {
      for (const path of generatePathCombinations(["a", "b", "c"])) {
        expect(schema?.check({ path })).toBe(true);
      }
    });

    test("fails with invalid tokens", () => {
      for (const path of [
        ["a", "x"],
        ["y"],
        ["x", "y", "b"],
        ["abc", "xyz"],
        [""],
      ]) {
        expect(schema?.check({ path })).toBe(false);
      }
    });
  });
});
