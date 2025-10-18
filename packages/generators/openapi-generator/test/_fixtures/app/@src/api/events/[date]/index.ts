import { defineRoute } from "@oreum/api";

type EventT = {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
};

type EventsResponse = {
  date: string;
  events: EventT[];
};

type EventsQuery = {
  category?: "conference" | "meetup" | "workshop";
  location?: string;
  limit?: TRefine<number, { minimum: 1; maximum: 100 }>;
};

export default defineRoute<[TRefine<string, { format: "date" }>]>(({ GET }) => [
  GET<EventsQuery, EventsResponse>(async (ctx) => {
    ctx.body = {
      date: ctx.params.date,
      events: [
        {
          id: 1,
          title: "Sample Event",
          date: ctx.params.date,
          location: "Conference Room",
          description: "This is a sample event",
        },
      ],
    };
  }),
]);
