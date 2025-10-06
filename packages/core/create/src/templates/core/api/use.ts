import { use } from "@oreum/api";
import bodyparser from "@oreum/api/bodyparser";

// Middleware applied to all routes by default.
// Can be overridden on a per-route basis using the slot key.
export default [
  use(bodyparser.json(), {
    on: ["POST", "PUT", "PATCH"],
    slot: "bodyparser",
  }),

  use(
    (ctx, next) => {
      ctx.payload = ["POST", "PUT", "PATCH"].includes(ctx.method)
        ? ctx.request.body
        : ctx.query;
      return next();
    },
    { slot: "payload" },
  ),
];
