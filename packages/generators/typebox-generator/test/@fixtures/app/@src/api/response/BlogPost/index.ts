import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      id: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      title: TRefine<string, { minLength: 1; maxLength: 200 }>;
      content: string;
      excerpt: string;
      author: {
        id: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
        name: string;
        avatar?: string;
      };
      tags: string[];
      category: TRefine<string, { minLength: 1; maxLength: 50 }>;
      status: "draft" | "published" | "scheduled";
      publishedAt?: Date; // Date instance (from ORM)
      createdAt: string; // String (from DB)
      updatedAt: string; // String (from DB)
      readTime: TRefine<number, { minimum: 1; maximum: 480 }>; // 8 hours max
      viewCount: TRefine<number, { minimum: 0 }>;
    }
  >(async () => {}),
]);
