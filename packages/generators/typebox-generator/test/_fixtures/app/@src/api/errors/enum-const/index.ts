import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Enum validation
    status: TRefine<
      string,
      { enum: ["pending", "active", "completed", "failed"] }
    >;
    priority: TRefine<number, { enum: [1, 2, 3, 4, 5] }>;
    booleanEnum: true | false;

    // Const validation
    version: TRefine<string, { const: "1.0.0" }>;
    apiVersion: TRefine<number, { const: 2 }>;
    enabled: true;

    // Mixed types
    mixedEnum: TRefine<string | number, { enum: ["auto", 0, 100] }>;
  }>(async () => {}),
]);
