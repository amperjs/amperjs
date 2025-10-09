import { defineRoute } from "@oreum/api";

type Color = "R" | "G" | "B";

type ParamsT<P000 = string> = {
  intersection?: P000;
};

export default defineRoute<ParamsT<Color>>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
