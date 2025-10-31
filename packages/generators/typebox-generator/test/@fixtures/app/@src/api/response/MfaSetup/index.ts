import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      userId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      method: "totp" | "sms" | "email";
      status: "active" | "pending_verification";
      setupData?: {
        qrCode?: string;
        secret?: TRefine<string, { minLength: 10; maxLength: 100 }>;
        phoneNumber?: TRefine<string, { pattern: "^\\+?[1-9][0-9]{4,14}$" }>;
        email?: TRefine<string, { format: "email" }>;
      };
      backupCodes: TRefine<
        Array<TRefine<string, { pattern: "^code\\d+" }>>,
        { minItems: 1 }
      >;
      deviceInfo?: {
        name: TRefine<string, { minLength: 1; maxLength: 50 }>;
        type: string;
        os: string;
        browser?: string;
      };
      createdAt: Date; // Date instance (from ORM)
      verifiedAt?: string; // String (from DB)
    }
  >(async () => {}),
]);
