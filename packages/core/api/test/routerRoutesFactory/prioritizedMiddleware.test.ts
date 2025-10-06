import { describe, expect, test } from "vitest";

import { defineRoute } from "@/router";
import { use } from "@/use";

import { defaultMethods, middlewareStackBuilder } from "../lib";

describe("routerRoutesFactory", () => {
  describe("prioritized middleware", () => {
    test("inserted in a strictly predefined order", () => {
      const stack = middlewareStackBuilder([{}], {});

      expect(stack[0].kind).toEqual("middleware");
      expect(stack[0].slot).toEqual("params");
      expect(stack[0].middleware.length).toEqual(1);

      expect(stack[1].kind).toEqual("middleware");
      expect(stack[1].slot).toEqual("validateParams");
      expect(stack[1].middleware.length).toEqual(1);

      expect(stack[2].kind).toEqual("middleware");
      expect(stack[2].slot).toEqual("validatePayload");
      expect(stack[2].middleware.length).toEqual(1);

      expect(stack[3].kind).toEqual("middleware");
      expect(stack[3].slot).toEqual("validateResponse");
      expect(stack[3].middleware.length).toEqual(1);

      expect(stack.length).toEqual(4);
    });

    test("default params middleware applied to all request methods", () => {
      const stack = middlewareStackBuilder([{}], {});

      expect(stack[0].methods).toEqual(defaultMethods);
      expect(stack[1].methods).toEqual(defaultMethods);
    });

    test("params middleware set by core middleware respects given request methods", () => {
      async function paramsHandler() {}
      async function validateParams() {}

      const stack = middlewareStackBuilder([{}], {
        coreMiddleware: [
          use(paramsHandler, { slot: "params", on: ["GET"] }),
          use(validateParams, { slot: "validateParams", on: ["POST"] }),
        ],
      });

      expect(stack[0].methods).toEqual(["GET"]);
      expect(stack[0].middleware[0]).toEqual(paramsHandler);

      expect(stack[1].methods).toEqual(["POST"]);
      expect(stack[1].middleware[0]).toEqual(validateParams);
    });

    test("params middleware set by route middleware respects given request methods", () => {
      async function paramsHandler() {}
      async function validateParams() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use }) => [
              use(paramsHandler, { slot: "params", on: ["GET"] }),
              use(validateParams, { slot: "validateParams", on: ["POST"] }),
            ]),
          },
        ],
        {},
      );

      expect(stack[0].methods).toEqual(["GET"]);
      expect(stack[0].middleware[0]).toEqual(paramsHandler);

      expect(stack[1].methods).toEqual(["POST"]);
      expect(stack[1].middleware[0]).toEqual(validateParams);
    });

    test("default payload/response middleware inserted as noop (won't run on any request method)", () => {
      const stack = middlewareStackBuilder([{}], {});

      expect(stack[2].methods).toEqual([]);
      expect(stack[3].methods).toEqual([]);
    });

    test("payload/response middleware set by core middleware respects given request methods", () => {
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder([{}], {
        coreMiddleware: [
          use(payloadHandler, { slot: "payload", on: ["GET"] }),
          use(validatePayload, { slot: "validatePayload", on: ["POST"] }),
          use(validateResponse, { slot: "validateResponse", on: ["PUT"] }),
        ],
      });

      expect(stack[2].methods).toEqual(["GET"]);
      expect(stack[2].middleware[0]).toEqual(payloadHandler);

      expect(stack[3].methods).toEqual(["POST"]);
      expect(stack[3].middleware[0]).toEqual(validatePayload);

      expect(stack[4].methods).toEqual(["PUT"]);
      expect(stack[4].middleware[0]).toEqual(validateResponse);
    });

    test("payload/response middleware set by route middleware respects given request methods", () => {
      async function payloadHandler() {}
      async function validatePayload() {}
      async function validateResponse() {}

      const stack = middlewareStackBuilder(
        [
          {
            definitionItems: defineRoute(({ use }) => [
              use(payloadHandler, { slot: "payload", on: ["GET"] }),
              use(validatePayload, { slot: "validatePayload", on: ["POST"] }),
              use(validateResponse, { slot: "validateResponse", on: ["PUT"] }),
            ]),
          },
        ],
        {},
      );

      expect(stack[2].methods).toEqual(["GET"]);
      expect(stack[2].middleware[0]).toEqual(payloadHandler);

      expect(stack[3].methods).toEqual(["POST"]);
      expect(stack[3].middleware[0]).toEqual(validatePayload);

      expect(stack[4].methods).toEqual(["PUT"]);
      expect(stack[4].middleware[0]).toEqual(validateResponse);
    });

    test("prioritized middleware overriden by route middleware with a prioritized slot", () => {
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
        {},
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
