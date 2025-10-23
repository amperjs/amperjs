import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    userId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
    channels: Array<{
      type: "email" | "sms" | "push" | "webhook";
      target: TRefine<string, { minLength: 1; maxLength: 200 }>;
      events: string[];
      preferences?: {
        frequency: "instant" | "daily" | "weekly";
        quietHours?: {
          start: TRefine<
            string,
            { pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" }
          >;
          end: string;
        };
      };
    }>;
  }>(async () => {}),
]);
