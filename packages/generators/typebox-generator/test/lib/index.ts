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

/**
 * Generates all possible path combinations from an array of elements
 * @param {Array<string>} elements - Array of path segments
 * @returns {Array<string[]>} Array of all possible path combinations
 */
export const generatePathCombinations = (
  elements: Array<string>,
): Array<string[]> => {
  if (elements.length === 0) {
    return [[]];
  }

  const results = new Set<string>();

  function permute(arr: string[], current: string[] = []) {
    // Add all subpaths
    current.forEach((_, index) => {
      if (index > 0) {
        // Skip empty array
        const path = JSON.stringify(current.slice(0, index + 1));
        results.add(path);
      }
    });

    // Add the full current path
    if (current.length > 0) {
      results.add(JSON.stringify(current));
    }

    // Iterate through remaining elements
    arr.forEach((element, index) => {
      const remaining = arr.filter((_, i) => i !== index);
      permute(remaining, [...current, element]);
    });
  }

  permute(elements);

  // Convert JSON strings back to arrays and sort by length, then lexicographically
  return Array.from(results)
    .map((json) => JSON.parse(json) as string[])
    .sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return a.join("/").localeCompare(b.join("/"));
    });
};
