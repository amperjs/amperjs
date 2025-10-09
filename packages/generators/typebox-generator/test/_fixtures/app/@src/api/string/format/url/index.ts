import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { format: "url" }>;
  }>(async () => {}),
]);
