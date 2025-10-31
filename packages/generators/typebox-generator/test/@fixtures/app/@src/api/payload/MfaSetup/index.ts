import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    userId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
    method: "totp" | "sms" | "email";
    phoneNumber?: string;
    email?: TRefine<string, { format: "email" }>;
    backupCodes: string[];
    deviceInfo?: {
      name: TRefine<string, { minLength: 1; maxLength: 50 }>;
      type: "mobile" | "tablet" | "desktop";
      os: string;
      browser?: string;
    };
  }>(async () => {}),
]);
