import { defineRoute } from "@oreum/api";

type ParamsT<P000 = string> = {
  number: P000;
};

export default defineRoute<ParamsT<number>>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
