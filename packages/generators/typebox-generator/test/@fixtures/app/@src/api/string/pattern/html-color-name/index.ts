import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    value: TRefine<
      string,
      {
        pattern: "^(red|green|blue|yellow|purple|orange|pink|black|white|gray|grey|brown|cyan|magenta|silver|maroon|olive|lime|teal|navy)$";
      }
    >;
  }>(async () => {}),
]);
