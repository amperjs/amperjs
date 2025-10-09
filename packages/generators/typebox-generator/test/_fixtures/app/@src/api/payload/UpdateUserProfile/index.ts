import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    firstName?: string;
    lastName?: string;
    dateOfBirth?: TRefine<string, { format: "date" }>;
    phoneNumber?: TRefine<string, { pattern: "^\\+?[1-9][0-9]{4,14}$" }>;
    avatar?: string;
    preferences?: {
      newsletter: boolean;
      notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
      };
      theme: "light" | "dark" | "auto";
    };
    addresses?: Array<{
      type: "home" | "work" | "billing";
      street: TRefine<string, { minLength: 1; maxLength: 100 }>;
      city: string;
      state: TRefine<string, { minLength: 2; maxLength: 2 }>;
      zipCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
      country: string;
      isDefault: boolean;
    }>;
  }>(async () => {}),
]);
