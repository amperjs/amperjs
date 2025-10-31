import { defineRoute } from "@kappajs/api";
export default defineRoute(({ POST }) => [
  POST<{
    // AllOf - number must satisfy all constraints simultaneously
    allOfConstraints: TRefine<
      number,
      { minimum: 0; maximum: 100; multipleOf: 5 }
    >;

    // Union type (anyOf-like behavior) - must be one of the types
    flexibleValue: string | number | boolean;

    // String with multiple constraints (allOf-like)
    constrainedString: TRefine<
      string,
      { minLength: 5; maxLength: 20; pattern: "^[a-zA-Z0-9]+$" }
    >;

    // Not negative (using minimum instead of 'not')
    positiveNumber: TRefine<number, { minimum: 0 }>;
  }>(async () => {}),
]);
