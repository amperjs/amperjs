import { defineRoute } from "@oreum/api";

type StoreReview = {
  id: number;
  productId: number;
  storeId: number;
  rating: number;
  comment: string;
  reviewer: {
    id: number;
    name: string;
  };
  createdAt: TRefine<string, { format: "date-time" }>;
};

type StoreReviewsResponse = {
  storeId: number;
  productId: number;
  page: number;
  reviews: StoreReview[];
  averageRating: number;
  pagination: {
    total: number;
    hasMore: boolean;
  };
};

type StoreReviewsQuery = {
  minRating?: TRefine<number, { minimum: 1; maximum: 5 }>;
  verifiedOnly?: boolean;
  includeReplies?: boolean;
};

export default defineRoute<
  [
    TRefine<number, { minimum: 1 }>,
    TRefine<number, { minimum: 1 }>,
    TRefine<number, { minimum: 1 }>,
  ]
>(({ GET }) => [
  GET<StoreReviewsQuery, StoreReviewsResponse>(async (ctx) => {
    ctx.body = {
      storeId: Number(ctx.params.storeId),
      productId: Number(ctx.params.productId),
      page: Number(ctx.params.page) || 1,
      reviews: [
        {
          id: 1,
          productId: Number(ctx.params.productId),
          storeId: Number(ctx.params.storeId),
          rating: 5,
          comment: "Great product!",
          reviewer: { id: 123, name: "Happy Customer" },
          createdAt: "2024-01-01T12:00:00Z",
        },
      ],
      averageRating: 5,
      pagination: {
        total: 1,
        hasMore: false,
      },
    };
  }),
]);
