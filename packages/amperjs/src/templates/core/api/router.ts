import { createRouter, type RouterOptions } from "@amperjs/api";

export default (options?: RouterOptions) => {
  const router = createRouter(options);
  return router;
};
