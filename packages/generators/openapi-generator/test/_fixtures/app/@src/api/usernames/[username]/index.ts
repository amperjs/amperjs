import { defineRoute } from "@amperjs/api";

type UserProfile = {
  username: string;
  displayName: string;
  joinedAt: TRefine<string, { format: "date-time" }>;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
};

type ProfileQuery = {
  includeStats?: boolean;
  includeRecent?: boolean;
  includeBadges?: boolean;
};

export default defineRoute<
  [
    TRefine<
      string,
      { pattern: "^[a-zA-Z0-9_]{3,20}$"; minLength: 3; maxLength: 20 }
    >,
  ]
>(({ GET }) => [
  GET<ProfileQuery, UserProfile>(async (ctx) => {
    const { includeStats } = ctx.payload;
    ctx.body = {
      username: ctx.params.username,
      displayName: "User Display Name",
      joinedAt: "2024-01-01T00:00:00Z",
      ...(includeStats
        ? {
            stats: {
              posts: 42,
              followers: 123,
              following: 87,
            },
          }
        : {}),
    };
  }),
]);
