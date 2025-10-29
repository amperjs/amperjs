import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      ...[
        ["core/api"],
        ["core/dev"],
        ["core/devlib"],
        [
          "core/fetch",
          {
            setupFiles: [`packages/core/fetch/test/setup.ts`],
          },
        ],
        ["generators/api-generator"],
        ["generators/solid-generator"],
        [
          "generators/openapi-generator",
          {
            globalSetup: [
              `packages/generators/openapi-generator/test/setup.ts`,
            ],
          },
        ],
        [
          "generators/typebox-generator",
          {
            globalSetup: [
              `packages/generators/typebox-generator/test/setup.ts`,
            ],
          },
        ],
      ].map(([name, setup]) => {
        return {
          extends: true,
          test: {
            ...setup,
            name,
            include: [
              `packages/${name}/test/**/*.test.ts`, // all tests
            ],
            alias: {
              "@/lib": resolve(
                import.meta.dirname,
                `packages/${name}/test/_fixtures/app/lib/`,
              ),
              "@/core": resolve(
                import.meta.dirname,
                `packages/${name}/test/_fixtures/app/core/`,
              ),
              "@test": resolve(import.meta.dirname, `packages/${name}/test`),
              // should go last
              "@": resolve(import.meta.dirname, `packages/${name}/src`),
            },
            ...(["core/fetch"].includes(name)
              ? {
                  environment: "jsdom",
                  globals: true,
                }
              : {}),
          },
        };
      }),
      {
        extends: true,
        test: {
          name: "integration",
          include: ["test/integration/**/*.test.ts"],
          fileParallelism: false,
        },
      },
    ],
    reporters: ["verbose"],
  },
  plugins: [
    {
      name: "vite:load-as-text",
      enforce: "pre",
      transform(src, id) {
        if (id.endsWith(".hbs") || id.endsWith("?as=text")) {
          return {
            code: `export default ${JSON.stringify(src)}`,
            map: null,
          };
        }
      },
    },
  ],
});
