import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Minimum/Maximum
    minimum: TRefine<number, { minimum: 0 }>;
    maximum: TRefine<number, { maximum: 100 }>;
    minMax: TRefine<number, { minimum: 10; maximum: 90 }>;

    // Exclusive bounds
    exclusiveMinimum: TRefine<number, { exclusiveMinimum: 0 }>;
    exclusiveMaximum: TRefine<number, { exclusiveMaximum: 100 }>;
    exclusiveRange: TRefine<
      number,
      { exclusiveMinimum: 0; exclusiveMaximum: 100 }
    >;

    // Multiple of
    multipleOf5: TRefine<number, { multipleOf: 5 }>;
    multipleOfDecimal: TRefine<number, { multipleOf: 0.25 }>;

    // Combined constraints
    positiveMultiple: TRefine<number, { minimum: 0; multipleOf: 10 }>;
    negativeOnly: TRefine<number, { maximum: 0 }>;
  }>(async () => {}),
]);
