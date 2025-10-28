import { glob } from "tinyglobby";
import type { Alias, Plugin } from "vite";

export default (
  appRoot: string,
  opt?: {
    ignore?: Array<string>;
  },
): Plugin => {
  return {
    name: "@amperjs:aliasPlugin",

    async config() {
      const compilerOptions: {
        paths: Record<string, Array<string>>;
      } = await import(`${appRoot}/tsconfig.json`, {
        with: { type: "json" },
      }).then((e) => e.default.compilerOptions);

      const aliasmap: Array<Alias> = [];

      const pathEntries = Object.entries({ ...compilerOptions?.paths });

      for (const [aliasPattern, pathPatterns] of pathEntries) {
        const alias = aliasPattern.replace("/*", "");

        const paths = pathPatterns
          .map((e) => e.replace("/*", ""))
          .sort((a, b) => a.split(/\/+/).length - b.split(/\/+/).length);

        if (paths.length === 1) {
          aliasmap.push({
            find: new RegExp(`^${alias}/`),
            replacement: `${appRoot}/${paths[0]}/`,
          });
        } else if (paths.length > 1) {
          aliasmap.push({
            find: new RegExp(`^${alias}/`),
            replacement: "",
            async customResolver(_src) {
              // escaping symbols that may break glob pattern matching
              const src = _src.replace(/(\$|\^|\+|\(|\)|\[|\])/g, "\\$1");

              // Build a list of possible file resolution patterns for a given source path.
              // Covers explicit extensions, implicit extensions, and folder-based index files.
              const patterns = paths.flatMap((path) => [
                // Case 1: Extension is explicitly provided
                // e.g. import styles from "@admin/{solid}/styles.module.css"
                `${path}/${src}*`,

                // Case 2: No extension provided
                // Match any extension and return the first match
                `${path}/${src}.*`,

                // Case 3: Folder containing an index file of any extension
                `${path}/${src}/index.*`,
              ]);

              const [file] = await glob(patterns, {
                cwd: appRoot,
                onlyFiles: true,
                absolute: true,
                dot: true,
                followSymbolicLinks: false,
                braceExpansion: false,
                globstar: false,
                ignore: opt?.ignore || [
                  "**/.git/**",
                  "**/node_modules/**",
                  "**/public/**",
                  "**/var/**",
                ],
              });

              return file;
            },
          });
        }
      }

      return {
        resolve: {
          alias: aliasmap,
        },
      };
    },
  };
};
