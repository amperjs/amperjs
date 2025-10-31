import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[A-Z]{3}$" }>;
  }>(async () => {}),
]);
