import { parentPort, workerData } from "node:worker_threads";

import chokidar from "chokidar";
import crc from "crc/crc32";

import {
  type Formatter,
  type GeneratorConstructor,
  type PluginOptionsResolved,
  pathResolver,
  type RouteResolver,
  type RouteResolverEntry,
  type SpinnerFactory,
  type WatcherEvent,
  type WatchHandler,
} from "@oreum/devlib";

import routesFactory from "./routes";

// By default, kleur (and similar libs) won't emit ANSI escapes when running
// inside a worker thread, since no TTY is detected.
// Setting FORCE_COLOR would force color output.
// (effective in the worker only, does not propagate to the parent process)
// INFO: should be set before loading generators.
process.env.FORCE_COLOR = "1";

export type WorkerData = Omit<
  PluginOptionsResolved,
  "generators" | "formatters"
> & {
  generatorModules: Array<[string, unknown]>;
  formatterModules: Array<[string, unknown]>;
};

export type WorkerSpinner = {
  id: string;
  startText: string;
  method: keyof SpinnerFactory;
  text?: string | undefined;
};

export type WorkerError = {
  name: string;
  message: string;
  stack?: string;
};

const {
  //
  generatorModules,
  formatterModules,
  ...restOptions
} = workerData as WorkerData;

const generators: Array<GeneratorConstructor> = [];
const formatters: Array<Formatter> = [];

for (const [path, opts] of generatorModules) {
  generators.push(await import(path).then((m) => m.default(opts)));
}

for (const [path, opts] of formatterModules) {
  formatters.push(await import(path).then((m) => m.default(opts).formatter));
}

const resolvedOptions: PluginOptionsResolved = {
  ...restOptions,
  generators,
  formatters,
};

const { appRoot, sourceFolder } = resolvedOptions;

const watchHandlers: Array<{ name: string; handler: WatchHandler }> = [];

const resolvedRoutes = new Map<
  string, // fileFullpath
  RouteResolverEntry
>();

const {
  //
  resolvers,
  resolversFactory,
  resolveRouteFile,
} = await routesFactory(resolvedOptions);

const { resolve } = pathResolver({ appRoot, sourceFolder });

const spinnerFactory = (startText: string) => {
  const id = [startText, Date.now().toString()].map(crc).join(":");

  const postMessage = (
    method: keyof SpinnerFactory,
    text?: string | undefined,
  ) => {
    const spinner: WorkerSpinner = { id, startText, method, text };
    parentPort?.postMessage({ spinner });
  };

  const postError = (error: Error) => {
    parentPort?.postMessage({ error: structuredClone(error) });
  };

  return {
    id,
    startText,
    text(text: string) {
      postMessage("text", text);
    },
    append(text: string) {
      postMessage("append", text);
    },
    succeed(text?: string) {
      postMessage("succeed", text);
    },
    failed(error: Error) {
      postError(error);
      postMessage("failed", error?.stack || error?.message);
    },
  };
};

const createEventHandler = async (file: string) => {
  const [resolver] = resolversFactory([file]).values();
  if (resolver) {
    const spinner = spinnerFactory(`Resolving ${resolver.name} Route`);
    try {
      const resolvedRoute = await resolver.handler();
      resolvers.set(file, resolver);
      resolvedRoutes.set(resolvedRoute.route.fileFullpath, resolvedRoute);
      spinner.succeed();
    } catch (
      // biome-ignore lint: any
      error: any
    ) {
      spinner.failed(error);
    }
  }
};

