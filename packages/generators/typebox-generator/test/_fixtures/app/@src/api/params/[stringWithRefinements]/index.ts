import { defineRoute } from "@oreum/api";

export default defineRoute<[TRefine<string, { minLength: 1; maxLength: 5 }>]>(
  ({ GET }) => [
    GET(async (ctx) => {
      ctx.body = true;
    }),
  ],
);
