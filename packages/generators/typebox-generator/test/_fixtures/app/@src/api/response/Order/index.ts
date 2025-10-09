import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      orderId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      status: "pending" | "confirmed" | "processing" | "shipped" | "delivered";
      totalAmount: TRefine<number, { minimum: 0; maximum: 1000000 }>;
      currency: TRefine<string, { pattern: "^[A-Z]{3}$" }>;
      estimatedDelivery?: TRefine<string, { format: "date-time" }>; // String (from DB)
      items: Array<{
        productId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
        productName: string;
        quantity: TRefine<number, { minimum: 1; maximum: 100 }>;
        unitPrice: number;
        subtotal: number;
      }>;
      shippingAddress: {
        street: TRefine<string, { minLength: 1; maxLength: 100 }>;
        city: string;
        state: TRefine<string, { minLength: 2; maxLength: 2 }>;
        zipCode: TRefine<string, { pattern: "^[0-9]{5}(-[0-9]{4})?$" }>;
        country: string;
      };
      paymentStatus: "pending" | "paid" | "failed";
    }
  >(async () => {}),
]);
