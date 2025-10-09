import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // User registration with multiple constraints
    userRegistration: {
      username: TRefine<
        string,
        { minLength: 3; maxLength: 20; pattern: "^[a-zA-Z0-9_]+$" }
      >;
      email: TRefine<string, { format: "email" }>;
      password: TRefine<
        string,
        { minLength: 8; pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)" }
      >;
      age: TRefine<number, { minimum: 13; maximum: 120 }>;
      roles: TRefine<
        Array<string>,
        {
          minItems: 1;
          uniqueItems: true;
          items: { enum: ["user", "admin", "moderator"] };
        }
      >;
    };

    // Pagination with constraints
    pagination: {
      page: TRefine<number, { minimum: 1 }>;
      pageSize: TRefine<number, { minimum: 1; maximum: 100 }>;
      sortBy?: TRefine<string, { enum: ["name", "date", "price"] }>;
      sortOrder?: TRefine<string, { enum: ["asc", "desc"] }>;
    };

    // Product with nested validation
    product: {
      id: TRefine<string, { format: "uuid" }>;
      name: TRefine<string, { minLength: 1; maxLength: 100 }>;
      price: TRefine<number, { minimum: 0; multipleOf: 0.01 }>;
      tags: TRefine<
        Array<string>,
        { minItems: 1; maxItems: 10; uniqueItems: true }
      >;
      dimensions: {
        width: TRefine<number, { minimum: 0 }>;
        height: TRefine<number, { minimum: 0 }>;
        depth: TRefine<number, { minimum: 0 }>;
      };
      metadata: TRefine<Record<string, string>, { maxProperties: 20 }>;
    };
  }>(async () => {}),
]);
