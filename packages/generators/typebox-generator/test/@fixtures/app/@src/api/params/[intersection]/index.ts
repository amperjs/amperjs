import { defineRoute } from "@kappajs/api";

type Color = "R" | "G" | "B";

export default defineRoute<[Color]>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
