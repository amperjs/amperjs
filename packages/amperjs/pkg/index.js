#!/usr/bin/env -S node --enable-source-maps --no-warnings=ExperimentalWarning

// src/index.ts
import { execFileSync } from "node:child_process";
import { basename, join, resolve } from "node:path";
import { parseArgs, styleText } from "node:util";
import fsx from "fs-extra";
import colors from "kleur";
import prompts from "prompts";
import { defaults, renderToFile } from "@amperjs/devlib";

// src/templates/@src/api/app.hbs
var app_default = 'import createApp from "{{importPathmap.core}}/app";\n\nimport router from "./router";\n\nexport default () => {\n  const app = createApp();\n\n  // routes goes latest\n  app.use(router.routes());\n\n  return app;\n};\n\n/**\n * In dev mode, determines whether to pass the request to API handler or to Vite.\nexport const devMiddlewareFactory: import("@amperjs/api").DevMiddlewareFactory = (\n  app,\n) => {\n  return (req, res, next) => {\n    return req.url?.startsWith("...")\n      ? app?.callback()(req, res) // send request to api handler\n      : next(); // send request to vite dev server\n  };\n};\n * */\n\n/**\n * In dev mode, used to cleanup before reloading api handler.\nexport const teardownHandler: import("@amperjs/api").TeardownHandler = () => {\n  // close db connections, server sockets etc.\n};\n * */\n';

// src/templates/@src/api/router.hbs
var router_default = 'import { routerRoutes } from "{{importPathmap.lib}}";\n\nimport createRouter from "{{importPathmap.core}}/router";\n\nconst router = createRouter();\n\nfor (const { name, path, methods, middleware } of routerRoutes) {\n  router.register(path, methods, middleware, { name });\n}\n\nexport default router;\n';

// src/templates/@src/api/server.hbs
var server_default = 'import createServer from "{{importPathmap.core}}/server";\nimport createApp from "./app";\n\ncreateServer(createApp);\n';

// src/templates/@src/api/use.hbs
var use_default = 'import globalMiddleware from "{{defaults.appPrefix}}/core/api/use";\n\nexport default [\n  // Global middleware applied to all routes\n  ...globalMiddleware,\n];\n';

// src/templates/@src/config/index.hbs
var config_default = 'export const baseurl = "{{folder.baseurl}}";\nexport const apiurl = "/api"; // relative to baseurl\n';

// src/templates/@src/vite.config.hbs
var vite_config_default = 'import { join } from "node:path";\n\nimport devPlugin, { apiGenerator, fetchGenerator } from "@amperjs/dev";\n\nimport defineConfig from "../vite.base";\nimport { apiurl, baseurl } from "./config";\n\nexport default defineConfig(import.meta.dirname, {\n  base: join(baseurl, "/"),\n  server: {\n    port: {{folder.port}},\n  },\n  plugins: [\n    devPlugin(apiurl, {\n      generators: [apiGenerator(), fetchGenerator()],\n    }),\n  ],\n});\n';

// src/templates/.gitignore.hbs
var gitignore_default = "/.env\n/{{project.distDir}}/*\n";

// src/templates/esbuild.hbs
var esbuild_default = '{\n  "bundle": true,\n  "platform": "node",\n  "target": "{{ESBUILD_TARGET}}",\n  "format": "esm",\n  "packages": "external",\n  "sourcemap": "linked",\n  "logLevel": "info"\n}\n';

// src/templates/package.hbs
var package_default = '{\n  "type": "module",\n  "devEngines": {\n    "runtime": {\n      "name": "node",\n      "version": "{{NODE_VERSION}}",\n      "onFail": "download"\n    }\n  },\n  "distDir": "{{project.distDir}}",\n  "dependencies": {\n    "@amperjs/api": "^0.0.0",\n    "qs": "^6.14.0"\n  },\n  "devDependencies": {\n    "@amperjs/config": "^0.0.0",\n    "@amperjs/dev": "^0.0.0",\n    "@types/node": "^24.0.4",\n    "@types/qs": "^6.14.0",\n    "esbuild": "^0.25.5",\n    "tslib": "^2.8.1",\n    "typescript": "^5.8.3",\n    "vite": "^7.0.0"\n  }\n}\n';

