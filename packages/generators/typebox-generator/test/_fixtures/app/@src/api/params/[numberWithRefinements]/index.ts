import { defineRoute } from "@oreum/api";

export default defineRoute<[TRefine<number, { minimum: 0; maximum: 5 }>]>(
  ({ GET }) => [
    GET(async (ctx) => {
      ctx.body = true;
    }),
  ],
);
