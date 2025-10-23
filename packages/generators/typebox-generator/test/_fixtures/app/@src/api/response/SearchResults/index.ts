import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      query: TRefine<string, { minLength: 1; maxLength: 100 }>;
      results: unknown[];
      pagination: {
        page: TRefine<number, { minimum: 1 }>;
        limit: TRefine<number, { minimum: 1; maximum: 100 }>;
        total: TRefine<number, { minimum: 0 }>;
        totalPages: TRefine<number, { minimum: 0 }>;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: {
        applied: Record<string, unknown>;
        available: {
          categories: Array<{
            name: string;
            count: TRefine<number, { minimum: 0 }>;
          }>;
          priceRanges: Array<{
            min: TRefine<number, { minimum: 0 }>;
            max: TRefine<number, { minimum: 0 }>;
            count: TRefine<number, { minimum: 0 }>;
          }>;
          ratings: Array<{
            rating: TRefine<number, { minimum: 1; maximum: 5 }>;
            count: TRefine<number, { minimum: 0 }>;
          }>;
        };
      };
      processingTime: TRefine<number, { minimum: 0 }>;
    }
  >(async () => {}),
]);
