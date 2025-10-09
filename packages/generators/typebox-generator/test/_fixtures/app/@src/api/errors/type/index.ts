import { defineRoute } from "@oreum/api";

export default defineRoute(({ POST }) => [
  POST<{
    // Should be string, not number
    stringType: string;
    // Should be number, not string
    numberType: number;
    // Should be boolean, not string
    booleanType: boolean;
    // Should be array, not object
    arrayType: Array<unknown>;
    // Should be object, not array
    objectType: Record<string, unknown>;
  }>(async () => {}),
]);
