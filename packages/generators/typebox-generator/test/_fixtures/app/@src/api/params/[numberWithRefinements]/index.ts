import { defineRoute } from "@oreum/api";

type ParamsT<P000 = string> = {
  number: P000;
};

export default defineRoute<
  ParamsT<TRefine<number, { minimum: 0; maximum: 5 }>>
>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
