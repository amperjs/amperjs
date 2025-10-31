import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      userId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      subscriptions: Array<{
        id: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
        channel: "email" | "sms" | "push" | "webhook";
        target: TRefine<string, { minLength: 1; maxLength: 200 }>;
        events: string[];
        status: "active" | "inactive" | "pending";
        preferences: {
          frequency: "instant" | "daily" | "weekly";
          quietHours?: {
            start: TRefine<
              string,
              { pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" }
            >;
            end: string;
          };
        };
        createdAt: string; // String (from DB)
        lastNotified?: Date; // Date instance (from ORM)
      }>;
    }
  >(async () => {}),
]);
