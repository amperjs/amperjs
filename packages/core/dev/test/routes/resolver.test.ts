import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import type { ApiRoute, RouteResolverEntry } from "@amperjs/devlib";

import routesResolver from "@/base-plugin/routes";

const appRoot = resolve(import.meta.dirname, "../_fixtures/app");

const pluginOptions = {
  baseurl: "/",
  apiurl: "/api",
  appRoot,
  sourceFolder: "@src",
  outDir: ".dist",
  generators: [],
  formatters: [],
  refineTypeName: "TRefine",
  watcher: {
    delay: 0,
  },
};

const routeNames = [
  "books",
  "books/[category]",
  "books/[category]/[[author]]",
  "pages/[...path].html",
  "articles/[...path]",
  "users/[id].json",
  "files/[[folder]]",
  "files/[[folder]]/[[id]].json",
  "index",
] as const;

describe("routes resolver", async () => {
  const { resolvers } = await routesResolver(pluginOptions);

  const testRouteResolver = async (
    name: (typeof routeNames)[number],
    {
      paramsSchema,
      pathTokens,
      optionalParams,
    }: {
      paramsSchema: RouteResolverEntry["route"]["params"]["schema"];
      pathTokens: RouteResolverEntry["route"]["pathTokens"];
      optionalParams?: boolean;
    },
  ) => {
    const resolver = resolvers.get(`${appRoot}/@src/api/${name}/index.ts`);
    if (!resolver) {
      throw new Error(`No resolver found by given name: ${name}`);
    }
    expect(resolver.name).toEqual(name);
    const { route } = await resolver.handler();
    expect(route.params.schema).toEqual(paramsSchema);
    expect(route.pathTokens).toEqual(pathTokens);
    if (optionalParams !== undefined) {
      expect((route as ApiRoute).optionalParams).toEqual(optionalParams);
    }
  };

  test("route names", async () => {
    const names = [...resolvers.values()].map((e) => e.name).sort();
    expect(names).toEqual([...routeNames].sort());
  });

  test("index", async () => {
    await testRouteResolver("index", {
      paramsSchema: [],
      pathTokens: [
        {
          base: "index",
          ext: "",
          orig: "index",
          path: "/",
        },
      ],
      optionalParams: true,
    });
  });

  test("no params", async () => {
    await testRouteResolver("books", {
      paramsSchema: [],
      pathTokens: [{ orig: "books", base: "books", path: "books", ext: "" }],
      optionalParams: true,
    });
  });

  test("required params", async () => {
    await testRouteResolver("books/[category]", {
      paramsSchema: [
        {
          name: "category",
          const: "category",
          isRequired: true,
          isOptional: false,
          isRest: false,
        },
      ],
      pathTokens: [
        {
          base: "books",
          ext: "",
          orig: "books",
          path: "books",
        },
        {
          base: "[category]",
          ext: "",
          orig: "[category]",
          path: "[category]",
          param: {
            isOptional: false,
            isRequired: true,
            isRest: false,
            name: "category",
            const: "category",
          },
        },
      ],
      optionalParams: false,
    });
  });

  test("required params with extension", async () => {
    await testRouteResolver("users/[id].json", {
      paramsSchema: [
        {
          name: "id",
          const: "id",
          isRequired: true,
          isOptional: false,
          isRest: false,
        },
      ],
      pathTokens: [
        { orig: "users", base: "users", path: "users", ext: "" },
        {
          orig: "[id].json",
          base: "[id]",
          path: "[id].json",
          ext: ".json",
          param: {
            name: "id",
            const: "id",
            isRequired: true,
            isOptional: false,
            isRest: false,
          },
        },
      ],
      optionalParams: false,
    });
  });

  test("optional params", async () => {
    await testRouteResolver("files/[[folder]]", {
      paramsSchema: [
        {
          name: "folder",
          const: "folder",
          isRequired: false,
          isOptional: true,
          isRest: false,
        },
      ],
      pathTokens: [
        { orig: "files", base: "files", path: "files", ext: "" },
        {
          orig: "[[folder]]",
          base: "[[folder]]",
          path: "[[folder]]",
          ext: "",
          param: {
            name: "folder",
            const: "folder",
            isRequired: false,
            isOptional: true,
            isRest: false,
          },
        },
      ],
      optionalParams: true,
    });
  });

  test("optional params with extension", async () => {
    await testRouteResolver("files/[[folder]]/[[id]].json", {
      paramsSchema: [
        {
          name: "folder",
          const: "folder",
          isRequired: false,
          isOptional: true,
          isRest: false,
        },
        {
          name: "id",
          const: "id",
          isRequired: false,
          isOptional: true,
          isRest: false,
        },
      ],
      pathTokens: [
        { orig: "files", base: "files", path: "files", ext: "" },
        {
          orig: "[[folder]]",
          base: "[[folder]]",
          path: "[[folder]]",
          ext: "",
          param: {
            name: "folder",
            const: "folder",
            isRequired: false,
            isOptional: true,
            isRest: false,
          },
        },
        {
          orig: "[[id]].json",
          base: "[[id]]",
          path: "[[id]].json",
          ext: ".json",
          param: {
            name: "id",
            const: "id",
            isRequired: false,
            isOptional: true,
            isRest: false,
          },
        },
      ],
      optionalParams: true,
    });
  });

  test("nested optional params", async () => {
    await testRouteResolver("books/[category]/[[author]]", {
      paramsSchema: [
        {
          name: "category",
          const: "category",
          isRequired: true,
          isOptional: false,
          isRest: false,
        },
        {
          name: "author",
          const: "author",
          isRequired: false,
          isOptional: true,
          isRest: false,
        },
      ],
      pathTokens: [
        { orig: "books", base: "books", path: "books", ext: "" },
        {
          orig: "[category]",
          base: "[category]",
          path: "[category]",
          ext: "",
          param: {
            name: "category",
            const: "category",
            isRequired: true,
            isOptional: false,
            isRest: false,
          },
        },
        {
          orig: "[[author]]",
          base: "[[author]]",
          path: "[[author]]",
          ext: "",
          param: {
            name: "author",
            const: "author",
            isRequired: false,
            isOptional: true,
            isRest: false,
          },
        },
      ],
      optionalParams: false,
    });
  });

  test("rest params", async () => {
    await testRouteResolver("articles/[...path]", {
      paramsSchema: [
        {
          name: "path",
          const: "path",
          isRequired: false,
          isOptional: false,
          isRest: true,
        },
      ],
      pathTokens: [
        { orig: "articles", base: "articles", path: "articles", ext: "" },
        {
          orig: "[...path]",
          base: "[...path]",
          path: "[...path]",
          ext: "",
          param: {
            name: "path",
            const: "path",
            isRequired: false,
            isOptional: false,
            isRest: true,
          },
        },
      ],
      optionalParams: true,
    });
  });

  test("rest params with extension", async () => {
    await testRouteResolver("pages/[...path].html", {
      paramsSchema: [
        {
          name: "path",
          const: "path",
          isRequired: false,
          isOptional: false,
          isRest: true,
        },
      ],
      pathTokens: [
        { orig: "pages", base: "pages", path: "pages", ext: "" },
        {
          orig: "[...path].html",
          base: "[...path]",
          path: "[...path].html",
          ext: ".html",
          param: {
            name: "path",
            const: "path",
            isRequired: false,
            isOptional: false,
            isRest: true,
          },
        },
      ],
      optionalParams: true,
    });
  });
});
