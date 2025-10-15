import { basename, join, resolve } from "node:path";
import { Worker } from "node:worker_threads";

import { red } from "kleur/colors";
import type { Plugin, ResolvedConfig } from "vite";

import {
  type GeneratorConstructor,
  type PluginOptions,
  type PluginOptionsResolved,
  type RouteResolverEntry,
  type SpinnerFactory,
  spinnerFactory,
  withSpinner,
} from "@oreum/devlib";

import apiGenerator from "@oreum/api-generator";
import stubGenerator from "@oreum/dev/stub-generator";
import fetchGenerator from "@oreum/fetch-generator";

import apiHandlerFactory from "./api-handler";
import routesFactory from "./routes";
import type { WorkerData, WorkerError, WorkerSpinner } from "./worker";

export default (apiurl: string, pluginOptions?: PluginOptions): Plugin => {
  const outDirSuffix = "client";

  let config: ResolvedConfig;
  let resolvedOptions: PluginOptionsResolved;

  const createWorker = () => {
    // Destructuring to separate common options from function-based ones.
    // Functions (e.g. generators, formatters) can't be passed to worker threads.
    const {
      generators = [],
      formatters = [],
      ...restOptions
    } = resolvedOptions;

    const generatorModules: WorkerData["generatorModules"] = generators.map(
      (e) => [e.moduleImport, e.moduleConfig],
    );

    const formatterModules: WorkerData["formatterModules"] =
      pluginOptions?.formatters
        ? pluginOptions.formatters.map((e) => [e.moduleImport, e.moduleConfig])
        : [];

    const workerData: WorkerData = {
      ...restOptions,
      generatorModules,
      formatterModules,
    };

    return new Worker(resolve(import.meta.dirname, "base-plugin/worker.js"), {
      workerData,
    });
  };

  const workerHandler = (
    onReady?: () => Promise<void>,
    onExit?: () => Promise<void>,
  ) => {
    const worker = createWorker();

    const spinnerMap = new Map<string, SpinnerFactory>();

    worker.on("error", async (error) => {
      console.error(error);
    });

    worker.on("exit", async () => {
      await onExit?.();
      // TODO: revive worker only if it exited due to an error.
      // Note: worker.terminate() triggers an exit with code 1,
      // so it's not always possible to distinguish normal termination from a crash.
    });

    worker.on(
      "message",
      async (msg: { spinner?: WorkerSpinner; error?: WorkerError }) => {
        if (msg?.spinner) {
          const { id, startText, method, text } = msg.spinner;
          withSpinner(
            startText,
            (spinner) => {
              spinnerMap.set(id, spinner);
              spinner[method](text || "");
              if (method === "succeed" || method === "failed") {
                spinnerMap.delete(id);
              }
            },
            spinnerMap.get(id),
          );
        } else if (msg?.error) {
          const { error } = msg;
          if (error.stack) {
            const [message, ...stack] = error.stack.split("\n");
            console.error(red(message));
            console.error(stack.join("\n"));
          } else if (error?.message) {
            console.error(`${red(error?.name)}: ${error.message}`);
          } else {
            console.error(error);
          }
        }
      },
    );

    const readyHandler = async (msg: string) => {
      if (msg === "ready") {
        worker.off("message", readyHandler);
        await onReady?.();
      }
    };

    worker.on("message", readyHandler);

    return async () => {
      await worker.terminate();
    };
  };

  return {
    name: "@oreum:basePlugin",

    config(config) {
      if (!config.build?.outDir) {
        throw new Error("Incomplete config, missing build.outDir");
      }
      return {
        build: {
          outDir: join(config.build.outDir, outDirSuffix),
        },
      };
    },

    async configResolved(_config) {
      config = _config;

      const appRoot = resolve(config.root, "..");
      const sourceFolder = basename(config.root);

      // removing outDirSuffix
      const outDir = resolve(appRoot, resolve(config.build.outDir, ".."));

      const { stabilityThreshold = 1000 } =
        typeof config.server.watch?.awaitWriteFinish === "object"
          ? config.server.watch.awaitWriteFinish
          : {};

      const watcher: PluginOptionsResolved["watcher"] = {
        delay: stabilityThreshold,
        ...(config.server.watch ? { options: config.server.watch } : {}),
      };

      {
        const {
          generators = [],
          formatters = [],
          refineTypeName = "TRefine",
        } = { ...pluginOptions };

        const _apiGenerator = generators.find((e) => e.kind === "api");
        const _fetchGenerator = generators.find((e) => e.kind === "fetch");
        resolvedOptions = {
          ...pluginOptions,
          watcher,
          generators: [
            // 1. stub generator should run first
            stubGenerator(),
            // 2. then api generator
            _apiGenerator || (apiGenerator() as GeneratorConstructor),
            // 3. then fetch generator
            _fetchGenerator || (fetchGenerator() as GeneratorConstructor),
            // 4. finally rest generators in the order they were added
            ...generators.filter((e) => !e.kind),
          ],
          formatters: formatters.map((e) => e.formatter),
          refineTypeName,
          baseurl: config.base,
          apiurl,
          appRoot,
          sourceFolder,
          outDir,
        };
      }

      if (config.command === "build") {
        const { resolvers } = await routesFactory(resolvedOptions);
        const resolvedRoutes: RouteResolverEntry[] = [];

        {
          const spinner = spinnerFactory("Resolving Routes");

          for (const { name, handler } of resolvers.values()) {
            spinner.append(
              `[ ${resolvedRoutes.length + 1} of ${resolvers.size} ] ${name}`,
            );
            resolvedRoutes.push(await handler());
          }

          spinner.succeed();
        }

        {
          const spinner = spinnerFactory("Running Generators");

          for (const { name, factory } of resolvedOptions.generators) {
            spinner.append(name);
            const { watchHandler } = await factory(resolvedOptions);
            await watchHandler(resolvedRoutes);
          }

          spinner.succeed();
        }

        {
          const spinner = spinnerFactory("Building Api");
          const apiHandler = await apiHandlerFactory(resolvedOptions);
          await apiHandler.build();
          spinner.succeed();
        }
      }
    },

    async configureServer(server) {
      if (config.command !== "serve") {
        return;
      }

      const apiHandler = await apiHandlerFactory(resolvedOptions);
      const apiWatcher = await apiHandler.watcher();

      const stopWorker = workerHandler(
        async () => {
          await apiWatcher.start();
        },
        async () => {
          await apiWatcher.stop();
        },
      );

      // Attach the dev middleware from apiHandler. It may intercept requests to
      // determine whether they should be handled by Vite or by another handler.
      server.middlewares.use(apiHandler.devMiddleware);

      // clean up when Vite dev server closes/restarts
      server.httpServer?.on("close", stopWorker);
    },
  };
};
