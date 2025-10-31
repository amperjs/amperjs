import { defineRoute } from "@kappajs/api";

export default defineRoute<[number]>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
