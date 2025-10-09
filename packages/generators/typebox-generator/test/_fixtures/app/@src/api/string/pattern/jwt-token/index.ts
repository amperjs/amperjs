import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<
      string,
      { pattern: "^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$" }
    >;
  }>(async () => {}),
]);
