import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { format: "date-time" }>;
  }>(async () => {}),
]);
