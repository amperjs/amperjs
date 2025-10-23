import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Basic object contains
    simpleObject: TRefine<
      Array<{ role: string; level: number }>,
      {
        contains: {
          type: "object";
          properties: {
            role: { type: "string"; const: "manager" };
            level: { type: "number"; minimum: 3 };
          };
          required: ["role", "level"];
        };
      }
    >;
    multipleProps: TRefine<
      Array<{ category: string; price: number }>,
      {
        contains: {
          type: "object";
          properties: {
            category: { type: "string"; const: "premium" };
            price: { type: "number"; minimum: 100 };
          };
          required: ["category", "price"];
        };
      }
    >;

    // Object contains with min/max
    minContains: TRefine<
      Array<{ status: string; priority: number }>,
      {
        contains: {
          type: "object";
          properties: {
            status: { type: "string"; const: "critical" };
            priority: { type: "number"; minimum: 5 };
          };
          required: ["status", "priority"];
        };
        minContains: 1;
      }
    >;
    maxContains: TRefine<
      Array<{ type: string; enabled: boolean }>,
      {
        contains: {
          type: "object";
          properties: {
            type: { type: "string"; const: "admin" };
            enabled: { type: "boolean"; const: true };
          };
          required: ["type", "enabled"];
        };
        maxContains: 2;
      }
    >;
  }>(async () => {}),
]);
