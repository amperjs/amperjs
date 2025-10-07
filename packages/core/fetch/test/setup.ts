import { Blob } from "node:buffer";

import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./_mocks";

// biome-ignore lint: any
(globalThis as any).Blob = Blob;

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
