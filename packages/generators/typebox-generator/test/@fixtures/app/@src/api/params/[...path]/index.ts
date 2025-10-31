import { defineRoute } from "@kappajs/api";

export default defineRoute<["a" | "b" | "c"]>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
