import { defineRoute } from "@oreum/api";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
