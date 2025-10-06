import { join } from "node:path";

import { defaults } from "./defaults";

// Extract keys from defaults that end with "Dir" — e.g., "coreDir", "pagesLibDir", etc.
export type Dir =
  | keyof {
      [K in keyof typeof defaults as K extends `${string}Dir`
        ? K
        : never]: unknown;
    }
  | "@"; // shortcut for sourceFolder

export const pathResolver = ({
  appRoot,
  sourceFolder,
}: {
  appRoot?: string;
  sourceFolder: string;
}): {
  resolve: (dir: Dir, ...file: Array<string>) => string;
} => {
  return {
    resolve(dir, ...file) {
      let dirname: string;

      if (dir === "@") {
        dirname = sourceFolder;
      } else if (dir === "coreDir" || dir === "libDir") {
        dirname = defaults[dir];
      } else if (dir.endsWith("LibDir")) {
        // Lib directories (e.g., "pagesLibDir", "fetchLibDir") include both libDir and sourceFolder
        dirname = join(defaults.libDir, sourceFolder, defaults[dir]);
      } else {
        // All other dirs (e.g., "apiDir", "pagesDir" etc.) live under the sourceFolder
        dirname = join(sourceFolder, defaults[dir]);
      }

      return appRoot //
        ? join(appRoot, dirname, ...file)
        : join(dirname, ...file);
    },
  };
};
