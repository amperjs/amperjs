import { type AppOptions, createApp } from "@amperjs/api";

export default (options?: AppOptions) => {
  const app = createApp(options);
  return app;
};
