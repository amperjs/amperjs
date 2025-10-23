import { defineRoute } from "@amperjs/api";

type StaticResponse = {
  message: string;
  level: number;
  data: {
    items: string[];
    count: number;
  };
};

type StaticQuery = {
  format?: "full" | "minimal";
  includeMetadata?: boolean;
};

export default defineRoute<[]>(({ GET }) => [
  GET<StaticQuery, StaticResponse>(async (ctx) => {
    ctx.body = {
      message: "Nested static route",
      level: 2,
      data: {
        items: ["item1", "item2", "item3"],
        count: 3,
      },
    };
  }),
]);
