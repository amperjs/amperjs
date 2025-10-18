import { defineRoute } from "@oreum/api";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type OrderResponse = {
  status: string;
  date?: string;
  orders: Array<{
    id: number;
    items: OrderItem[];
    total: number;
    customer?: string;
  }>;
};

type OrderQuery = {
  includeItems?: boolean;
  includeCustomer?: boolean;
  limit?: TRefine<number, { minimum: 1; maximum: 100 }>;
};

export default defineRoute<
  [
    "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    TRefine<string, { pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" }>,
  ]
>(({ GET, POST }) => [
  GET<OrderQuery, OrderResponse>(async (ctx) => {
    const { includeItems, includeCustomer } = ctx.payload;
    ctx.body = {
      status: ctx.params.status,
      date: ctx.params.date,
      orders: [
        {
          id: 123,
          items: includeItems
            ? [
                { id: 1, name: "Product A", quantity: 2, price: 25 },
                { id: 2, name: "Product B", quantity: 1, price: 50 },
              ]
            : [],
          total: 100,
          ...(includeCustomer ? { customer: "John Doe" } : {}),
        },
      ],
    };
  }),

  POST<
    { items: Array<{ id: number; quantity: number }> },
    { orderId: number; status: string; total: number }
  >(async (ctx) => {
    const { items } = ctx.payload;
    ctx.body = {
      orderId: 12345,
      status: ctx.params.status,
      total: items.reduce((sum, item) => sum + item.quantity * 10, 0),
    };
  }),
]);
