import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { pattern: "^[0-9]{13,19}$" }>;
  }>(async () => {}),
]);
