import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Required properties
    requiredProps: {
      id: string;
      name: string;
      email: TRefine<string, { format: "email" }>;
    };

    // Optional properties
    optionalProps: {
      id: string;
      description?: string;
    };

    // Additional properties constraint
    noAdditionalProps: TRefine<
      { id: string; name: string },
      { additionalProperties: false }
    >;

    // Property count constraints
    minProperties: TRefine<Record<string, unknown>, { minProperties: 2 }>;
    maxProperties: TRefine<Record<string, unknown>, { maxProperties: 5 }>;

    // Nested objects
    nestedObject: {
      user: {
        profile: {
          name: string;
          settings: {
            theme: TRefine<string, { enum: ["light", "dark"] }>;
            notifications: boolean;
          };
        };
      };
    };

    // Object with specific property names
    dynamicKeys: TRefine<
      Record<string, number>,
      { propertyNames: { pattern: "^[a-z]+$" } }
    >;
  }>(async () => {}),
]);
