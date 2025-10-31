import { defineRoute } from "@kappajs/api";

type CoordinateResponse = {
  x: number;
  y: number;
  location: string;
  elevation?: number;
  timezone?: string;
};

type CoordinateQuery = {
  format?: "decimal" | "dms";
  includeTimezone?: boolean;
  includeElevation?: boolean;
};

export default defineRoute<
  [
    TRefine<number, { minimum: -180; maximum: 180; multipleOf: 0.000001 }>,
    TRefine<number, { minimum: -90; maximum: 90; multipleOf: 0.000001 }>,
  ]
>(({ GET }) => [
  GET<CoordinateQuery, CoordinateResponse>(async (ctx) => {
    const { includeTimezone, includeElevation } = ctx.payload;
    ctx.body = {
      x: Number(ctx.params.x),
      y: Number(ctx.params.y),
      location: "Sample Location",
      ...(includeElevation ? { elevation: 100 } : {}),
      ...(includeTimezone ? { timezone: "UTC" } : {}),
    };
  }),
]);