// src/templates/tsconfig.hbs
var tsconfig_default = '{\n  "extends": "@amperjs/config/tsconfig.vite.json",\n  "compilerOptions": {\n    "paths": {\n      "{{defaults.appPrefix}}/*": ["./*", "./{{defaults.libDir}}/*"]\n    }\n  }\n}\n';

// src/templates/vite.base.hbs
var vite_base_default = 'import { basename, resolve } from "node:path";\n\nimport { aliasPlugin, definePlugin } from "@amperjs/dev";\nimport { loadEnv, mergeConfig, type UserConfig } from "vite";\n\nimport pkg from "./package.json" with { type: "json" };\n\nexport default async (sourceFolderPath: string, config: UserConfig) => {\n  const env = loadEnv("mock", import.meta.dirname);\n  const sourceFolder = basename(sourceFolderPath);\n  return mergeConfig(config, {\n    build: {\n      outDir: resolve(import.meta.dirname, `${pkg.distDir}/${sourceFolder}`),\n      emptyOutDir: true,\n      sourcemap: true,\n    },\n\n    server: {\n      host: true,\n      allowedHosts: [env.VITE_HOSTNAME],\n      fs: {\n        strict: false,\n      },\n      watch: {\n        awaitWriteFinish: {\n          stabilityThreshold: 800,\n          pollInterval: 200,\n        },\n      },\n    },\n\n    cacheDir: resolve(import.meta.dirname, `var/.vite/${sourceFolder}`),\n\n    plugins: [\n      aliasPlugin(import.meta.dirname),\n      definePlugin([\n        {\n          // keys extracted from process.env and exposed to client\n          keys: ["DEBUG"],\n        },\n      ]),\n    ],\n  });\n};\n';

