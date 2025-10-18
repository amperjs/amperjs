import { defineRoute } from "@oreum/api";

type DataItem = {
  id: number;
  name: string;
  value: number;
  category: string;
};

type DataResponse = {
  data: DataItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

type DataQuery = {
  category?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: "name" | "value" | "id";
  sortOrder?: "asc" | "desc";
};

export default defineRoute<
  [
    TRefine<number, { minimum: 1; maximum: 1000 }>,
    TRefine<number, { minimum: 1; maximum: 100; multipleOf: 1 }>,
  ]
>(({ GET }) => [
  GET<DataQuery, DataResponse>(async (ctx) => {
    const page = Number(ctx.params.page) || 1;
    const limit = Number(ctx.params.limit) || 20;
    ctx.body = {
      data: [
        { id: 1, name: "Item 1", value: 100, category: "A" },
        { id: 2, name: "Item 2", value: 200, category: "B" },
      ],
      pagination: {
        page,
        limit,
        total: 2,
        hasMore: false,
      },
    };
  }),
]);
