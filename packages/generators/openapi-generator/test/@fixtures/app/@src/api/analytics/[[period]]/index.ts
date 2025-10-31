import { defineRoute } from "@kappajs/api";

type AnalyticsQuery = {
  metrics: ("views" | "clicks" | "conversions" | "revenue")[];
  breakdown?: "day" | "week" | "month";
  compareToPrevious?: boolean;
};

type AnalyticsDataPoint = {
  date: TRefine<string, { format: "date" }>;
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
};

type AnalyticsResponse = {
  period: string;
  metrics: AnalyticsDataPoint[];
  summary: {
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
  };
};

export default defineRoute<["day" | "week" | "month" | "year"]>(({ POST }) => [
  POST<
    /** @skip-validation */
    AnalyticsQuery,
    /** @skip-validation */
    AnalyticsResponse
  >(async (ctx) => {
    const period = ctx.params.period || "week";
    ctx.body = {
      period,
      metrics: [
        {
          date: "2024-01-01",
          views: 1000,
          clicks: 100,
          conversions: 10,
          revenue: 500,
        },
      ],
      summary: {
        totalViews: 1000,
        totalClicks: 100,
        totalConversions: 10,
        totalRevenue: 500,
      },
    };
  }),
]);
