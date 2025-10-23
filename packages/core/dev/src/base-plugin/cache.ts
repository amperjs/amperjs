import { resolve } from "node:path";

import crc from "crc/crc32";
import fsx from "fs-extra";

import pkg from "@amperjs/dev/package.json" with { type: "json" };
import { type ApiRoute, pathResolver } from "@amperjs/devlib";

export type Cache = {
  hash: number;
  referencedFiles: Record<string, number>;
} & Pick<
  ApiRoute,
  | "params"
  | "methods"
  | "typeDeclarations"
  | "numericParams"
  | "payloadTypes"
  | "responseTypes"
>;

type ExtraContext = Record<string | number, unknown>;

export const cacheFactory = (
  route: Pick<ApiRoute, "file" | "fileFullpath" | "importName" | "importPath">,
  {
    appRoot,
    sourceFolder,
    extraContext,
  }: {
    appRoot: string;
    sourceFolder: string;
    extraContext?: ExtraContext;
  },
) => {
  const cacheFile = pathResolver({
    appRoot,
    sourceFolder,
  }).resolve("apiLibDir", route.importPath, "cache.json");

  const getCache = async (opt?: {
    validate?: boolean;
  }): Promise<Cache | undefined> => {
    if (await fsx.exists(cacheFile)) {
      try {
        const cache = JSON.parse(await fsx.readFile(cacheFile, "utf8"));
        return opt?.validate //
          ? validateCache(cache)
          : cache;
      } catch (_e) {}
    }
    return undefined;
  };

  const persistCache = async ({
    referencedFiles: _referencedFiles,
    ...rest
  }: Omit<Cache, "hash" | "referencedFiles"> & {
    referencedFiles: Array<string>;
  }): Promise<Cache> => {
    const hash = await generateFileHash(route.fileFullpath, {
      ...extraContext,
    });

    const referencedFiles: Cache["referencedFiles"] = {};

    for (const file of _referencedFiles) {
      referencedFiles[
        // Strip project root to ensure cached paths are relative
        // and portable across environments (CI, local, etc.)
        file.replace(`${appRoot}/`, "")
      ] = await generateFileHash(file);
    }

    const cache = { ...rest, hash, referencedFiles };

    await fsx.outputJson(cacheFile, cache, { spaces: 2 });

    return cache;
  };

  const validateCache = async (
    cache: Cache | undefined,
  ): Promise<Cache | undefined> => {
    if (!cache?.hash) {
      return;
    }

    if (!cache.typeDeclarations || !cache.referencedFiles) {
      // incomplete cache
      return;
    }

    const hash = await generateFileHash(route.fileFullpath, {
      ...extraContext,
    });

    if (!identicalHashSum(cache.hash, hash)) {
      // route itself updated
      return;
    }

    for (const [file, hash] of Object.entries(cache.referencedFiles)) {
      if (
        !identicalHashSum(hash, await generateFileHash(resolve(appRoot, file)))
      ) {
        // some referenced file updated
        return;
      }
    }

    return cache;
  };

  return {
    getCache,
    validateCache,
    persistCache,
  };
};

const generateFileHash = async (
  file: string,
  extraContext?: ExtraContext,
): Promise<number> => {
  let fileContent: string | undefined;
  try {
    fileContent = await fsx.readFile(file, "utf8");
  } catch (_e) {
    // file could be deleted since last build
    return 0;
  }
  return fileContent
    ? crc(
        JSON.stringify({
          ...extraContext,
          [pkg.cacheVersion]: fileContent,
        }),
      )
    : 0;
};

// return true if sums are identical
const identicalHashSum = (a: number, b: number) => {
  return a === b;
};
