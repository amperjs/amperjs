import { defineRoute } from "@kappajs/api";

type UserPost = {
  id: number;
  title: string;
  content?: string;
  createdAt: TRefine<string, { format: "date-time" }>;
};

type UserPostsResponse = {
  userId: number;
  page: number;
  posts: UserPost[];
  total: number;
};

type UserPostsQuery = {
  status?: "published" | "draft" | "all";
  sort?: "newest" | "oldest";
  includeContent?: boolean;
};

export default defineRoute<
  [TRefine<number, { minimum: 1 }>, TRefine<number, { minimum: 1 }>]
>(({ GET }) => [
  GET<UserPostsQuery, UserPostsResponse>(async (ctx) => {
    ctx.body = {
      userId: Number(ctx.params.id),
      page: Number(ctx.params.page) || 1,
      posts: [
        {
          id: 1,
          title: "User's First Post",
          content: "This is the content of the user's post",
          createdAt: "2024-01-01T10:00:00Z",
        },
      ],
      total: 1,
    };
  }),
]);
