import { defineRoute } from "@kappajs/api";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
