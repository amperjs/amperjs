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
  let config: ResolvedConfig;
  let resolvedOptions: PluginOptionsResolved;
};
