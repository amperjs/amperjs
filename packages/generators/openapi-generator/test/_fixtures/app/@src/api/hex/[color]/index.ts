import { defineRoute } from "@oreum/api";

type ColorInfo = {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  name?: string;
};

type ColorQuery = {
  format?: "hex" | "rgb" | "hsl" | "all";
  includeName?: boolean;
};

export default defineRoute<[TRefine<string, { pattern: "^#[0-9A-Fa-f]{6}$" }>]>(
  ({ GET }) => [
    GET<ColorQuery, ColorInfo>(async (ctx) => {
      const { includeName } = ctx.payload;
      ctx.body = {
        hex: ctx.params.color,
        rgb: { r: 255, g: 255, b: 255 },
        hsl: { h: 0, s: 0, l: 100 },
        ...(includeName ? { name: "White" } : {}),
      };
    }),
  ],
);
