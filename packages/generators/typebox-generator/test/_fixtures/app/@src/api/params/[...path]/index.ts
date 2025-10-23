import { defineRoute } from "@amperjs/api";

export default defineRoute<["a" | "b" | "c"]>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
