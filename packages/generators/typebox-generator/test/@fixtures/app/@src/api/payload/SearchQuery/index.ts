import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    query: TRefine<string, { minLength: 1; maxLength: 100 }>;
    filters: {
      category?: string[];
      priceRange?: {
        min?: TRefine<number, { minimum: 0 }>;
        max?: number;
      };
      rating?: TRefine<number, { minimum: 1; maximum: 5 }>;
      inStock?: boolean;
      attributes?: Record<string, string | number>;
    };
    pagination: {
      page: TRefine<number, { minimum: 1 }>;
      limit: TRefine<number, { minimum: 1; maximum: 100 }>;
      sortBy: "relevance" | "price" | "rating" | "newest";
      sortOrder: "asc" | "desc";
    };
  }>(async () => {}),
]);
