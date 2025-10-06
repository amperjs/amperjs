import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";

import Koa, { type Context, type Next } from "koa";
import compose from "koa-compose";

export const runMiddleware = async <
  // biome-ignore lint: any
  T = any,
>(
  middleware: Array<(ctx: T, next: Next) => void | Promise<void>>,
  ctxOverrides: Partial<Context> = {},
) => {
  const app = new Koa();

  const req = new IncomingMessage(new Socket());
  const res = new ServerResponse(req);

  // create real Koa context
  const ctx = app.createContext(req, res);

  // apply overrides for testing
  Object.assign(ctx, ctxOverrides);

  const fn = compose(middleware);
  await fn(ctx as never);

  return ctx;
};
