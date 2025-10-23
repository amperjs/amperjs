import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    userId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
    items: Array<{
      productId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      quantity: TRefine<number, { minimum: 1; maximum: 100 }>;
      price: number;
      variants?: {
        size?: string;
        color?: TRefine<string, { maxLength: 20 }>;
        material?: string;
      };
    }>;
    shippingAddress: {
      street: TRefine<string, { minLength: 1; maxLength: 100 }>;
      city: string;
      state: TRefine<string, { minLength: 2; maxLength: 2 }>;
      zipCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
      country: string;
    };
    paymentMethod: "credit_card" | "paypal" | "apple_pay";
    promoCode?: string;
  }>(async () => {}),
]);
