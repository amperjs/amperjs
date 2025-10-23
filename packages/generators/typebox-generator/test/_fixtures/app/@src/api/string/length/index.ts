import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    minLength: TRefine<string, { minLength: 0 }>;
    maxLength: TRefine<string, { maxLength: 5 }>;
    mixLength: TRefine<string, { minLength: 0; maxLength: 5 }>;
  }>(async () => {}),
]);
