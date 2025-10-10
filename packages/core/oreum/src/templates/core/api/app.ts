import { type AppOptions, createApp } from "@oreum/api";

import errorHandler from "./error-handler";

export default (options?: AppOptions) => {
  const app = createApp(options);
  app.on("error", console.error);
  // errorHandler should go first
  app.use(errorHandler);
  return app;
};
