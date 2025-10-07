#!/usr/bin/env -S node --enable-source-maps --no-warnings=ExperimentalWarning

import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import fsx from "fs-extra";
import colors from "kleur";
import prompts, { type PromptObject } from "prompts";

import { defaults, renderToFile } from "@oreum/devlib";

import { copyFiles } from "./base";

import srcApiAppTpl from "./templates/@src/api/app.hbs";
import srcApiRouterTpl from "./templates/@src/api/router.hbs";
import srcApiServerTpl from "./templates/@src/api/server.hbs";
import srcApiUseTpl from "./templates/@src/api/use.hbs";
import srcConfigTpl from "./templates/@src/config/index.hbs";
import srcViteConfigTpl from "./templates/@src/vite.config.hbs";
import gitignoreTpl from "./templates/.gitignore.hbs";
import esbuildTpl from "./templates/esbuild.hbs";
import packageTpl from "./templates/package.hbs";
import tsconfigTpl from "./templates/tsconfig.hbs";
import viteBaseTpl from "./templates/vite.base.hbs";

const onState: PromptObject["onState"] = (state) => {
  if (state.aborted) {
    process.nextTick(() => process.exit(1));
  }
};

const cwd = process.cwd();

const tplDir = (...a: Array<string>) => {
  return join(import.meta.dirname, "templates", ...a);
};

const genericContext = {
  // coming from esbuild
  NODE_VERSION: String(process.env.OREUM__NODE_VERSION),
  ESBUILD_TARGET: String(process.env.OREUM__ESBUILD_TARGET),
};

const validateNameIdentifier = (name: string) => {
  if (/[^\w.@$+-]/.test(name)) {
    return "May contain only alphanumerics, hyphens, periods or any of @ $ +";
  }
  return true;
};

const halt = (error?: string) => {
  if (error) {
    console.log();
    console.error(`${colors.red("ERROR")}: ${error}`);
  }
  process.exit(1);
};

const usage = [
  "",
  "oreum               : Create a new Project",
  "oreum -f | --folder : Create a new Source Folder inside current project",
  "oreum -h | --help   : Print this message and exit",
  "",
];

const printUsage = () => {
  for (const line of usage) {
    console.log(line);
  }
};

if (process.argv[2]) {
  const options = {
    "source-folder": {
      type: "boolean",
      short: "s",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  } as const;

  let input:
    | ReturnType<typeof parseArgs<{ options: typeof options }>>
    | undefined;

  try {
    input = parseArgs({ options });
    if (input.values.help) {
      printUsage();
      process.exit(0);
    }
  } catch (
    // biome-ignore lint: any
    error: any
  ) {
    printUsage();
    halt(error.message);
  }

  const viteBaseFile = resolve(cwd, "vite.base.ts");
  const tsConfigFile = resolve(cwd, "tsconfig.json");

  const viteBaseExists = await fsx.exists(viteBaseFile);
  const tsConfigExists = await fsx.exists(tsConfigFile);

  const tsConfig = tsConfigExists
    ? await import(tsConfigFile, {
        with: { type: "json" },
      }).then((e) => e.default)
    : undefined;

  if (!viteBaseExists || !tsConfig?.compilerOptions?.paths) {
    halt("Please navigate to a valid Oreum project directory");
  }

  if (input?.values["source-folder"]) {
    const folder = await prompts<"name" | "baseurl" | "port">([
      {
        type: "text",
        name: "name",
        message: "Folder Name",
        onState,
        validate(name) {
          if (!name?.length) {
            return "Please insert folder name";
          }
          return validateNameIdentifier(name);
        },
      },

      {
        type: "text",
        name: "baseurl",
        message: "Base URL",
        initial: "/",
        onState,
        validate(base: string) {
          if (!base?.startsWith("/")) {
            return "Should start with a slash";
          }
          if (/[^\w./-]/.test(base)) {
            return "May contain only alphanumerics, hyphens, periods or slashes";
          }
          if (/\.\.\//.test(base) || /\/\.\//.test(base)) {
            return "Should not contain path traversal patterns";
          }
          return true;
        },
      },

      {
        type: "number",
        name: "port",
        message: "Dev Server Port",
        initial: 4000,
        onState,
      },
    ]);

    const dstDir = (...a: Array<string>) => {
      return resolve(cwd, folder.name, ...a);
    };

    if (await fsx.exists(dstDir())) {
      halt(`${colors.blue(folder.name)} already exists`);
    }

    await copyFiles(tplDir("@src"), dstDir(), {
      exclude: [/.+\.hbs/],
    });

    const context = {
      ...genericContext,
      folder,
      defaults,
      importPathmap: {
        core: [defaults.appPrefix, defaults.coreDir, defaults.apiDir].join("/"),
        lib: [folder.name, defaults.apiLibDir].join("/"),
      },
    };

    for (const [file, template] of [
      [`${defaults.configDir}/index.ts`, srcConfigTpl],
      [`${defaults.apiDir}/app.ts`, srcApiAppTpl],
      [`${defaults.apiDir}/router.ts`, srcApiRouterTpl],
      [`${defaults.apiDir}/server.ts`, srcApiServerTpl],
      [`${defaults.apiDir}/use.ts`, srcApiUseTpl],
      ["vite.config.ts", srcViteConfigTpl],
      // stub files for initial build to pass
      [`${defaults.apiDir}/index/index.ts`, ""],
      ["index.ts", ""],
    ]) {
      await renderToFile(dstDir(file), template, context);
    }

    tsConfig.compilerOptions.paths[`${folder.name}/*`] = [
      `./${folder.name}/*`,
      `./${defaults.libDir}/${folder.name}/*`,
    ];

    await fsx.outputJson(tsConfigFile, tsConfig, { spaces: 2 });

    try {
      execFileSync("vite", ["build", folder.name], {
        stdio: "inherit",
      });
    } catch (_error) {}
  }
} else {
  // no args provided, creating a new project
  const project = await prompts<"name" | "distDir">([
    {
      type: "text",
      name: "name",
      message: "Project Name",
      onState,
      validate(name) {
        if (!name?.length) {
          return "Please insert project name";
        }
        return validateNameIdentifier(name);
      },
    },

    {
      type: "text",
      name: "distDir",
      message: "Dist Folder",
      initial: ".dist",
      onState,
      validate(folderName) {
        if (!folderName?.length) {
          return "Please insert dist folder name";
        }
        return validateNameIdentifier(folderName);
      },
    },
  ]);

  const targetDir = (...a: Array<string>) => {
    return resolve(cwd, project.name, ...a);
  };

  if (await fsx.exists(targetDir())) {
    halt(`${colors.blue(project.name)} already exists`);
  }

  await copyFiles(tplDir(), targetDir(), {
    exclude: [/@src/, /.+\.hbs/],
  });

  {
    const context = {
      ...genericContext,
      project,
      defaults,
    };

    for (const [file, template] of [
      [".gitignore", gitignoreTpl],
      ["esbuild.json", esbuildTpl],
      ["package.json", packageTpl],
      ["tsconfig.json", tsconfigTpl],
      ["vite.base.ts", viteBaseTpl],
    ]) {
      await renderToFile(targetDir(file), template, context);
    }
  }
}
