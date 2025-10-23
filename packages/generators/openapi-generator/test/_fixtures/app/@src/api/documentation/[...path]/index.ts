import { defineRoute } from "@amperjs/api";

type DocumentationResponse = {
  path: string[];
  content: string;
  title: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
};

type DocumentationQuery = {
  version?: "v1" | "v2" | "latest";
  format?: "html" | "markdown" | "raw";
  includeExamples?: boolean;
};

export default defineRoute<[TRefine<string[], { minItems: 1; maxItems: 10 }>]>(
  ({ GET }) => [
    GET<DocumentationQuery, DocumentationResponse>(async (ctx) => {
      ctx.body = {
        path: ctx.params.path.split("/"),
        content: "Documentation content here",
        title: "API Documentation",
        sections: [
          { title: "Introduction", content: "Welcome to the API" },
          { title: "Authentication", content: "How to authenticate" },
        ],
      };
    }),
  ],
);
