import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Fixed-length tuples with specific types
    stringNumberTuple: [string, number];
    booleanStringTuple: [boolean, string];

    // Tuples with constraints
    minLengthTuple: TRefine<[string, number], { minItems: 2 }>;
    maxLengthTuple: TRefine<[string, number, boolean], { maxItems: 3 }>;

    // Tuples with refined elements
    emailAgeTuple: [
      TRefine<string, { format: "email" }>,
      TRefine<number, { minimum: 0; maximum: 120 }>,
    ];

    // Tuple with const values
    configTuple: [
      TRefine<string, { const: "config" }>,
      TRefine<number, { minimum: 1 }>,
    ];
    rangeTuple: [
      TRefine<number, { minimum: 0 }>,
      TRefine<number, { maximum: 100 }>,
    ];
  }>(async () => {}),
]);
