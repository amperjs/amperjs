import { type Middleware, ValidationError } from "@oreum/api";

const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const [code, message] = extractCodeWithMessage(error);
    ctx.status = code;
    ctx.body = { error: message };
    ctx.app.emit("error", error, ctx);
  }
};

const extractCodeWithMessage = (error: unknown): [number, string] => {
  // when string thrown, use status code 400
  if (typeof error === "string") {
    return [400, error];
  }

  if (Array.isArray(error)) {
    return [Number(error[0]) || 400, error[1] || "Unknown Error Occurred"];
  }

  if (error instanceof ValidationError) {
    const { scope, errorMessage } = error;
    return [400, `${scope}ValidationError: ${errorMessage}`];
  }

  if (error instanceof Error) {
    return [400, error.message];
  }

  return [500, "Unknown Error Occurred"];
};

export default errorHandler;
