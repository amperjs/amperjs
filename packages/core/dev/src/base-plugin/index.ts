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
};