const updateEventHandler = async (file: string) => {
  const relatedResolvers = new Map<string, RouteResolver>();

  if (resolvedRoutes.has(file)) {
    // some route updated
    const resolver = resolvers.get(file);
    if (resolver) {
      relatedResolvers.set(file, resolver);
    }
  } else {
    // checking if changed file is referenced by any routes
    const referencedRoutes = resolvedRoutes
      .values()
      .filter(({ kind, route }) => {
        return kind === "api" ? route.referencedFiles.includes(file) : false;
      });
    for (const { route } of referencedRoutes) {
      const resolver = resolvers.get(route.fileFullpath);
      if (resolver) {
        relatedResolvers.set(route.fileFullpath, resolver);
      }
    }
  }

  let spinner = spinnerFactory(`Updating ${relatedResolvers.size} Routes`);

  for (const resolver of relatedResolvers.values()) {
    spinner.append(resolver.name);
    try {
      const route = await resolver.handler(file);
      resolvedRoutes.set(route.route.fileFullpath, route);
    } catch (
      // biome-ignore lint: any
      error: any
    ) {
      spinner.failed(error);
      spinner = spinnerFactory(`Updating ${relatedResolvers.size} Routes`);
    }
  }

  spinner.succeed();
};

const deleteEventHandler = async () => {
  // TODO: cleanup related files in libDir
};

const runWatchHandlers = async (event?: WatcherEvent) => {
  let spinner = spinnerFactory("Running Generators");

  /**
   * Watch handlers receive the full list of routes
   * and should process only those whose source file or dependencies were updated.
   */
  const routes = Array.from(resolvedRoutes.values());

  for (const { name, handler } of watchHandlers) {
    spinner.append(name);
    try {
      // using structuredClone to make sure no generator would alter routes
      await handler(structuredClone(routes), event);
    } catch (
      // biome-ignore lint: any
      error: any
    ) {
      spinner.failed(error);
      spinner = spinnerFactory("Running Generators");
    }
  }

  spinner.succeed();
};

const watcher = chokidar.watch(
  [
    // watching for changes in sourceFolder's apiDir and pagesDir
    resolve("apiDir"),
    resolve("pagesDir"),
  ],
  {
    ...resolvedOptions.watcher.options,
    awaitWriteFinish:
      typeof resolvedOptions.watcher.options?.awaitWriteFinish === "object"
        ? resolvedOptions.watcher.options.awaitWriteFinish
        : {
            stabilityThreshold: resolvedOptions.watcher.delay,
            pollInterval: Math.floor(resolvedOptions.watcher.delay / 4),
          },
    // Do Not emit "add" event for existing files
    ignoreInitial: true,
    // Not using Chokidar's `ignored` option.
    // Instead, allow all events through and filter them manually as needed.
  },
);

watcher.on("all", async (event, file) => {
  if (event.endsWith("Dir")) {
    // skipping folder events
    return;
  }

  if (!resolveRouteFile(file)) {
    // not a route file
    return;
  }

  const match = (
    {
      add: { handler: createEventHandler, kind: "create" },
      change: { handler: updateEventHandler, kind: "update" },
      unlink: { handler: deleteEventHandler, kind: "delete" },
    } as const
  )[event as string];

  if (match) {
    const { handler, kind } = match;

    /**
     * This handler is responsible for updating `resolvedRoutes`
     * before they are passed to generators.
     * */
    await handler(file);

    await runWatchHandlers({ kind, file });
  }
});

{
  let spinner = spinnerFactory("Resolving Routes");

  for (const { name, handler } of resolvers.values()) {
    spinner.append(
      `[ ${resolvedRoutes.size + 1} of ${resolvers.size} ] ${name}`,
    );
    try {
      const resolvedEntry = await handler();
      resolvedRoutes.set(resolvedEntry.route.fileFullpath, resolvedEntry);
    } catch (
      // biome-ignore lint: any
      error: any
    ) {
      spinner.failed(error);
      spinner = spinnerFactory("Resolving Routes");
    }
  }

  spinner.succeed();
}

{
  let spinner = spinnerFactory("Initializing Generators");

  for (const { name, factory } of generators) {
    spinner.append(name);
    try {
      const { watchHandler } = await factory(resolvedOptions);
      watchHandlers.push({ name, handler: watchHandler });
    } catch (
      // biome-ignore lint: any
      error: any
    ) {
      spinner.failed(error);
      spinner = spinnerFactory("Initializing Generators");
    }
  }

  spinner.succeed();
}

await runWatchHandlers();

parentPort?.postMessage("ready");
