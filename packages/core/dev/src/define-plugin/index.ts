import { parse as dotenv } from "dotenv";
import fsx from "fs-extra";
import type { Plugin } from "vite";

type Entry = {
  keys: Array<string>;
  file?: string;
  defineOn?: string;
  use?: (key: string, val: string | undefined) => void;
};

export default (entries: Array<Entry>): Plugin => {
  return {
    name: "@amperjs:definePlugin",

    async config() {
      const define: Record<string, unknown> = {};

      for (const { keys, file, defineOn = "process.env", use } of entries) {
        define[defineOn] = {};

        const env =
          file && (await fsx.pathExists(file))
            ? dotenv(await fsx.readFile(file, "utf8"))
            : process.env;

        for (const [key, val] of Object.entries(env)) {
          if (keys.includes(key)) {
            // only explicitly given keys available on client
            define[`${defineOn}.${key}`] = JSON.stringify(val);
          }
          use?.(key, val);
        }
      }

      return { define };
    },
  };
};
