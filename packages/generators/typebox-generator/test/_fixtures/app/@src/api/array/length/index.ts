import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    stringMinItems: TRefine<string[], { minItems: 1 }>;
    stringMaxItems: TRefine<string[], { maxItems: 5 }>;
    stringMixedLength: TRefine<string[], { minItems: 1; maxItems: 5 }>;
    numberMinItems: TRefine<number[], { minItems: 2 }>;
    numberMaxItems: TRefine<number[], { maxItems: 10 }>;
    numberMixedLength: TRefine<number[], { minItems: 2; maxItems: 10 }>;
    booleanMinItems: TRefine<boolean[], { minItems: 1 }>;
    booleanMaxItems: TRefine<boolean[], { maxItems: 3 }>;
    uniqueStrings: TRefine<string[], { uniqueItems: true }>;
    uniqueNumbers: TRefine<number[], { uniqueItems: true }>;
    uniqueBooleans: TRefine<boolean[], { uniqueItems: true }>;
    complexLength: TRefine<
      string[],
      {
        minItems: 2;
        maxItems: 3;
        uniqueItems: true;
      }
    >;
  }>(async () => {}),
]);
