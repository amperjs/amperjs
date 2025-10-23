import { defineRoute } from "@amperjs/api";

type CreateReviewPayload = {
  rating: TRefine<number, { minimum: 1; maximum: 5 }>;
  title: TRefine<string, { maxLength: 100 }>;
  comment: TRefine<string, { maxLength: 1000 }>;
  isAnonymous?: boolean;
};

type ReviewResponse = {
  id: number;
  rating: number;
  title?: string;
  comment: string;
  author: {
    id: number;
    name: string;
  };
  createdAt: TRefine<string, { format: "date-time" }>;
};

type ReviewsResponse = {
  reviews: ReviewResponse[];
  averageRating: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

type ReviewsQuery = {
  sort?: "newest" | "oldest" | "highest" | "lowest";
  minRating?: TRefine<number, { minimum: 1; maximum: 5 }>;
  verifiedOnly?: boolean;
};

export default defineRoute<
  [TRefine<number, { minimum: 1 }>, TRefine<number, { minimum: 1 }>]
>(({ GET, POST }) => [
  GET<
    ReviewsQuery,
    /** @skip-validation */
    ReviewsResponse
  >(async (ctx) => {
    const page = Number(ctx.params.page) || 1;
    ctx.body = {
      reviews: [],
      averageRating: 4.5,
      pagination: {
        page,
        limit: 10,
        total: 0,
        hasMore: false,
      },
    };
  }),

  POST<CreateReviewPayload, ReviewResponse>(async (ctx) => {
    const { rating, title, comment, isAnonymous } = ctx.payload;
    ctx.body = {
      id: 1,
      rating,
      title,
      comment,
      author: {
        id: isAnonymous ? 0 : 123,
        name: isAnonymous ? "Anonymous" : "John Doe",
      },
      createdAt: new Date().toISOString(),
    };
  }),
]);
