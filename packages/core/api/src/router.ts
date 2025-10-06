import Router from "@koa/router";

import {
  type CreateRouter,
  type DefineRoute,
  type HandlerDefinition,
  HTTPMethods,
  type MiddlewareDefinition,
  type RouterRoute,
  type RouterRouteSource,
  type UseSlots,
  type ValidationSchemas,
} from "./types";
import { use } from "./use";

export const createRouter: CreateRouter = (options) => {
  return new Router(options);
};

export const defineRoute: DefineRoute = (factory) => {
  return factory({
    use(middleware, options) {
      return {
        kind: "middleware",
        middleware: [middleware as never].flat(),
        options,
      };
    },
    HEAD(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "HEAD",
      };
    },
    OPTIONS(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "OPTIONS",
      };
    },
    GET(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "GET",
      };
    },
    POST(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "POST",
      };
    },
    PUT(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "PUT",
      };
    },
    PATCH(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "PATCH",
      };
    },
    DELETE(middleware) {
      return {
        kind: "handler",
        middleware: [middleware as never].flat(),
        method: "DELETE",
      };
    },
  });
};
