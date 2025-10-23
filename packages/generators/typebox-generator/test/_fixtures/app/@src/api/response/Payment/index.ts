import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      paymentId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      orderId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      status: "succeeded" | "pending" | "failed" | "refunded";
      amount: TRefine<number, { minimum: 0.01; maximum: 1000000 }>;
      currency: TRefine<string, { pattern: "^[A-Z]{3}$" }>;
      paymentMethod: {
        type: string;
        last4?: TRefine<string, { pattern: "^[0-9]{4}$" }>;
        brand?: string;
      };
      processedAt: string; // String (from DB)
      failureReason?: string | undefined;
      nextAction?:
        | {
            type: "redirect" | "3d_secure" | "wait";
            url?: TRefine<string, { format: "url" }>;
          }
        | undefined;
    }
  >(async () => {}),
]);
