import type {
  Middleware,
  RouterOptions,
  RouterParamContext,
} from "@koa/router";
import type { Next } from "koa";

declare module "koa" {
  interface Request {
    body?: unknown;
    rawBody: string;
  }
}

export interface DefaultState {}
export interface DefaultContext {}

export enum HTTPMethods {
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  GET = "GET",
  PUT = "PUT",
  PATCH = "PATCH",
  POST = "POST",
  DELETE = "DELETE",
}

export type { Middleware };

export type HTTPMethod = keyof typeof HTTPMethods;

export type ParameterizedContext<
  ParamsT,
  StateT,
  ContextT,
  PayloadT = unknown,
  ResponseT = unknown,
> = import("koa").ParameterizedContext<
  DefaultState & StateT,
  RouterParamContext<StateT, ContextT> &
    DefaultContext &
    ContextT & {
      typedParams: ParamsT;
      payload: PayloadT;
    },
  ResponseT
>;

type RouteMiddleware<ParamsT, StateT, ContextT> = (
  ctx: ParameterizedContext<ParamsT, StateT, ContextT>,
  next: Next,
) => Promise<void> | void;

export type RouteHandler<
  ParamsT,
  StateT,
  ContextT,
  PayloadT = unknown,
  ResponseT = unknown,
> = (
  ctx: ParameterizedContext<ParamsT, StateT, ContextT, PayloadT, ResponseT>,
  next: Next,
) => Promise<void> | void;

export type MiddlewareDefinition = {
  kind: "middleware";
  middleware: Array<Middleware>;
  options?: UseOptions | undefined;
};

export type HandlerDefinition = {
  kind: "handler";
  middleware: Array<Middleware>;
  method: HTTPMethod;
};

export type RouteDefinitionItem = MiddlewareDefinition | HandlerDefinition;

export type DefineRouteHelpers<
  ParamsT,
  StateT,
  ContextT,
  OptionalHandlers = undefined,
> = {
  // INFO: The `use` helper intentionally does not accept type parameters.
  // PayloadT and ResponseT are only relevant to route handlers,
  // as different request methods receive different payloads and return different responses.
  // Allowing these type parameters on `use` would be misleading,
  // since middleware operates across multiple request methods with varying types.
  use: (
    middleware:
      | RouteMiddleware<ParamsT, StateT, ContextT>
      | Array<RouteMiddleware<ParamsT, StateT, ContextT>>,
    options?: UseOptions,
  ) => RouteDefinitionItem;
} & {
  [M in HTTPMethod]: M extends OptionalHandlers
    ? <PayloadT = unknown, ResponseT = unknown>(
        handler?:
          | RouteHandler<ParamsT, StateT, ContextT, PayloadT, ResponseT>
          | Array<RouteHandler<ParamsT, StateT, ContextT, PayloadT, ResponseT>>,
      ) => RouteDefinitionItem
    : <PayloadT = unknown, ResponseT = unknown>(
        handler:
          | RouteHandler<ParamsT, StateT, ContextT, PayloadT, ResponseT>
          | Array<RouteHandler<ParamsT, StateT, ContextT, PayloadT, ResponseT>>,
      ) => RouteDefinitionItem;
};

export type DefineRoute = <
  ParamsT = Record<string, string>,
  StateT = object,
  ContextT = object,
>(
  factory: (
    helpers: DefineRouteHelpers<ParamsT, StateT, ContextT>,
  ) => Array<RouteDefinitionItem>,
) => Array<RouteDefinitionItem>;

export interface UseSlots {
  params: string;
  validateParams: string;
  bodyparser: string;
  payload: string;
  validatePayload: string;
  validateResponse: string;
}

export type UseOptions = {
  on?: Array<HTTPMethod>;
  slot?: keyof UseSlots;
  debug?: string | undefined;
};

export type Use = <StateT = DefaultState, ContextT = DefaultContext>(
  middleware:
    | RouteMiddleware<Record<string, string>, StateT, ContextT>
    | Array<RouteMiddleware<Record<string, string>, StateT, ContextT>>,
  options?: UseOptions,
) => MiddlewareDefinition;

export type RouterRouteSource = {
  name: string;
  path: string;
  file: string;
  definitionItems: Array<RouteDefinitionItem>;
  params: Array<[name: string, isRest?: boolean]>;
  numericParams: Array<string>;
  validationSchemas: ValidationSchemas;
  meta?: Record<string, unknown>;
};

export type RouterRoute = {
  name: string;
  path: string;
  file: string;
  methods: Array<string>;
  middleware: Array<Middleware>;
  kind: "middleware" | "handler";
  slot?: keyof UseSlots | undefined;
  debug?: string | undefined;
};

import type Koa from "koa";
export type App = Koa<DefaultState, DefaultContext>;
export type AppOptions = ConstructorParameters<typeof import("koa")>[0];
export type CreateApp = (options?: AppOptions) => App;

import type KoaRouter from "@koa/router";
export type Router = KoaRouter<DefaultState, DefaultContext>;
export type { RouterOptions };
export type CreateRouter = (options?: RouterOptions) => Router;

export type DevMiddlewareFactory = (
  app: App,
) => (
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
  next: () => Promise<void>,
) => Promise<void>;
export type TeardownHandler = (app: App) => void | Promise<void>;

export type ValidationSchema = {
  check: (data: unknown) => boolean;
  errors: (data: unknown) => Array<ValidationErrorEntry>;
  errorMessage: (data: unknown) => string;
  errorSummary: (data: unknown) => string;
  validate: (data: unknown) => void;
};

export type ValidationSchemas<Extend = object> = {
  params?: ValidationSchema & Extend;
  payload?: Record<string, ValidationSchema & Extend>;
  response?: Record<string, ValidationSchema & Extend>;
};

export type ValidationErrorScope = "params" | "payload" | "response";

/**
 * Shape of individual validation errors emitted by generators.
 */
export type ValidationErrorEntry = {
  /** JSON Schema keyword that triggered the error (e.g. `format`, `maxItems`, `maxLength`). */
  keyword: string;
  /** JSON Pointer–style path to the invalid field (matches JSON Schema `instancePath`). */
  path: string;
  /** Human-readable error message. */
  message: string;
  /** Constraint parameters (e.g. `{ limit: 5 }`, `{ format: "email" }`). */
  params?: Record<string, unknown>;
  /** Optional error code for i18n/l10n or custom handling. */
  code?: string;
};

export type ValidationErrorData = {
  errors: Array<ValidationErrorEntry>;
  /**
   * Formats errors into a single human-readable message.
   * @example: Validation failed: user: missing required properties: "email", "name"; password: must be at least 8 characters long
   */
  errorMessage: string;
  /**
   * Gets a simple error summary for quick feedback.
   * @example: 2 validation errors found across 2 fields
   */
  errorSummary: string;
};
