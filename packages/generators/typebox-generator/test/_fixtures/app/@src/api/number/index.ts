import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic range validation
    minMax: TRefine<number, { minimum: 0; maximum: 100 }>;

    // Exclusive bounds
    exclusiveMin: TRefine<number, { exclusiveMinimum: 0 }>;
    exclusiveMax: TRefine<number, { exclusiveMaximum: 100 }>;

    // Combined exclusive bounds
    exclusiveRange: TRefine<
      number,
      { exclusiveMinimum: 0; exclusiveMaximum: 100 }
    >;

    // Multiple of constraint
    multipleOfFive: TRefine<number, { multipleOf: 5 }>;

    // Mixed constraints
    complexConstraint: TRefine<
      number,
      {
        minimum: 10;
        maximum: 50;
        multipleOf: 2;
      }
    >;

    // Negative ranges
    negativeRange: TRefine<number, { minimum: -100; maximum: -10 }>;

    // Decimal constraints
    decimalRange: TRefine<number, { minimum: 0.1; maximum: 1.0 }>;

    // Integer constraints with multipleOf
    integerMultiple: TRefine<number, { multipleOf: 1 }>; // Forces integers

    // Zero boundary
    positiveOnly: TRefine<number, { minimum: 0 }>;
    negativeOnly: TRefine<number, { maximum: 0 }>;
  }>(async () => {}),
]);
