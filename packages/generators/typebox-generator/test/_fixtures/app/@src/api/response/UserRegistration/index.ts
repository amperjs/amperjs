import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      id: TRefine<string, { format: "uuid" }>;
      email: TRefine<string, { format: "email" }>;
      firstName: string;
      lastName: string;
      dateOfBirth: TRefine<string, { format: "date" }>;
      emailVerified: boolean;
      createdAt: Date; // Date instance (from ORM)
      updatedAt: Date; // Date instance (from ORM)
    }
  >(async () => {}),
]);
