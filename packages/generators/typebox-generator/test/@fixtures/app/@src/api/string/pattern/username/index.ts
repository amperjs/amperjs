import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{3,20}$" }>;
  }>(async () => {}),
]);
