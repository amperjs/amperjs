import { rmSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { execa } from "execa";
import { chromium, type Page } from "playwright";
import { createServer } from "vite";

import kappaFactory, { type Framework } from "@kappajs/create/factory";
import routesFactory from "@kappajs/dev/routes";
import { defaults, type PageRoute } from "@kappajs/devlib";

import testRoutes from "./routes";

const app = {
  name: "__test_app",
  distDir: ".dist",
};

const appRoot = resolve(import.meta.dirname, `../${app.name}`);
const pkgsDir = resolve(import.meta.dirname, "../../packages");
const pnpmDir = resolve(tmpdir(), ".kappajs/pnpm-store");

const sourceFolder = "@front";
const sourceFolderPath = resolve(appRoot, sourceFolder);

const port = 4567;
const baseURL = `http://localhost:${port}`;

export { testRoutes };

export async function setupTestProject(framework: Framework) {
  const { createApp, createSourceFolder } = await kappaFactory(
    resolve(appRoot, ".."),
    { NODE_VERSION: "22" },
  );

  await cleanup();

  await createApp(app, {
    dependencies: {
      "@kappajs/api": resolve(pkgsDir, "core/api"),
    },
    devDependencies: {
      "@kappajs/config": resolve(pkgsDir, "core/config"),
      "@kappajs/dev": resolve(pkgsDir, "core/dev"),
      "@kappajs/fetch": resolve(pkgsDir, "core/fetch"),
    },
  });

  await createSourceFolder(
    app,
    {
      name: sourceFolder,
      baseurl: "/",
      port,
      framework,
    },
    {
      devDependencies: {
        [`@kappajs/${framework.name}-generator`]: resolve(
          pkgsDir,
          `generators/${framework.name}-generator`,
        ),
      },
    },
  );

  await execa(
    "pnpm",
    ["install", "--ignore-workspace", "--store-dir", pnpmDir],
    {
      cwd: appRoot,
      stdio: "inherit",
    },
  );

  for (const { name } of testRoutes) {
    await createTestRoute(name);
  }

  const resolvedRoutes = await resolveRoutes();

  const devServer = await createDevServer(sourceFolderPath);

  const { browser, page } = await createBrowser(baseURL);

  const defaultContentPatternFor = (routeName: string | PageRoute) => {
    const route =
      typeof routeName === "string"
        ? resolvedRoutes.find((e) => e.name === routeName)
        : routeName;

    if (!route) {
      throw new Error(`${routeName} route not found`);
    }

    return new RegExp(
      `Edit this page at .*${route.name.replace(/[[\]]/g, "\\$&")}.*`,
      "i",
    );
  };

  const withRouteContent = async (
    routeName: string,
    params: Array<string | number>,
    callback: (a: {
      path: string;
      page: Page;
      content: string;
      defaultContentPattern: RegExp;
    }) => void | Promise<void>,
  ) => {
    const route = resolvedRoutes.find((e) => e.name === routeName);

    if (!route) {
      throw new Error(`${routeName} route not found`);
    }

    const path = createRoutePath(route, params);

    await page.goto(`${baseURL}/${path}`);
    await page.waitForLoadState("networkidle");

    // Wait for page content to be rendered
    await page.waitForSelector("body:has-text('')", {
      timeout: 1_000,
    });

    const maybeContent = await page.innerHTML("body");
    const content = maybeContent ?? "";

    await callback({
      path,
      page,
      content,
      defaultContentPattern: defaultContentPatternFor(route),
    });
  };

  const teardown = async () => {
    await page.close();
    await browser.close();
    await devServer.close();
    await cleanup();
  };

  return {
    resolvedRoutes,
    withRouteContent,
    defaultContentPatternFor,
    teardown,
  };
}

const createTestRoute = async (routeName: string) => {
  const filePath = resolve(
    sourceFolderPath,
    `${defaults.pagesDir}/${routeName}/index.tsx`,
  );
  await mkdir(resolve(filePath, ".."), { recursive: true });
  await writeFile(filePath, ""); // Empty file - generator will fill it
};

const createRoutePath = (route: PageRoute, params: Array<string | number>) => {
  const paramsClone = structuredClone(params);
  return route.pathTokens
    .flatMap(({ path, param }) => {
      if (param?.isRest) {
        return paramsClone;
      }
      if (param) {
        return paramsClone.splice(0, 1);
      }
      return [path];
    })
    .join("/");
};

const resolveRoutes = async () => {
  const { resolvers } = await routesFactory({
    generators: [],
    formatters: [],
    refineTypeName: "TRefine",
    watcher: { delay: 0 },
    baseurl: "",
    apiurl: "",
    appRoot,
    sourceFolder,
    outDir: ".dist",
  });

  const resolvedRoutes: PageRoute[] = [];

  for (const { handler } of resolvers.values()) {
    const { kind, route } = await handler();
    if (kind === "page") {
      resolvedRoutes.push(route);
    }
  }

  return resolvedRoutes;
};

const createDevServer = async (sourceFolderPath: string) => {
  const devServer = await createServer({
    configFile: resolve(sourceFolderPath, "vite.config.ts"),
    root: sourceFolderPath,
    logLevel: "error",
  });

  await devServer.listen();

  // INFO: wait for generators to deploy files!
  await new Promise((resolve) => setTimeout(resolve, 1_000));

  return devServer;
};

const createBrowser = async (baseURL: string) => {
  const browser = await chromium.launch(
    process.env.DEBUG
      ? {
          headless: false,
          devtools: true,
        }
      : {},
  );

  const page = await browser.newPage();

  // Initial warmup navigation
  await page.goto(baseURL, {
    waitUntil: "networkidle",
    // give enough time to connect to dev server and render the app.
    // WARN: do not decrease this timeout!
    // some framework takes long time to hydrate
    timeout: 6_000,
  });

  return { browser, page };
};

const cleanup = async () => {
  rmSync(appRoot, { recursive: true, force: true });
};

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
process.on("exit", cleanup);
