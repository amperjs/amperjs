import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" }>;
  }>(async () => {}),
]);
