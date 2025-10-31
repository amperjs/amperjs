import { defineRoute } from "@kappajs/api";

type SearchPayload = {
  query: TRefine<string, { minLength: 1; maxLength: 100 }>;
  filters?: {
    category?: "tech" | "science" | "arts";
    dateRange?: {
      from: TRefine<string, { format: "date" }>;
      to: TRefine<string, { format: "date" }>;
    };
    tags?: TRefine<string[], { maxItems: 5 }>;
  };
  pagination?: {
    page?: TRefine<number, { minimum: 1 }>;
    limit?: TRefine<number, { minimum: 1; maximum: 100 }>;
  };
};

type SearchResult = {
  id: number;
  title: string;
  type: "post" | "user" | "comment";
  relevance: number;
  excerpt?: string;
};

type SearchResponse = {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export default defineRoute<["posts" | "users" | "all"]>(({ POST }) => [
  POST<
    /** @skip-validation */
    SearchPayload,
    SearchResponse
  >(async (ctx) => {
    const { pagination } = ctx.payload;
    ctx.body = {
      results: [],
      total: 0,
      page: pagination?.page || 1,
      limit: pagination?.limit || 20,
      hasMore: false,
    };
  }),
]);
