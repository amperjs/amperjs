#!/usr/bin/env -S node --enable-source-maps --no-warnings=ExperimentalWarning

import { execFileSync } from "node:child_process";
import { basename, resolve } from "node:path";
import { parseArgs, styleText } from "node:util";

import fsx from "fs-extra";
import prompts, { type PromptObject } from "prompts";

import kappaFactory from "./factory";

const onState: PromptObject["onState"] = (state) => {
  if (state.aborted) {
    process.nextTick(() => process.exit(1));
  }
};

const cwd = process.cwd();

const validateNameIdentifier = (name: string) => {
  if (/[^\w.@$+-]/.test(name)) {
    return "May contain only alphanumerics, hyphens, periods or any of @ $ +";
  }
  return true;
};

const halt = (error: string) => {
  if (error) {
    console.log();
    console.error(`${styleText("red", "ERROR")}: ${error}`);
  }
  process.exit(1);
};

const usage = [
  "",
  `${styleText("blue", "npx @kappajs/create")} ➜ Create a new Project (or a new Source Folder if inside app dir)`,
  `${styleText("blue", "npx @kappajs/create")} ${styleText("magenta", "-h | --help")} ➜ Print this message and exit`,
  "",
];

const printUsage = () => {
  for (const line of usage) {
    console.log(line);
  }
};

const input = parseArgs({
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

if (input.values.help) {
  printUsage();
  process.exit(0);
}

const packageFile = resolve(cwd, "package.json");
const packageFileExists = await fsx.exists(packageFile);

const packageJson = packageFileExists
  ? await import(packageFile, { with: { type: "json" } }).then((e) => e.default)
  : undefined;

const viteBaseExists = await fsx.exists(resolve(cwd, "vite.base.ts"));
const tsconfigExists = await fsx.exists(resolve(cwd, "tsconfig.json"));

const NODE_VERSION = "22";

if (viteBaseExists && tsconfigExists && packageJson?.distDir) {
  const { createSourceFolder } = await kappaFactory(resolve(cwd, ".."), {
    NODE_VERSION,
  });

  // Current directory appears to be a valid KappaJS app,
  // prompting user to create a new source folder...
  console.log(
    styleText(
      ["bold", "green"],
      "➜ You are about to create a new Source Folder...",
    ),
  );

  const folder = await prompts<"name" | "framework" | "baseurl" | "port">([
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
      type: "select",
      name: "framework",
      message: "Frontend Framework",
      onState,
      choices: [
        { title: "None", value: { name: "none" } },
        { title: "SolidJS", value: { name: "solid" } },
        { title: "React", value: { name: "react" } },
      ],
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

  try {
    await createSourceFolder(
      {
        name: basename(cwd),
        distDir: packageJson.distDir,
      },
      folder,
    );
  } catch (
    // biome-ignore lint: any
    error: any
  ) {
    halt(error.message);
  }

  try {
    execFileSync("vite", ["build", folder.name], {
      stdio: "inherit",
    });
  } catch (_error) {}
} else {
  const { createApp } = await kappaFactory(cwd, {
    NODE_VERSION,
  });

  // Prompting user to create a new KappaJS app...
  const app = await prompts<"name" | "distDir">([
    {
      type: "text",
      name: "name",
      message: "Project Name",
      onState,
      validate(name) {
        if (!name?.length) {
          return "Please insert app name";
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

  try {
    await createApp(app);
  } catch (
    // biome-ignore lint: any
    error: any
  ) {
    halt(error.message);
  }

  for (const line of [
    "",
    "✨ Well Done! Your new KappaJS app is ready.",
    `────────────────────────────────────────────`,
    "",

    `Next steps`,
    `» Navigate to your app dir:`,
    `  ${styleText("blue", `cd ./${app.name}`)}`,
    `» Install dependencies using your favorite package manager:`,

    ...["npm install", "pnpm install", "yarn install"].map((cmd) =>
      styleText("blue", `  ${cmd}`),
    ),
    "",

    `🚀 Once dependencies installed, create a source folder by running \`${styleText("blue", "npx @kappajs/create")}\` inside app dir.`,

    styleText(
      ["dim", "gray"],
      "   When run inside app dir, KappaJS will recognize it and guide you through creating a source folder.",
    ),
    "",

    "📘  Docs: https://kappajs.dev",
    "",
  ]) {
    console.log(`  ${line}`);
  }
}
