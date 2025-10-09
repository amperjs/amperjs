import { resolve } from "node:path";

import type { ValidationSchemas } from "@oreum/api";
import { type PluginOptionsResolved, pathResolver } from "@oreum/devlib";

import typeboxGenerator from "@/index";

export const appRoot = resolve(import.meta.dirname, "../_fixtures/app");

export const resolvedOptions: PluginOptionsResolved = {
  generators: [
    typeboxGenerator({
      importCustomTypes: "@/core/typebox",
    }),
  ],
  formatters: [],
  watcher: { delay: 0 },
  baseurl: "",
  apiurl: "",
  appRoot,
  sourceFolder: "@src",
  outDir: "_dist",
};

export const importSchema = async (
  route: string,
  schemaPath: "params" | `${"payload" | "response"}.${"GET" | "POST"}`,
) => {
  const { resolve } = pathResolver(resolvedOptions);
  const schemas: { validationSchemas: ValidationSchemas } = await import(
    resolve("apiLibDir", route, `schemas.ts?${Date.now()}`)
  );
  if (schemaPath === "params") {
    return schemas.validationSchemas.params;
  }
  const [scope, method] = schemaPath.split(".") as [
    "payload" | "response",
    "GET" | "POST",
  ];
  return schemas.validationSchemas[scope]?.[method];
};