// src/index.ts
var onState = (state) => {
  if (state.aborted) {
    process.nextTick(() => process.exit(1));
  }
};
var cwd = process.cwd();
var tplDir = (...a) => {
  return join(import.meta.dirname, "templates", ...a);
};
var genericContext = {
  // coming from esbuild
  NODE_VERSION: String("^22.20.0"),
  ESBUILD_TARGET: String("node22")
};
var validateNameIdentifier = (name) => {
  if (/[^\w.@$+-]/.test(name)) {
    return "May contain only alphanumerics, hyphens, periods or any of @ $ +";
  }
  return true;
};
var halt = (error) => {
  if (error) {
    console.log();
    console.error(`${colors.red("ERROR")}: ${error}`);
  }
  process.exit(1);
};
var usage = [
  "",
  `${styleText("blue", "amperjs")} \u279C Create a new Project or a new Source Folder if current dir is a valid AmperJS Project`,
  `${styleText("blue", "amperjs")} ${styleText("magenta", "-h | --help")} \u279C Print this message and exit`,
  ""
];
var printUsage = () => {
  for (const line of usage) {
    console.log(line);
  }
};
var copyFiles = async (src, dst, { exclude = [] } = {}) => {
  const filter = exclude.length ? (path) => {
    return !exclude.some((e) => {
      return typeof e === "string" ? e === basename(path) : e.test(path);
    });
  } : void 0;
  await fsx.copy(src, dst, {
    filter
  });
};
var input = parseArgs({
  options: {
    help: {
      type: "boolean",
      short: "h"
    }
  }
});
if (input.values.help) {
  printUsage();
  process.exit(0);
}
var viteBaseExists = await fsx.exists(resolve(cwd, "vite.base.ts"));
var tsConfigFile = resolve(cwd, "tsconfig.json");
var tsConfigExists = await fsx.exists(tsConfigFile);
if (viteBaseExists) {
  console.log(
    styleText(
      ["bold", "green"],
      "\u279C You are about to create a new Source Folder..."
    )
  );
  const folder = await prompts([
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
      }
    },
    {
      type: "text",
      name: "baseurl",
      message: "Base URL",
      initial: "/",
      onState,
      validate(base) {
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
      }
    },
    {
      type: "number",
      name: "port",
      message: "Dev Server Port",
      initial: 4e3,
      onState
    }
  ]);
  const dstDir = (...a) => {
    return resolve(cwd, folder.name, ...a);
  };
  if (await fsx.exists(dstDir())) {
    halt(`${colors.blue(folder.name)} already exists`);
  }
  await copyFiles(tplDir("@src"), dstDir(), {
    exclude: [/.+\.hbs/]
  });
  const context = {
    ...genericContext,
    folder,
    defaults,
    importPathmap: {
      core: [defaults.appPrefix, defaults.coreDir, defaults.apiDir].join("/"),
      lib: [folder.name, defaults.apiLibDir].join("/")
    }
  };
  for (const [file, template] of [
    [`${defaults.configDir}/index.ts`, config_default],
    [`${defaults.apiDir}/app.ts`, app_default],
    [`${defaults.apiDir}/router.ts`, router_default],
    [`${defaults.apiDir}/server.ts`, server_default],
    [`${defaults.apiDir}/use.ts`, use_default],
    ["vite.config.ts", vite_config_default],
    // stub files for initial build to pass
    [`${defaults.apiDir}/index/index.ts`, ""],
    ["index.ts", ""]
  ]) {
    await renderToFile(dstDir(file), template, context);
  }
  const tsConfig = tsConfigExists ? await import(tsConfigFile, {
    with: { type: "json" }
  }).then((e) => e.default) : void 0;
  const tsConfigOptions = {
    extends: "@amperjs/config/tsconfig.vite.json",
    ...tsConfig,
    compilerOptions: {
      ...tsConfig?.compilerOptions,
      paths: {
        ...tsConfig?.compilerOptions?.paths,
        [`${folder.name}/*`]: [
          `./${folder.name}/*`,
          `./${defaults.libDir}/${folder.name}/*`
        ]
      }
    }
  };
  await fsx.outputJson(tsConfigFile, tsConfigOptions, { spaces: 2 });
  try {
    execFileSync("vite", ["build", folder.name], {
      stdio: "inherit"
    });
  } catch (_error) {
  }
} else {
  const project = await prompts([
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
      }
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
      }
    }
  ]);
  const targetDir = (...a) => {
    return resolve(cwd, project.name, ...a);
  };
  if (await fsx.exists(targetDir())) {
    halt(`${colors.blue(project.name)} already exists`);
  }
  await copyFiles(tplDir(), targetDir(), {
    exclude: [/@src/, /.+\.hbs/]
  });
  {
    const context = {
      ...genericContext,
      project,
      defaults
    };
    for (const [file, template] of [
      [".gitignore", gitignore_default],
      ["esbuild.json", esbuild_default],
      ["package.json", package_default],
      ["tsconfig.json", tsconfig_default],
      ["vite.base.ts", vite_base_default]
    ]) {
      await renderToFile(targetDir(file), template, context);
    }
  }
  for (const line of [
    "",
    "\u{1F389}  Well Done! Your new AmperJS project is ready.",
    `\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
    "",
    `\u{1F4C2} Next steps:`,
    `- Navigate to your app dir - ${styleText("blue", `cd ./${project.name}`)}`,
    `- Install dependencies using your favorite package manager:`,
    ...["npm install", "pnpm install", "yarn install"].map(
      (cmd) => styleText("blue", `  ${cmd}`)
    ),
    "",
    `\u{1F680} Once dependencies installed, create a source folder by running \`${styleText("blue", "npx amperjs")}\` again.`,
    styleText(
      ["dim", "gray"],
      "When run in an application directory, AmperJS will recognize it and guide you through creating a source folder.\n"
    ),
    "\u{1F4D8}  Docs: https://amperjsjs.dev"
  ]) {
    console.log(line);
  }
}
//# sourceMappingURL=index.js.map
