import { createRouter, type RouterOptions } from "@kappajs/api";

export default (options?: RouterOptions) => {
  const router = createRouter(options);
  return router;
};
