import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Array length constraints
    minItems: TRefine<Array<unknown>, { minItems: 1 }>;
    maxItems: TRefine<Array<unknown>, { maxItems: 5 }>;
    minMaxItems: TRefine<Array<unknown>, { minItems: 2; maxItems: 10 }>;

    // Unique items
    uniqueItems: TRefine<Array<number>, { uniqueItems: true }>;
    uniqueStrings: TRefine<Array<string>, { uniqueItems: true }>;

    // Contains validation
    containsNumber: TRefine<Array<unknown>, { contains: { type: "number" } }>;
    containsPositive: TRefine<Array<number>, { contains: { minimum: 0 } }>;

    // Array with typed items
    numberArray: TRefine<Array<number>, { minItems: 1; maxItems: 10 }>;
    stringArray: TRefine<Array<string>, { minItems: 2; uniqueItems: true }>;

    // Complex arrays
    objectArray: TRefine<Array<{ id: string; value: number }>, { minItems: 1 }>;
  }>(async () => {}),
]);
