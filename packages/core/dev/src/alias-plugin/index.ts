import { glob } from "tinyglobby";
import ts from "typescript";
import type { Alias, Plugin } from "vite";

export default (
  appRoot: string,
  opt?: {
    ignore?: Array<string>;
  },
): Plugin => {
  const tsconfig = ts.getParsedCommandLineOfConfigFile(
    `${appRoot}/tsconfig.json`,
    undefined,
    ts.sys as never,
  );

  return {
    name: "@oreum:aliasPlugin",

    config() {
      const aliasmap: Array<Alias> = [];

      const pathEntries = Object.entries({ ...tsconfig?.options?.paths });

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

              const patterns = paths.flatMap((e) => [
                `${e}/${src}.*`,
                `${e}/${src}/index.*`,
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
