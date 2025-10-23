import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[a-z]{2,3}(-[A-Z]{2})?$" }>;
  }>(async () => {}),
]);
