import { routerRoutesFactory } from "@/router";
import {
  HTTPMethods,
  type MiddlewareDefinition,
  type RouterRouteSource,
} from "@/types";

export const defaultMethods = Object.keys(HTTPMethods);

export const middlewareStackBuilder = (
  a: Array<Partial<RouterRouteSource>>,
  b: { coreMiddleware?: Array<MiddlewareDefinition> },
) => {
  return routerRoutesFactory(
    a.map((e) => {
      return {
        name: "",
        path: "",
        file: "",
        definitionItems: [],
        params: [],
        numericParams: [],
        validationSchemas: {},
        ...(e as Partial<RouterRouteSource>),
      };
    }),
    { coreMiddleware: b?.coreMiddleware || [] },
  );
};
