import { defineRoute } from "@amperjs/api";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
    };
  };
  created: number;
};

type WebhookResponse = {
  received: boolean;
  processed: string;
  timestamp: string;
};

export default defineRoute(({ POST }) => [
  POST<
    StripeEvent,
    /** @skip-validation */
    WebhookResponse
  >(async (ctx) => {
    const event = ctx.payload;
    switch (event.type) {
      case "payment_intent.succeeded":
        break;
      case "invoice.payment_failed":
        break;
    }
    ctx.body = {
      received: true,
      processed: event.type,
      timestamp: new Date().toISOString(),
    };
  }),
]);
