import { chmod, unlink } from "node:fs/promises";
import { parseArgs } from "node:util";

import type { App } from "@oreum/api";

const {
  values: { port, sock },
} = parseArgs({
  options: {
    port: {
      type: "string",
      short: "p",
    },
    sock: {
      type: "string",
      short: "s",
    },
  },
});

if (![port, sock].some((e) => e)) {
  console.error("Please provide either -p/--port number or -s/--sock path");
  process.exit(1);
}

console.log("\n  ➜ Starting Server", { port, sock });

if (sock) {
  await unlink(sock).catch((error) => {
    if (error.code === "ENOENT") {
      return;
    }
    console.error(error.message);
    process.exit(1);
  });
}

export default async <T extends App = App>(
  createApp: () => T | Promise<T>,
): Promise<import("node:http").Server> => {
  const app = await createApp();
  // app.listen is returning the actual server
  return app.listen(port || sock, async () => {
    if (sock) {
      await chmod(sock, 0o777);
    }
    console.log("\n  ➜ Server Started ✨\n");
  });
};
