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
