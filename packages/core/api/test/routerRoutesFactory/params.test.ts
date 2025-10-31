import { describe, expect, test } from "vitest";

import { runMiddleware } from "@kappajs/devlib/test";

import { middlewareStackBuilder } from "../lib";

describe("routerRoutesFactory", () => {
  describe("params", () => {
    test("rest params", async () => {
      const stack = middlewareStackBuilder(
        [
          {
            params: [["path", true]],
          },
        ],
        {},
      );

      const ctx = await runMiddleware(
        stack.flatMap((e) => e.middleware),
        { params: { path: "a/b/c" } },
      );

      expect(ctx.params.path).toEqual("a/b/c");
      expect(ctx.typedParams.path).toEqual(["a", "b", "c"]);
    });

    test("numeric params", async () => {
      const stack = middlewareStackBuilder(
        [
          {
            params: [
              ["id", false],
              ["name", false],
            ],
            numericParams: ["id"],
          },
        ],
        {},
      );

      const ctx = await runMiddleware(
        stack.flatMap((e) => e.middleware),
        { params: { id: "0", name: "test" } },
      );

      expect(ctx.params.id).toEqual("0");
      expect(ctx.typedParams.id).toEqual(0);

      expect(ctx.params.name).toEqual("test");
      expect(ctx.typedParams.name).toEqual("test");
    });

    test("rest numeric params", async () => {
      const stack = middlewareStackBuilder(
        [
          {
            params: [["ids", true]],
            numericParams: ["ids"],
          },
        ],
        {},
      );

      const ctx = await runMiddleware(
        stack.flatMap((e) => e.middleware),
        { params: { ids: "1/2/3" } },
      );

      expect(ctx.params.ids).toEqual("1/2/3");
      expect(ctx.typedParams.ids).toEqual([1, 2, 3]);
    });
  });
});
