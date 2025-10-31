import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<
      string,
      { pattern: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$" }
    >;
  }>(async () => {}),
]);
