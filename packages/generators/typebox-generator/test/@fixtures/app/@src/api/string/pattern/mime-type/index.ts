import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[a-z]+/[a-z0-9.+-]+$" }>;
  }>(async () => {}),
]);
