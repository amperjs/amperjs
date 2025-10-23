import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic string contains
    constContains: TRefine<
      string[],
      {
        contains: { type: "string"; const: "admin" };
      }
    >;
    patternContains: TRefine<
      string[],
      {
        contains: { type: "string"; pattern: "^VIP" };
      }
    >;
    enumContains: TRefine<
      string[],
      {
        contains: { type: "string"; enum: ["active", "pending", "completed"] };
      }
    >;

    // String contains with min/max
    minContains: TRefine<
      string[],
      {
        contains: { type: "string"; const: "gold" };
        minContains: 2;
      }
    >;
    maxContains: TRefine<
      string[],
      {
        contains: { type: "string"; const: "silver" };
        maxContains: 3;
      }
    >;
    minMaxContains: TRefine<
      string[],
      {
        contains: { type: "string"; const: "premium" };
        minContains: 1;
        maxContains: 2;
      }
    >;

    // Complex string patterns
    multiConstraintContains: TRefine<
      string[],
      {
        contains: {
          type: "string";
          minLength: 3;
          maxLength: 6;
          pattern: "^[A-Z]";
        };
      }
    >;
    emailContains: TRefine<
      string[],
      {
        contains: {
          type: "string";
          format: "email";
        };
      }
    >;
  }>(async () => {}),
]);
