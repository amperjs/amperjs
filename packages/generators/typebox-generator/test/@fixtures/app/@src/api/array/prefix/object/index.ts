import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Simple object tuples
    simpleObject: TRefine<
      [{ name: string; age: number }],
      {
        prefixItems: [
          {
            type: "object";
            properties: {
              name: { type: "string"; minLength: 2 };
              age: { type: "number"; minimum: 18 };
            };
            required: ["name", "age"];
          },
        ];
      }
    >;

    // Multiple object tuples
    multiObject: TRefine<
      [{ user: string; role: string }, { enabled: boolean; priority: number }],
      {
        prefixItems: [
          {
            type: "object";
            properties: {
              user: { type: "string"; pattern: "^[a-z0-9_]+$" };
              role: { type: "string"; enum: ["admin", "user"] };
            };
            required: ["user", "role"];
          },
          {
            type: "object";
            properties: {
              enabled: { type: "boolean" };
              priority: { type: "number"; minimum: 1; maximum: 5 };
            };
            required: ["enabled", "priority"];
          },
        ];
      }
    >;

    // Nested object tuples
    nestedObject: TRefine<
      [{ profile: { name: string; settings: { theme: string } } }],
      {
        prefixItems: [
          {
            type: "object";
            properties: {
              profile: {
                type: "object";
                properties: {
                  name: { type: "string"; minLength: 1 };
                  settings: {
                    type: "object";
                    properties: {
                      theme: { type: "string"; enum: ["light", "dark"] };
                    };
                    required: ["theme"];
                  };
                };
                required: ["name", "settings"];
              };
            };
            required: ["profile"];
          },
        ];
      }
    >;
  }>(async () => {}),
]);
