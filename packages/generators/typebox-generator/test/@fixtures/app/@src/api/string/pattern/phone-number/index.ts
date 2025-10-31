import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^\\+?[1-9][0-9]{4,14}$" }>;
  }>(async () => {}),
]);
