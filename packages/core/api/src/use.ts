import type { Use } from "./types";

export const use: Use = (middleware, options) => {
  return {
    kind: "middleware",
    middleware: [middleware].flat() as never,
    options,
  };
};
