import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic string tuples
    constTuple: TRefine<
      [string, string],
      {
        prefixItems: [
          { type: "string"; const: "start" },
          { type: "string"; const: "end" },
        ];
      }
    >;
    patternTuple: TRefine<
      [string, string],
      {
        prefixItems: [
          { type: "string"; pattern: "^[A-Z]" },
          { type: "string"; pattern: "^[a-z]+$" },
        ];
      }
    >;

    // String tuples with length constraints
    lengthTuple: TRefine<
      [string, string, string],
      {
        prefixItems: [
          { type: "string"; minLength: 1 },
          { type: "string"; maxLength: 5 },
          { type: "string"; minLength: 2; maxLength: 4 },
        ];
      }
    >;

    // Mixed string constraints
    mixedString: TRefine<
      [string, string, string],
      {
        prefixItems: [
          { type: "string"; const: "user" },
          { type: "string"; format: "email" },
          { type: "string"; pattern: "^\\d{3}-\\d{3}-\\d{4}$" },
        ];
      }
    >;
  }>(async () => {}),
]);
