import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    orderId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
    amount: TRefine<number, { minimum: 0.01; maximum: 1000000 }>;
    currency: TRefine<string, { pattern: "^[A-Z]{3}$" }>;
    paymentMethod: {
      type: "card" | "wallet";
      card?: {
        number: TRefine<string, { pattern: "^[0-9]{13,19}$" }>;
        expMonth: TRefine<number, { minimum: 1; maximum: 12 }>;
        expYear: number;
        cvc: TRefine<string, { pattern: "^[0-9]{3,4}$" }>;
        holderName: string;
      };
      wallet?: {
        walletId: string;
        token: TRefine<string, { minLength: 1; maxLength: 500 }>;
      };
    };
    billingAddress: {
      line1: TRefine<string, { minLength: 1; maxLength: 100 }>;
      line2?: string;
      city: string;
      state: TRefine<string, { minLength: 2; maxLength: 2 }>;
      postalCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
      country: string;
    };
  }>(async () => {}),
]);
