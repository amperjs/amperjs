import { defineRoute } from "@kappajs/api";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
};

type ProductsResponse = {
  category: string;
  sort: string;
  products: Product[];
  total: number;
};

type ProductsQuery = {
  minPrice?: number;
  maxPrice?: number;
  minRating?: TRefine<number, { minimum: 1; maximum: 5 }>;
  inStock?: boolean;
};

export default defineRoute<
  [
    "electronics" | "clothing" | "books" | "home",
    "price" | "rating" | "name" | "date",
  ]
>(({ GET }) => [
  GET<ProductsQuery, ProductsResponse>(async (ctx) => {
    ctx.body = {
      category: ctx.params.category,
      sort: ctx.params.sort || "name",
      products: [
        {
          id: 1,
          name: "Sample Product",
          price: 99.99,
          category: ctx.params.category,
          rating: 4.5,
        },
      ],
      total: 1,
    };
  }),
]);
