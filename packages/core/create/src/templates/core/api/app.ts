import { type AppOptions, createApp } from "@kappajs/api";

export default (options?: AppOptions) => {
  const app = createApp(options);
  return app;
};
