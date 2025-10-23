import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { format: "email" }>;
  }>(async () => {}),
]);
