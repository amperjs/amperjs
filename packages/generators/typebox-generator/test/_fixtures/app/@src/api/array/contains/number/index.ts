import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic number contains
    valueContains: TRefine<
      number[],
      {
        contains: { type: "number"; const: 42 };
      }
    >;
    rangeContains: TRefine<
      number[],
      {
        contains: { type: "number"; minimum: 10; maximum: 20 };
      }
    >;
    multipleContains: TRefine<
      number[],
      {
        contains: { type: "number"; multipleOf: 5 };
      }
    >;

    // Number contains with min/max
    minContains: TRefine<
      number[],
      {
        contains: { type: "number"; minimum: 100 };
        minContains: 2;
      }
    >;
    maxContains: TRefine<
      number[],
      {
        contains: { type: "number"; maximum: 0 };
        maxContains: 1;
      }
    >;
    minMaxContains: TRefine<
      number[],
      {
        contains: { type: "number"; minimum: 50; maximum: 100 };
        minContains: 1;
        maxContains: 3;
      }
    >;

    // Complex number constraints
    exclusiveContains: TRefine<
      number[],
      {
        contains: {
          type: "number";
          exclusiveMinimum: 0;
          exclusiveMaximum: 100;
        };
      }
    >;
    integerContains: TRefine<
      number[],
      {
        contains: {
          type: "number";
          multipleOf: 1; // Forces integer
        };
      }
    >;
  }>(async () => {}),
]);
