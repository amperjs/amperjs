import { defineRoute } from "@amperjs/api";

type ApiInfo = {
  name: string;
  version: string;
  endpoints: string[];
  documentation: string;
};

type ApiQuery = {
  format?: "full" | "minimal";
  includeEndpoints?: boolean;
};

export default defineRoute<[]>(({ GET }) => [
  GET<ApiQuery, ApiInfo>(async (ctx) => {
    const { includeEndpoints } = ctx.payload;
    ctx.body = {
      name: "Test API",
      version: "1.0.0",
      endpoints: includeEndpoints
        ? ["/users", "/posts", "/search", "/analytics"]
        : [],
      documentation: "https://api.example.com/docs",
    };
  }),
]);
