import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
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
          globalSetup: [`packages/generators/openapi-generator/test/setup.ts`],
        },
      ],
      [
        "generators/typebox-generator",
        {
          globalSetup: [`packages/generators/typebox-generator/test/setup.ts`],
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
          exclude: [
            `packages/${name}/test/**/_*/**`, // exclude any folder starting with "_"
            `packages/${name}/test/**/_*.ts`, // exclude any file starting with "_"
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
