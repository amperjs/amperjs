import { defineRoute } from "@oreum/api";

type ParamsT<P000 = string> = {
  string?: P000;
};

export default defineRoute<
  ParamsT<TRefine<string, { minLength: 1; maxLength: 5 }>>
>(({ GET }) => [
  GET(async (ctx) => {
    ctx.body = true;
  }),
]);
