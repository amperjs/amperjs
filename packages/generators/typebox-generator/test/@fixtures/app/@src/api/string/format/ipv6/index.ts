import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<string, { format: "ipv6" }>;
  }>(async () => {}),
]);
