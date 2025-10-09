import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic mixed tuples
    simpleMixed: TRefine<
      [string, number, boolean],
      {
        prefixItems: [
          { type: "string"; const: "config" },
          { type: "number"; minimum: 1 },
          { type: "boolean" },
        ];
      }
    >;

    // Complex mixed tuples
    complexMixed: TRefine<
      [string, number, boolean, string],
      {
        prefixItems: [
          { type: "string"; pattern: "^[A-Z][a-z]+$" },
          { type: "number"; multipleOf: 0.5 },
          { type: "boolean" },
          { type: "string"; minLength: 2; maxLength: 4 },
        ];
      }
    >;

    // Mixed with formats
    formatMixed: TRefine<
      [string, string, number],
      {
        prefixItems: [
          { type: "string"; format: "email" },
          { type: "string"; format: "date" },
          { type: "number"; minimum: 0 },
        ];
      }
    >;
  }>(async () => {}),
]);
