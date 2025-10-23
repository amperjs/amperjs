import { defineRoute } from "@amperjs/api";

type CreatePostPayload = {
  title: TRefine<string, { minLength: 1; maxLength: 255 }>;
  content: string;
  tags: TRefine<string[], { maxItems: 10 }>;
  isPublished: boolean;
  scheduledPublishAt?: TRefine<string, { format: "date-time" }>;
};

type PostResponse = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  authorId: number;
  createdAt: TRefine<string, { format: "date-time" }>;
  publishedAt?: TRefine<string, { format: "date-time" }>;
};

type PostsListResponse = {
  posts: PostResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

type PostsQuery = {
  page?: TRefine<number, { minimum: 1 }>;
  limit?: TRefine<number, { minimum: 1; maximum: 100 }>;
  sort?: "newest" | "oldest" | "popular";
  tags?: string[];
  authorId?: number;
};

export default defineRoute(({ GET, POST }) => [
  GET<PostsQuery, PostsListResponse>(async (ctx) => {
    const { page, limit } = ctx.payload;
    ctx.body = {
      posts: [],
      pagination: {
        page: page || 1,
        limit: limit || 20,
        total: 0,
        hasMore: false,
      },
    };
  }),

  POST<CreatePostPayload, PostResponse>(async (ctx) => {
    const { title, content, tags, isPublished } = ctx.payload;
    ctx.body = {
      id: 1,
      title,
      content,
      tags,
      isPublished,
      authorId: 123,
      createdAt: new Date().toISOString(),
      ...(isPublished ? { publishedAt: new Date().toISOString() } : {}),
    };
  }),
]);
