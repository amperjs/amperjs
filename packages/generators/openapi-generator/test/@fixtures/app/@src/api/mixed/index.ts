import { defineRoute } from "@kappajs/api";

type StrictPayload = {
  id: number;
  name: string;
  email: TRefine<string, { format: "email" }>;
};

type LoosePayload = {
  data: {
    key: string;
    value: string;
  };
};

type StrictResponse = {
  success: boolean;
  data: {
    id: number;
    processed: boolean;
  };
};

type LooseResponse = {
  received: boolean;
  custom: string;
  metadata: {
    timestamp: string;
  };
};

type MixedQuery = {
  debug?: boolean;
  includeMetadata?: boolean;
  format?: "full" | "minimal";
};

export default defineRoute(({ GET, POST, PUT }) => [
  GET<MixedQuery, StrictResponse>(async (ctx) => {
    ctx.body = { success: true, data: { id: 1, processed: true } };
  }),

  POST<
    StrictPayload,
    /** @skip-validation */
    LooseResponse
  >(async (ctx) => {
    ctx.body = {
      received: true,
      custom: "response",
      metadata: { timestamp: new Date().toISOString() },
    };
  }),

  PUT<
    /** @skip-validation */
    LoosePayload,
    StrictResponse
  >(async (ctx) => {
    ctx.body = { success: true, data: { id: 1, processed: true } };
  }),
]);
