import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      id: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      name: TRefine<string, { minLength: 1; maxLength: 100 }>;
      key: TRefine<string, { minLength: 10; maxLength: 100 }>;
      prefix: TRefine<string, { minLength: 1; maxLength: 20 }>;
      permissions: string[];
      createdAt: Date; // Date instance (from ORM)
      expiresAt?: string; // String (from DB)
      lastUsed?: Date; // Date instance (from ORM)
      rateLimit: TRefine<number, { minimum: 1; maximum: 10000 }>;
      allowedIps: TRefine<
        Array<TRefine<string, { format: "ipv4" }>>,
        { minItems: 1 }
      >;
      allowedOrigins: string[];
    }
  >(async () => {}),
]);
