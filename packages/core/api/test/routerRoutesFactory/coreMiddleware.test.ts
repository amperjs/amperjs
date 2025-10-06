import { describe, expect, test } from "vitest";

import { defineRoute } from "@/router";
import { use } from "@/use";

import { defaultMethods, middlewareStackBuilder } from "../lib";

describe("routerRoutesFactory", () => {
  describe("core middleware", () => {
    test("without prioritized slot, goes after prioritized middleware", () => {
      async function coreMiddleware() {}

      const stack = middlewareStackBuilder([{}], {
        coreMiddleware: [use(coreMiddleware, { on: ["GET"] })],
      });

      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].methods).toEqual(["GET"]);
      expect(stack[4].middleware[0]).toEqual(coreMiddleware);

      expect(stack.length).toEqual(5);
    });

    test("core middleware with a prioritized slot overrides builtin prioritized middleware", () => {
      async function paramsHandler() {}
      async function validateParams() {}
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder([{}], {
        coreMiddleware: [
          use(validatePayload, { slot: "validatePayload" }),
          use(payloadHandler, { slot: "payload" }),
          use(validateParams, { slot: "validateParams" }),
          use(validateResponse, { slot: "validateResponse" }),
          use(paramsHandler, { slot: "params" }),
        ],
      });

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

    test("when overriding prioritized slots, last middleware takes precedence", () => {
      async function paramsHandler() {}
      async function validateParams() {}
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder([{}], {
        coreMiddleware: [
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
        ],
      });

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

    test("core middleware overriden by route middleware with a prioritized slot", () => {
      async function paramsHandler() {}
      async function validateParams() {}
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use }) => [
              use(validatePayload, { slot: "validatePayload" }),
              use(payloadHandler, { slot: "payload" }),
              use(validateParams, { slot: "validateParams" }),
              use(validateResponse, { slot: "validateResponse" }),
              use(paramsHandler, { slot: "params" }),
            ]),
          },
        ],
        {
          coreMiddleware: [
            use(async () => {}, { slot: "validatePayload" }),
            use(async () => {}, { slot: "payload" }),
            use(async () => {}, { slot: "validateParams" }),
            use(async () => {}, { slot: "validateResponse" }),
            use(async () => {}, { slot: "params" }),
          ],
        },
      );

      expect(stack[0].kind).toEqual("middleware");
      expect(stack[0].methods).toEqual(defaultMethods);
      expect(stack[0].middleware[0]).toEqual(paramsHandler);
      expect(stack.filter((e) => e.slot === "params").length).toEqual(1);

      expect(stack[1].kind).toEqual("middleware");
      expect(stack[1].methods).toEqual(defaultMethods);
      expect(stack[1].middleware[0]).toEqual(validateParams);
      expect(stack.filter((e) => e.slot === "validateParams").length).toEqual(
        1,
      );

      expect(stack[2].kind).toEqual("middleware");
      expect(stack[2].methods).toEqual(defaultMethods);
      expect(stack[2].middleware[0]).toEqual(payloadHandler);
      expect(stack.filter((e) => e.slot === "payload").length).toEqual(1);

      expect(stack[3].kind).toEqual("middleware");
      expect(stack[3].methods).toEqual(defaultMethods);
      expect(stack[3].middleware[0]).toEqual(validatePayload);
      expect(stack.filter((e) => e.slot === "validatePayload").length).toEqual(
        1,
      );
      expect(stack[4].kind).toEqual("middleware");
      expect(stack[4].methods).toEqual(defaultMethods);
      expect(stack[4].middleware[0]).toEqual(validateResponse);
      expect(stack.filter((e) => e.slot === "validateResponse").length).toEqual(
        1,
      );

      expect(stack.length).toEqual(5);
    });
  });
});
