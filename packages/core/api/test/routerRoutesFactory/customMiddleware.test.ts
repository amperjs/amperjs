import { describe, expect, test } from "vitest";

import { defineRoute } from "@/router";
import { use } from "@/use";

import { middlewareStackBuilder } from "../lib";

describe("routerRoutesFactory", () => {
  describe("custom middleware", () => {
    test("override core middleware using slots", () => {
      async function authMiddleware() {}
      async function bodyMiddleware() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use, GET, POST }) => [
              use(authMiddleware, { slot: "auth" }),
              GET(() => {}),
              POST(() => {}),
              use(bodyMiddleware, { slot: "body" }),
            ]),
          },
        ],
        {
          coreMiddleware: [
            use(async () => {}, { slot: "auth" }),
            use(async () => {}, { slot: "body" }),
          ],
        },
      );

      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].middleware[0]).toEqual(authMiddleware);

      expect(stack[5].kind).toEqual("middleware");
      expect(stack[5].middleware[0]).toEqual(bodyMiddleware);

      expect(stack[6].kind).toEqual("handler");
      expect(stack[6].methods).toEqual(["GET"]);
    });

    test("when overriding core middleware, last middleware takes precedence", async () => {
      async function authMiddleware() {}
      async function bodyMiddleware() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use, GET, POST }) => [
              use(async () => {}, { slot: "auth" }),
              use(authMiddleware, { slot: "auth" }),
              GET(() => {}),
              POST(() => {}),
              use(async () => {}, { slot: "body" }),
              use(bodyMiddleware, { slot: "body" }),
            ]),
          },
        ],
        {
          coreMiddleware: [
            use(async () => {}, { slot: "auth" }),
            use(async () => {}, { slot: "body" }),
          ],
        },
      );

      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].slot).toEqual("auth");
      expect(stack.filter((e) => e.slot === "auth").length).toEqual(1);
      expect(stack[4].middleware[0]).toEqual(authMiddleware);

      expect(stack[5].kind).toEqual("middleware");
      expect(stack[5].slot).toEqual("body");
      expect(stack.filter((e) => e.slot === "body").length).toEqual(1);
      expect(stack[5].middleware[0]).toEqual(bodyMiddleware);

      expect(stack[6].kind).toEqual("handler");
      expect(stack[6].methods).toEqual(["GET"]);
    });
  });
});
