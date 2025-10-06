import { describe, expect, test } from "vitest";

import { defineRoute } from "@/router";

import { defaultMethods, middlewareStackBuilder } from "../lib";

describe("routerRoutesFactory", () => {
  describe("route middleware", () => {
    test("route middleware inserted after prioritized and core middleware", () => {
      async function preMiddleware() {}
      async function postMiddleware() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use, GET, POST }) => [
              use(preMiddleware),
              GET(() => {}),
              POST(() => {}),
              use(postMiddleware),
            ]),
          },
        ],
        {},
      );

      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].methods).toEqual(defaultMethods);
      expect(stack[4].middleware[0]).toEqual(preMiddleware);

      expect(stack[5].kind).toEqual("handler");
      expect(stack[5].methods).toEqual(["GET"]);
      expect(stack[5].middleware.length).toEqual(1);

      expect(stack[6].kind).toEqual("handler");
      expect(stack[6].methods).toEqual(["POST"]);
      expect(stack[6].middleware.length).toEqual(1);

      expect(stack[7].kind).toEqual("middleware");
      expect(stack[7].methods).toEqual(defaultMethods);
      expect(stack[7].middleware[0]).toEqual(postMiddleware);

      expect(stack.length).toEqual(8);
    });

    test("when overriding prioritized slots, last middleware takes precedence", () => {
      async function paramsHandler() {}
      async function validateParams() {}
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use }) => [
              use(async () => {}, { slot: "validatePayload" }),
              use(validatePayload, { slot: "validatePayload" }),

              use(async () => {}, { slot: "payload" }),
              use(payloadHandler, { slot: "payload" }),

              use(async () => {}, { slot: "validateParams" }),
              use(validateParams, { slot: "validateParams" }),

              use(async () => {}, { slot: "validateResponse" }),
              use(validateResponse, { slot: "validateResponse" }),

              use(async () => {}, { slot: "params" }),
              use(paramsHandler, { slot: "params" }),
            ]),
          },
        ],
        {},
      );

      expect(stack[0].kind).toEqual("middleware");
      expect(stack[0].middleware[0]).toEqual(paramsHandler);
      expect(stack.filter((e) => e.slot === "params").length).toEqual(1);

      expect(stack[1].kind).toEqual("middleware");
      expect(stack[1].middleware[0]).toEqual(validateParams);
      expect(stack.filter((e) => e.slot === "validateParams").length).toEqual(
        1,
      );

      expect(stack[2].kind).toEqual("middleware");
      expect(stack[2].middleware[0]).toEqual(payloadHandler);
      expect(stack.filter((e) => e.slot === "payload").length).toEqual(1);

      expect(stack[3].kind).toEqual("middleware");
      expect(stack[3].middleware[0]).toEqual(validatePayload);
      expect(stack.filter((e) => e.slot === "validatePayload").length).toEqual(
        1,
      );

      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].middleware[0]).toEqual(validateResponse);
      expect(stack.filter((e) => e.slot === "validateResponse").length).toEqual(
        1,
      );

      expect(stack.length).toEqual(5);
    });
  });
});
