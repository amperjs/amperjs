import { defineRoute } from "@amperjs/api";

export default defineRoute(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
