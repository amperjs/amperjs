import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { build, type Plugin } from "esbuild";
import colors from "kleur";
import ora from "ora";
import { glob } from "tinyglobby";
import { workspaceRoot } from "workspace-root";

import pkg from "../../../../package.json" with { type: "json" };

const nodeVersion =
  pkg.devEngines?.runtime?.name === "node" //
    ? pkg.devEngines.runtime.version
    : undefined;

if (!nodeVersion) {
  throw colors.red("Unsupported runtime: expected node runtime");
}

const target = `node${nodeVersion.split(".")[0].replace(/[^\d]/g, "")}`;

const { values, positionals } = parseArgs({
  options: {
    scripts: {
      type: "string",
      default: ["@/scripts/"],
      multiple: true,
      short: "s",
    },
  },
  allowPositionals: true,
});

const root = await workspaceRoot();

if (!root) {
  throw colors.red("Could not detect workspace root");
}

const tsAsTextPlugin = (): Plugin => {
  const namespace = "load-as-text";
  const filter = /\?as=text$/;
  return {
    name: namespace,
    setup(build) {
      // Intercept imports that end with ?as=text
      build.onResolve({ filter }, (args) => {
        return {
          path: resolve(args.resolveDir, args.path.replace(filter, "")),
          namespace,
        };
      });

      // Load the file contents as text
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        return {
          contents: await readFile(args.path, "utf8"),
          loader: "text",
        };
      });
    },
  };
};

const scriptPatternsMapper = (pattern: string) => {
  if (pattern.startsWith("@/")) {
    pattern = pattern.replace("@", root);
  }

  if (pattern.endsWith("/")) {
    pattern = `${pattern}*`;
  }

  return pattern;
};

for (const pattern of values.scripts.map(scriptPatternsMapper)) {
  const scripts = await glob(pattern, {
    onlyFiles: true,
  });

  for (const script of scripts) {
    const text = root ? script.replace(root, "@") : script;
    const spinner = ora({ spinner: "dots2" }).start(text);

    await new Promise((resolve) => {
      // TODO: cross-platform support?
      const child = execFile("bash", [script], (error, stdout, stderr) => {
        if (error) {
          spinner.fail();
          console.error(colors.red(error.message));
          console.log(stdout);
          console.error(stderr);
          process.exit(1);
        }

        if (stderr?.trim()) {
          spinner.text = `${spinner.text}\n${colors.red(stderr)}`;
        }

        if (stdout?.trim()) {
          spinner.text = `${spinner.text}\n${colors.cyan(stdout)}`;
        }
      });

      child.on("close", (code) => {
        if (spinner.text === text) {
          spinner.text = `${spinner.text}\n`;
        }
        spinner[code === 0 ? "succeed" : "warn"]();
        resolve(code);
      });
    });
  }
}

const spinner = ora().start(positionals.join("; "));

try {
  await build({
    bundle: true,
    platform: "node",
    plugins: [tsAsTextPlugin()],
    target,
    format: "esm",
    packages: "external",
    sourcemap: "linked",
    logLevel: "error",
    loader: { ".hbs": "text" },
    entryPoints: positionals,
    outdir: "./pkg",
    define: {
      "process.env.OREUM__NODE_VERSION": JSON.stringify(nodeVersion),
      "process.env.OREUM__ESBUILD_TARGET": JSON.stringify(target),
    },
  });
  spinner.succeed();
} catch (error) {
  spinner.fail();
  console.error(error);
  process.exit(1);
}
