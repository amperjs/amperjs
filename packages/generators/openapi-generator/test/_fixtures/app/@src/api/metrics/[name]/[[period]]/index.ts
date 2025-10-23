import { defineRoute } from "@amperjs/api";

type MetricData = {
  timestamp: string;
  value: number;
  unit: string;
};

type MetricsResponse = {
  metric: string;
  period: string;
  data: MetricData[];
  summary: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
};

type MetricsQuery = {
  resolution?: "hour" | "day" | "week";
  includeRaw?: boolean;
  transform?: "none" | "movingAverage" | "cumulative";
};

export default defineRoute<
  [string, "hour" | "day" | "week" | "month" | "year"]
>(({ GET, POST }) => [
  GET<MetricsQuery, MetricsResponse>(async (ctx) => {
    ctx.body = {
      metric: ctx.params.name,
      period: ctx.params.period || "day",
      data: [
        { timestamp: "2024-01-01T00:00:00Z", value: 100, unit: "requests" },
        { timestamp: "2024-01-01T01:00:00Z", value: 150, unit: "requests" },
      ],
      summary: {
        average: 125,
        min: 100,
        max: 150,
        count: 2,
      },
    };
  }),

  POST<
    { value: number; timestamp: string },
    { recorded: boolean; metric: string; id: number }
  >(async (ctx) => {
    ctx.body = {
      recorded: true,
      metric: ctx.params.name,
      id: 12345,
    };
  }),
]);
