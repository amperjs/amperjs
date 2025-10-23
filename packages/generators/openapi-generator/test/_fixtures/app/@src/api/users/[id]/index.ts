import { defineRoute } from "@amperjs/api";

type UserResponse = {
  id: number;
  name: TRefine<string, { minLength: 1; maxLength: 100 }>;
  email: TRefine<string, { format: "email" }>;
  role: "admin" | "user" | "moderator";
  createdAt: TRefine<string, { format: "date-time" }>;
};

type UpdateUserPayload = {
  name?: TRefine<string, { minLength: 1; maxLength: 100 }>;
  email?: TRefine<string, { format: "email" }>;
  role?: "admin" | "user" | "moderator";
};

type UserQuery = {
  include?: "profile" | "posts" | "all";
  fields?: string[];
  expand?: boolean;
};

export default defineRoute<[TRefine<number, { minimum: 1 }>]>(
  ({ GET, PUT, DELETE }) => [
    GET<UserQuery, UserResponse>(async (ctx) => {
      ctx.body = {
        id: Number(ctx.params.id),
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        createdAt: "2024-01-01T00:00:00Z",
      };
    }),

    PUT<UpdateUserPayload, UserResponse>(async (ctx) => {
      const updates = ctx.payload;
      ctx.body = {
        id: Number(ctx.params.id),
        name: updates.name || "John Doe",
        email: updates.email || "john@example.com",
        role: updates.role || "user",
        createdAt: "2024-01-01T00:00:00Z",
      };
    }),

    DELETE<never, { success: boolean; message: string }>(async (ctx) => {
      ctx.body = { success: true, message: "User deleted" };
    }),
  ],
);
