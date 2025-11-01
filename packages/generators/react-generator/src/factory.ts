import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { styleText } from "node:util";

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
} from "@kappajs/devlib";

import type { Options } from "./types";

import libPagesTpl from "./templates/lib/pages.hbs";
import libReactIndexTpl from "./templates/lib/react/index.hbs";
import libReactRouterTpl from "./templates/lib/react/router.hbs";
import stylesTpl from "./templates/lib/react/styles.css?as=text";
import paramTpl from "./templates/param.hbs";
import publicAppTpl from "./templates/public/App.hbs";
import publicComponentsLinkTpl from "./templates/public/components/Link.hbs";
import publicIndexTpl from "./templates/public/index.hbs";
import publicIndexHtml from "./templates/public/index.html?as=text";
import publicPageTpl from "./templates/public/page.hbs";
import publicRouterTpl from "./templates/public/router.hbs";
import welcomePageTpl from "./templates/public/welcome-page.hbs";

function randomCongratMessage(): string {
  const messages = [
    "🎉 Well done! You just created a new React route.",
    "🚀 Success! A fresh React route is ready to roll.",
    "🌟 Nice work! Another React route added to your app.",
    "⚡ Quick and easy! Your new React route is good to go.",
    "🥳 Congrats! Your app just leveled up with a new React route.",
    "🧩 All set! A new React route has been scaffolded.",
    "🔧 Scaffold complete! Your new React route is in place.",
    "✨ Fantastic! Your new React route is ready.",
    "🎯 Nailed it! A brand new React route just landed.",
    "💫 Awesome! Another React route joins the lineup.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

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
    throw new Error("ReactGenerator: missing tsconfig.json* file");
  }

  const compilerOptions = await import(tsconfigFile, {
    with: { type: "json" },
  }).then((e) => e.default.compilerOptions);

  if (!["react-jsx", "react-jsxdev"].includes(compilerOptions?.jsx)) {
    console.error();
    console.error(
      styleText("red", "✗ ReactGenerator: tsconfig issue detected"),
    );
    console.error(
      [
        `» It is highly recommended to add the following lines\n`,
        `to your ${styleText("blue", basename(tsconfigFile))}, `,
        `inside the ${styleText("magenta", "compilerOptions")} section:`,
      ].join(""),
    );
    console.error(styleText("gray", `"compilerOptions": {`));
    console.error(styleText("cyan", `  "jsx": "react-jsx",`));
    console.error(styleText("gray", "}"));
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

  await mkdir(resolve("libDir", sourceFolder, "{react}"), { recursive: true });

  await writeFile(
    resolve("libDir", sourceFolder, "{react}/styles.module.css"),
    stylesTpl,
    "utf8",
  );

  for (const [file, template] of [
    ["components/Link.tsx", publicComponentsLinkTpl],
    ["App.tsx", publicAppTpl],
    ["router.tsx", publicRouterTpl],
    ["index.tsx", publicIndexTpl],
    ["index.html", publicIndexHtml],
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
          router: join(sourceFolder, "{react}/router"),
        },
      },
      {
        // write only to blank files
        overwrite: (fileContent) => !fileContent?.trim().length,
        formatters,
      },
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
        route.name === "index"
          ? welcomePageTpl
          : customTemplate?.[1] || publicPageTpl,
        {
          defaults,
          route,
          message: randomCongratMessage(),
          importPathmap: {
            styles: join(sourceFolder, "{react}/styles.module.css"),
          },
        },
        {
          // write only to blank files
          overwrite: (fileContent) => !fileContent?.trim().length,
          formatters,
        },
      );
    }
  };

  const staticSegments = (pathTokens: Array<PathToken>) => {
    return pathTokens.reduce((a, e) => a + (e.param ? 0 : 1), 0);
  };

  const generateIndexFiles = async (entries: Array<RouteResolverEntry>) => {
    const routes = entries
      .flatMap(({ kind, route }) => {
        return kind === "page"
          ? [
              {
                ...route,
                path: join("/", pathFactory(route.pathTokens)),
                paramsLiteral: route.params.schema
                  .map((param) => render(paramTpl, { param }).trim())
                  .join(", "),
                meta: metaResolver(route),
                importPathmap: {
                  page: join(sourceFolder, defaults.pagesDir, route.importPath),
                },
              },
            ]
          : [];
      })
      .sort((a, b) => {
        /**
         * Sort routes so that more specific (static) paths come before dynamic ones.
         *
         * This is important because dynamic segments
         * (e.g., `:id` or `*catchall`) are more general,
         * and can match values that should be routed to more specific static paths.
         *
         * For example, given:
         *   - `/users/account`
         *   - `/users/:id`
         * If `/users/:id` comes first, visiting `/users/account` would incorrectly match it,
         * treating "account" as an `id`. So static routes must take precedence.
         *
         * Estimating specificity by counting static segments – i.e., those that don't start
         * with `:` or `*`. The route with more static segments is considered more specific.
         * */
        const aStaticSegments = staticSegments(a.pathTokens);
        const bStaticSegments = staticSegments(b.pathTokens);
        return aStaticSegments === bStaticSegments
          ? a.path.localeCompare(b.path)
          : bStaticSegments - aStaticSegments;
      });

    const context = {
      routes,
      importPathmap: {
        config: join(sourceFolder, defaults.configDir),
        fetch: join(sourceFolder, defaults.fetchLibDir),
      },
    };

    for (const [file, template] of [
      ["{react}/index.ts", libReactIndexTpl],
      ["{react}/router.ts", libReactRouterTpl],
      [`${defaults.pagesLibDir}.ts`, libPagesTpl],
    ]) {
      await renderToFile(
        resolve("libDir", sourceFolder, file),
        template,
        context,
        { formatters },
      );
    }
  };

  return {
    async watchHandler(entries, event) {
      // Fill empty route files with templates (default or custom)
      // - Initial call (event is undefined): process all routes
      // - Create event: process newly added route
      if (!event || event.kind === "create") {
        await generatePublicFiles(entries);
      }

      // Always regenerate index files to keep router in sync
      await generateIndexFiles(entries);
    },
  };
};

export const pathFactory = (pathTokens: Array<PathToken>) => {
  return pathTokens
    .flatMap(({ path, param }) => {
      if (param?.isRest) {
        // React Router v7 uses the unnamed splat syntax * for catch-all routes
        return ["*"];
      }
      if (param?.isOptional) {
        return [`:${param.name}?`];
      }
      if (param) {
        return [`:${param.name}`];
      }
      return path === "/" ? [] : [path];
    })
    .join("/")
    .replace(/\+/g, "\\\\+");
};
