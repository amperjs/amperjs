import type { IncomingMessage, ServerResponse } from "node:http";
import { join, resolve } from "node:path";

import { context, build as esbuild, type Plugin } from "esbuild";
import { green, red } from "kleur/colors";

import type { App } from "@amperjs/api";
import { defaults, type PluginOptionsResolved } from "@amperjs/devlib";

export default async (options: PluginOptionsResolved) => {
  const { appRoot, sourceFolder, baseurl, apiurl } = options;

  const apiDir = join(sourceFolder, defaults.apiDir);
  const outDir = join(options.outDir, defaults.apiDir);

  const esbuildConfig = await import(resolve(appRoot, "esbuild.json"), {
    with: { type: "json" },
  }).then((e) => e.default);

  let app: App;
  let devMiddlewareFactory: Function | undefined;
  let teardownHandler: Function | undefined;

  const plugins = esbuildConfig?.plugins //
    ? esbuildConfig.plugins
    : [];

  const build = async () => {
    await esbuild({
      ...esbuildConfig,
      bundle: true,
      entryPoints: [join(apiDir, "server.ts")],
      plugins,
      outfile: join(outDir, "index.js"),
    });
  };

  // could also use esbuild's watcher but we need controlled rebuild,
  // eg. rebuild only after all generators reacted on change
  // and all files generated accordingly.
  const watcher = async () => {
    const outfile = join(outDir, "dev.js");

    const rebuildPlugin: Plugin = {
      name: "rebuild",
      setup(build) {
        build.onEnd(async () => {
          if (app) {
            await teardownHandler?.(app);
          }
          try {
            const exports = await import([outfile, Date.now()].join("?"));
            devMiddlewareFactory = exports.devMiddlewareFactory;
            teardownHandler = exports.teardownHandler;
            app = await exports.default();
            console.debug(`${green("➜")} Api handler ready`);
          } catch (error) {
            console.error(`${red("✗")} Api handler rebuild failed`);
            console.error(error);
          }
        });
      },
    };

    const ctx = await context({
      ...esbuildConfig,
      logLevel: "error",
      bundle: true,
      entryPoints: [join(apiDir, "app.ts")],
      plugins: [...plugins, rebuildPlugin],
      outfile,
    });

    return {
      async start() {
        await ctx.watch({
          // waits this many milliseconds before rebuilding after a change is detected
          delay: options.watcher.delay,
        });
      },
      async stop() {
        await ctx.dispose();
      },
    };
  };

  const devMiddleware = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    if (devMiddlewareFactory) {
      const handler = devMiddlewareFactory(app);
      await handler(req, res, next);
    } else {
      !req?.url || !new RegExp(`${join(baseurl, apiurl)}($|/)`).test(req.url)
        ? next() // do not await here
        : await app?.callback()(req, res);
    }
  };

  return {
    build,
    watcher,
    devMiddleware,
  };
};
