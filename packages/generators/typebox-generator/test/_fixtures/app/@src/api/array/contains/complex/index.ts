import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Nested array contains
    nestedArray: TRefine<
      Array<{
        user: string;
        permissions: string[];
      }>,
      {
        contains: {
          type: "object";
          properties: {
            user: { type: "string"; pattern: "^admin-" };
            permissions: {
              type: "array";
              contains: { type: "string"; const: "delete" };
            };
          };
          required: ["user", "permissions"];
        };
      }
    >;

    // Deeply nested object
    deepNested: TRefine<
      Array<{
        profile: {
          name: string;
          settings: { theme: string; notifications: boolean };
        };
      }>,
      {
        contains: {
          type: "object";
          properties: {
            profile: {
              type: "object";
              properties: {
                name: { type: "string"; minLength: 2 };
                settings: {
                  type: "object";
                  properties: {
                    theme: { type: "string"; enum: ["dark"] };
                    notifications: { type: "boolean"; const: true };
                  };
                  required: ["theme", "notifications"];
                };
              };
              required: ["name", "settings"];
            };
          };
          required: ["profile"];
        };
      }
    >;

    // Multiple constraints combined
    multiConstraint: TRefine<
      Array<{
        id: string;
        tags: string[];
        metadata: Record<string, unknown>;
      }>,
      {
        contains: {
          type: "object";
          properties: {
            id: { type: "string"; pattern: "^user_" };
            tags: {
              type: "array";
              minItems: 1;
              contains: { type: "string"; const: "verified" };
            };
            metadata: {
              type: "object";
              required: ["createdAt"];
            };
          };
          required: ["id", "tags", "metadata"];
        };
      }
    >;
  }>(async () => {}),
]);
