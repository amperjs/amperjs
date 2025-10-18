import { defineRoute } from "@oreum/api";

type SimpleSearchResult = {
  id: number;
  title: string;
  type: string;
  score: number;
};

type SimpleSearchResponse = {
  query?: string;
  page: number;
  results: SimpleSearchResult[];
  total: number;
};

type SearchQuery = {
  q?: string;
  type?: "all" | "posts" | "users";
  boostRecent?: boolean;
};

export default defineRoute<
  ["posts" | "users" | "all", TRefine<number, { minimum: 1 }>]
>(({ GET }) => [
  GET<SearchQuery, SimpleSearchResponse>(async (ctx) => {
    const { q } = ctx.payload;
    ctx.body = {
      ...(q ? { query: q } : {}),
      page: Number(ctx.params.page) || 1,
      results: [
        {
          id: 1,
          title: "Sample Result",
          type: "document",
          score: 0.95,
        },
      ],
      total: 1,
    };
  }),
]);
