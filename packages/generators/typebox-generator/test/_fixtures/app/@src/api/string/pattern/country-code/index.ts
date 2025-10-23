import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[A-Z]{2}$" }>;
  }>(async () => {}),
]);
