import { basename, join, resolve } from "node:path";

import fsx from "fs-extra";

import { defaults, renderToFile } from "@amperjs/devlib";

import packageJson from "../package.json" with { type: "json" };

import srcApiAppTpl from "./templates/@src/api/app.hbs";
import srcApiRouterTpl from "./templates/@src/api/router.hbs";
import srcApiServerTpl from "./templates/@src/api/server.hbs";
import srcApiUseTpl from "./templates/@src/api/use.hbs";
import srcConfigTpl from "./templates/@src/config/index.hbs";
import srcViteConfigTpl from "./templates/@src/vite.config.hbs";
import gitignoreTpl from "./templates/.gitignore.hbs";
import viteBaseTpl from "./templates/vite.base.hbs";

const tplDir = (...a: Array<string>) => {
  return join(import.meta.dirname, "templates", ...a);
};

export type App = { name: string; distDir: string };

export type Framework = {
  name: "solid" | "react" | "none";
  options?: Record<string, unknown>;
};

export type SourceFolder = {
  name: string;
  framework: Framework;
  baseurl: string;
  port: number;
};

type Plugin = {
  importDeclaration: string;
  importName: string;
};

type Generator = {
  importDeclaration: string;
  importName: string;
  options: string;
};

export default async (
  root: string,
  env: {
    NODE_VERSION: `${number}`;
  },
) => {
  const deps = { ...packageJson.devDependencies };

  const tsconfigJson = {
    extends: "@amperjs/config/tsconfig.vite.json",
    compilerOptions: {
      paths: {
        [`${defaults.appPrefix}/*`]: ["./*", `./${defaults.libDir}/*`],
      },
    },
  };

  const createApp = async (
    app: App,
    assets?: {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    },
  ) => {
    const packageJson = {
      type: "module",
      devEngines: {
        runtime: {
          name: "node",
          version: `^${env.NODE_VERSION}`,
          onFail: "download",
        },
      },
      distDir: app.distDir,
      dependencies: {
        "@amperjs/api": "^0.0.0",
        qs: deps.qs,
        ...assets?.dependencies,
      },
      devDependencies: {
        "@amperjs/config": "^0.0.0",
        "@amperjs/dev": "^0.0.0",
        "@types/node": deps["@types/node"],
        "@types/qs": deps["@types/qs"],
        esbuild: deps.esbuild,
        tslib: deps.tslib,
        typescript: deps.typescript,
        vite: deps.vite,
        ...assets?.devDependencies,
      },
    };

    const esbuildJson = {
      bundle: true,
      platform: "node",
      target: `node${env.NODE_VERSION}`,
      format: "esm",
      packages: "external",
      sourcemap: "linked",
      logLevel: "info",
    };

    const targetDir = resolve(root, app.name);

    if (await fsx.exists(targetDir)) {
      throw new Error(`${app.name} already exists`);
    }

    await copyFiles(tplDir(), targetDir, {
      exclude: [/@src/, /.+\.hbs/],
    });

    for (const [file, template] of [
      [".gitignore", gitignoreTpl],
      ["vite.base.ts", viteBaseTpl],
      ["esbuild.json", JSON.stringify(esbuildJson, null, 2)],
      ["package.json", JSON.stringify(packageJson, null, 2)],
      ["tsconfig.json", JSON.stringify(tsconfigJson, null, 2)],
    ]) {
      await renderToFile(resolve(targetDir, file), template, { defaults });
    }
  };

  const createSourceFolder = async (app: App, folder: SourceFolder) => {
    const appDir = resolve(root, app.name);
    const targetDir = resolve(appDir, folder.name);

    if (await fsx.exists(targetDir)) {
      throw new Error(`${folder.name} already exists`);
    }

    await copyFiles(tplDir("@src"), targetDir, {
      exclude: [/.+\.hbs/],
    });

    const packageFile = resolve(appDir, "package.json");

    const packageImport = await import(packageFile, {
      with: { type: "json" },
    }).then((e) => e.default);

    const tsconfigFile = resolve(appDir, "tsconfig.json");

    const tsconfigImport = await import(tsconfigFile, {
      with: { type: "json" },
    }).then((e) => e.default);

    const compilerOptions = { ...tsconfigImport?.compilerOptions };

    const plugins: Array<Plugin> = [];
    const generators: Array<Generator> = [];

    for (const framework of ["solid", "react"] as const) {
      if (folder.framework.name === framework) {
        generators.push({
          importDeclaration: `import ${framework}Generator from "@amperjs/${framework}-generator";`,
          importName: `${framework}Generator`,
          options: folder.framework.options
            ? JSON.stringify(folder.framework.options)
            : "",
        });
      }
    }

    let dependencies: Record<string, string> | undefined;
    let devDependencies: Record<string, string> | undefined;

    if (folder.framework.name === "solid") {
      devDependencies = {
        "@solidjs/router": deps["@solidjs/router"],
        "solid-js": deps["solid-js"],
        "vite-plugin-solid": deps["vite-plugin-solid"],
      };

      plugins.push({
        importDeclaration: `import solidPlugin from "vite-plugin-solid";`,
        importName: "solidPlugin",
      });

      compilerOptions.jsxImportSource = "solid-js";
      compilerOptions.jsx = "preserve";
    } else if (folder.framework.name === "react") {
      devDependencies = {
        "@vitejs/plugin-react": deps["@vitejs/plugin-react"],
        react: deps.react,
        "react-dom": deps["react-dom"],
        "react-router-dom": deps["react-router-dom"],
      };

      plugins.push({
        importDeclaration: `import reactPlugin from "@vitejs/plugin-react";`,
        importName: "reactPlugin",
      });

      compilerOptions.jsxImportSource = "react";
      compilerOptions.jsx = "react-jsx";
    }

    const context = {
      folder,
      defaults,
      plugins,
      generators,
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
      ...(["solid", "react"].includes(folder.framework.name)
        ? [[`${defaults.pagesDir}/index/index.tsx`, ""]]
        : []),
      ["index.ts", ""],
    ]) {
      await renderToFile(resolve(targetDir, file), template, context);
    }

    const tsconfigUpdated = {
      ...tsconfigJson,
      ...tsconfigImport,
      compilerOptions: {
        ...compilerOptions,
        paths: {
          ...compilerOptions?.paths,
          [`${folder.name}/*`]: [
            `./${folder.name}/*`,
            `./${defaults.libDir}/${folder.name}/*`,
          ],
        },
      },
    };

    await fsx.outputJson(tsconfigFile, tsconfigUpdated, { spaces: 2 });

    if (dependencies || devDependencies) {
      const packageUpdated = {
        ...packageImport,
        dependencies: {
          ...packageImport.dependencies,
          ...dependencies,
        },
        devDependencies: {
          ...packageImport.devDependencies,
          ...devDependencies,
        },
      };

      await fsx.outputJson(packageFile, packageUpdated, { spaces: 2 });
    }
  };

  return {
    createApp,
    createSourceFolder,
  };
};

const copyFiles = async (
  src: string,
  dst: string,
  { exclude = [] }: { exclude?: Array<string | RegExp> } = {},
): Promise<void> => {
  const filter = exclude.length
    ? (path: string) => {
        return !exclude.some((e) => {
          return typeof e === "string" ? e === basename(path) : e.test(path);
        });
      }
    : undefined;

  await fsx.copy(src, dst, {
    filter,
  });
};
