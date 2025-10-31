import { defineRoute } from "@kappajs/api";

export default defineRoute(({ POST }) => [
  POST<{
    // String length constraints
    minLength: TRefine<string, { minLength: 5 }>;
    maxLength: TRefine<string, { maxLength: 10 }>;
    minMaxLength: TRefine<string, { minLength: 3; maxLength: 20 }>;

    // String pattern
    alphanumeric: TRefine<string, { pattern: "^[a-zA-Z0-9]+$" }>;
    hexColor: TRefine<
      string,
      { pattern: "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" }
    >;

    // String formats
    email: TRefine<string, { format: "email" }>;
    date: TRefine<string, { format: "date" }>;
    dateTime: TRefine<string, { format: "date-time" }>;
    time: TRefine<string, { format: "time" }>;
    uri: TRefine<string, { format: "uri" }>;
    url: TRefine<string, { format: "url" }>;
    uuid: TRefine<string, { format: "uuid" }>;
    ipv4: TRefine<string, { format: "ipv4" }>;
    ipv6: TRefine<string, { format: "ipv6" }>;
    hostname: TRefine<string, { format: "hostname" }>;
  }>(async () => {}),
]);
