import { defineRoute } from "@amperjs/api";

export default defineRoute<[number]>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
