import { createRouter, type RouterOptions } from "@oreum/api";

export default (options?: RouterOptions) => {
  const router = createRouter(options);
  return router;
};
