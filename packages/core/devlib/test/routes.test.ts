import { describe, expect, test } from "vitest";

import { pathTokensFactory } from "@/routes";

describe("pathTokensFactory", () => {
  test("no params", () => {
    expect(pathTokensFactory("some/page")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "page",
        ext: "",
        orig: "page",
        path: "page",
      },
    ]);
  });

  test("no params with extension", () => {
    expect(pathTokensFactory("some/page.html")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "page",
        ext: ".html",
        orig: "page.html",
        path: "page.html",
      },
    ]);
  });

  test("required params", () => {
    expect(pathTokensFactory("some/[param]")).toEqual([
      {
        orig: "some",
        base: "some",
        path: "some",
        ext: "",
      },
      {
        orig: "[param]",
        base: "[param]",
        path: "[param]",
        ext: "",
        param: {
          isOptional: false,
          isRequired: true,
          isRest: false,
          name: "param",
          const: "param",
        },
      },
    ]);
  });

  test("required params with extension", () => {
    expect(pathTokensFactory("some/[param].html")).toEqual([
      {
        base: "some",
        path: "some",
        ext: "",
        orig: "some",
      },
      {
        base: "[param]",
        path: "[param].html",
        ext: ".html",
        orig: "[param].html",
        param: {
          isOptional: false,
          isRequired: true,
          isRest: false,
          name: "param",
          const: "param",
        },
      },
    ]);
  });

  test("optional params", () => {
    expect(pathTokensFactory("some/[[param]]")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[[param]]",
        ext: "",
        orig: "[[param]]",
        param: {
          isOptional: true,
          isRequired: false,
          isRest: false,
          name: "param",
          const: "param",
        },
        path: "[[param]]",
      },
    ]);
  });

  test("optional params with extension", () => {
    expect(pathTokensFactory("some/[[param]].html")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[[param]]",
        ext: ".html",
        orig: "[[param]].html",
        param: {
          isOptional: true,
          isRequired: false,
          isRest: false,
          name: "param",
          const: "param",
        },
        path: "[[param]].html",
      },
    ]);
  });

  test("rest params", () => {
    expect(pathTokensFactory("some/[...param]")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[...param]",
        ext: "",
        orig: "[...param]",
        param: {
          isOptional: false,
          isRequired: false,
          isRest: true,
          name: "param",
          const: "param",
        },
        path: "[...param]",
      },
    ]);
  });

  test("rest params with extension", () => {
    expect(pathTokensFactory("some/[...param].html")).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[...param]",
        ext: ".html",
        orig: "[...param].html",
        param: {
          isOptional: false,
          isRequired: false,
          isRest: true,
          name: "param",
          const: "param",
        },
        path: "[...param].html",
      },
    ]);
  });

  test("combined params", () => {
    expect(
      pathTokensFactory("some/[required]/with/[[optional]]/and/[...rest]"),
    ).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[required]",
        ext: "",
        orig: "[required]",
        param: {
          isOptional: false,
          isRequired: true,
          isRest: false,
          name: "required",
          const: "required",
        },
        path: "[required]",
      },
      {
        base: "with",
        ext: "",
        orig: "with",
        path: "with",
      },
      {
        base: "[[optional]]",
        ext: "",
        orig: "[[optional]]",
        param: {
          isOptional: true,
          isRequired: false,
          isRest: false,
          name: "optional",
          const: "optional",
        },
        path: "[[optional]]",
      },
      {
        base: "and",
        ext: "",
        orig: "and",
        path: "and",
      },
      {
        base: "[...rest]",
        ext: "",
        orig: "[...rest]",
        param: {
          isOptional: false,
          isRequired: false,
          isRest: true,
          name: "rest",
          const: "rest",
        },
        path: "[...rest]",
      },
    ]);
  });

  test("combined params with extension", () => {
    expect(
      pathTokensFactory("some/[required]/with/[[optional]]/and/[...rest].html"),
    ).toEqual([
      {
        base: "some",
        ext: "",
        orig: "some",
        path: "some",
      },
      {
        base: "[required]",
        ext: "",
        orig: "[required]",
        param: {
          isOptional: false,
          isRequired: true,
          isRest: false,
          name: "required",
          const: "required",
        },
        path: "[required]",
      },
      {
        base: "with",
        ext: "",
        orig: "with",
        path: "with",
      },
      {
        base: "[[optional]]",
        ext: "",
        orig: "[[optional]]",
        param: {
          isOptional: true,
          isRequired: false,
          isRest: false,
          name: "optional",
          const: "optional",
        },
        path: "[[optional]]",
      },
      {
        base: "and",
        ext: "",
        orig: "and",
        path: "and",
      },
      {
        base: "[...rest]",
        ext: ".html",
        orig: "[...rest].html",
        param: {
          isOptional: false,
          isRequired: false,
          isRest: true,
          name: "rest",
          const: "rest",
        },
        path: "[...rest].html",
      },
    ]);
  });

  test("index prefix replaced with /", () => {
    expect(pathTokensFactory("index")).toEqual([
      {
        base: "index",
        ext: "",
        orig: "index",
        path: "/",
      },
    ]);

    expect(pathTokensFactory("index/[id]")).toEqual([
      {
        base: "index",
        ext: "",
        orig: "index",
        path: "/",
      },
      {
        base: "[id]",
        ext: "",
        orig: "[id]",
        param: {
          isOptional: false,
          isRequired: true,
          isRest: false,
          name: "id",
          const: "id",
        },
        path: "[id]",
      },
    ]);
  });
});
