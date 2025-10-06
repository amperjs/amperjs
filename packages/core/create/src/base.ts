import { basename } from "node:path";

import fsx from "fs-extra";

export const copyFiles = async (
  src: string,
  dst: string,
  { exclude = [] }: { exclude?: Array<string | RegExp> } = {},
): Promise<void> => {
  const filter = exclude.length
    ? (path: string) => {
        return !exclude.some((e) => {
          return typeof e === "string" ? e === basename(path) : e.test(path);
        });
      }
    : undefined;

  await fsx.copy(src, dst, {
    filter,
  });
};
