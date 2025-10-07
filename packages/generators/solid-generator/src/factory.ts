import { basename, join } from "node:path";

import { blue, cyan, grey, red } from "kleur/colors";
import picomatch, { type Matcher } from "picomatch";
import { glob } from "tinyglobby";

import {
  defaults,
  type GeneratorFactory,
  type PageRoute,
  type PathToken,
  pathResolver,
  type RouteResolverEntry,
  render,
  renderToFile,
} from "@oreum/devlib";

import type { Options } from "./types";

import libFetchUnwrapTpl from "./templates/lib/fetch/unwrap.hbs";
import libPagesTpl from "./templates/lib/pages.hbs";
import libSolidIndexTpl from "./templates/lib/solid/index.hbs";
import libSolidRouterTpl from "./templates/lib/solid/router.hbs";
import paramTpl from "./templates/param.hbs";
import publicAppTpl from "./templates/public/App.hbs";
import publicComponentsLinkTpl from "./templates/public/components/Link.hbs";
import publicIndexTpl from "./templates/public/index.hbs";
import publicPageTpl from "./templates/public/page.hbs";
import publicRouterTpl from "./templates/public/router.hbs";

export const factory: GeneratorFactory<Options> = async (
  { appRoot, sourceFolder, formatters },
  { templates, meta },
) => {
  const [tsconfigFile] = await glob("tsconfig.json*", {
    cwd: appRoot,
    onlyFiles: true,
    absolute: true,
  });

  if (!tsconfigFile) {
    throw new Error("SolidGenerator: missing tsconfig.json* file");
  }

  const tsconfig = await import(tsconfigFile, {
    with: { type: "json" },
  }).then((e) => e.default);

  if (tsconfig?.compilerOptions?.jsxImportSource !== "solid-js") {
    console.error();
    console.error(red("✗ SolidGenerator: tsconfig issue detected"));
    console.error(
      [
        `It is highly recommended to add the following lines`,
        `to your ${blue(basename(tsconfigFile))},`,
        `inside the ${red("compilerOptions")} section:`,
      ].join(" "),
    );
    console.error(grey(`"compilerOptions": {`));
    console.error(cyan(`  "jsxImportSource": "solid-js",`));
    console.error(cyan(`  "jsx": "preserve",`));
    console.error(grey("}"));
    console.error();
  }

  const customTemplates: Array<[Matcher, string]> = Object.entries(
    templates || {},
  ).map(([pattern, template]) => [picomatch(pattern), template]);

  const metaMatchers: Array<[Matcher, unknown]> = Object.entries(
    meta || {},
  ).map(([pattern, meta]) => [picomatch(pattern), meta]);

  const metaResolver = ({ name }: PageRoute) => {
    const match = metaMatchers.find(([isMatch]) => isMatch(name));
    return Object.prototype.toString.call(match?.[1]) === "[object Object]"
      ? JSON.stringify(match?.[1])
      : undefined;
  };

  const { resolve } = pathResolver({ appRoot, sourceFolder });

  await renderToFile(
    resolve("fetchLibDir", "unwrap.ts"),
    libFetchUnwrapTpl,
    {},
    { formatters },
  );

  for (const [file, template] of [
    ["components/Link.tsx", publicComponentsLinkTpl],
    ["App.tsx", publicAppTpl],
    ["index.tsx", publicIndexTpl],
    ["router.tsx", publicRouterTpl],
  ]) {
    await renderToFile(
      resolve("@", file),
      template,
      {
        defaults,
        sourceFolder,
        importPathmap: {
          config: join(sourceFolder, defaults.configDir),
          pageMap: join(sourceFolder, defaults.pagesLibDir),
          fetch: join(sourceFolder, defaults.fetchLibDir),
          router: join(sourceFolder, "{solid}/router"),
        },
      },
      { overwrite: false, formatters },
    );
  }

  const generatePublicFiles = async (entries: Array<RouteResolverEntry>) => {
    for (const { kind, route } of entries) {
      if (kind !== "page") {
        continue;
      }

      const customTemplate = customTemplates.find(([isMatch]) => {
        return isMatch(route.name);
      });

      await renderToFile(
        resolve("pagesDir", route.file),
        customTemplate?.[1] || publicPageTpl,
        { route },
        {
          // write only to blank files
          overwrite: (content) => content?.trim().length === 0,
          formatters,
        },
      );
    }
  };
};
