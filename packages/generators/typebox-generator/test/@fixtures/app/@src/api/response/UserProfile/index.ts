import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      id: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      email: TRefine<string, { format: "email" }>;
      firstName: string;
      lastName: string;
      dateOfBirth: TRefine<string, { format: "date" }>; // String (from DB)
      phoneNumber?: TRefine<string, { pattern: "^\\+?[1-9][0-9]{4,14}$" }>;
      avatar?: string;
      emailVerified: boolean;
      preferences: {
        newsletter: boolean;
        notifications: {
          email: boolean;
          sms: boolean;
          push: boolean;
        };
        theme: "light" | "dark" | "auto";
      };
      addresses: Array<{
        id: string;
        type: "home" | "work" | "billing";
        street: TRefine<string, { minLength: 1; maxLength: 100 }>;
        city: string;
        state: TRefine<string, { minLength: 2; maxLength: 2 }>;
        zipCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
        country: string;
        isDefault: boolean;
      }>;
      createdAt: Date; // Date instance (from ORM)
      updatedAt: Date; // Date instance (from ORM)
    }
  >(async () => {}),
]);
