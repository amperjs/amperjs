import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<
      string,
      { pattern: "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$" }
    >;
  }>(async () => {}),
]);
