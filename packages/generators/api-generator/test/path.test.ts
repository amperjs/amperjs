import { describe, expect, test } from "vitest";

import { pathTokensFactory } from "@oreum/devlib";

import { pathFactory } from "@/factory";

describe("pathFactory", () => {
  test("no params", () => {
    expect(pathFactory(pathTokensFactory("some/page"))).toEqual("some/page");
  });

  test("no params with extension", () => {
    expect(pathFactory(pathTokensFactory("some/page.html"))).toEqual(
      "some/page.html",
    );
  });

  test("required params", () => {
    expect(pathFactory(pathTokensFactory("some/[param]"))).toEqual(
      "some/:param",
    );
  });

  test("required params with extension", () => {
    expect(pathFactory(pathTokensFactory("some/[param].html"))).toEqual(
      "some/:param.html",
    );
  });

  test("optional params", () => {
    expect(pathFactory(pathTokensFactory("some/[[param]]"))).toEqual(
      "some/{/:param}",
    );
  });

  test("optional params with extension", () => {
    expect(pathFactory(pathTokensFactory("some/[[param]].html"))).toEqual(
      "some/{/:param.html}",
    );
  });

  test("rest params", () => {
    expect(pathFactory(pathTokensFactory("some/[...param]"))).toEqual(
      "some/{*param}",
    );
  });

  test("rest params with extension", () => {
    expect(pathFactory(pathTokensFactory("some/[...param].html"))).toEqual(
      "some/{*param}.html",
    );
  });

  test("combined params", () => {
    expect(
      pathFactory(
        pathTokensFactory("some/[required]/with/[[optional]]/and/[...rest]"),
      ),
    ).toEqual("some/:required/with/{/:optional}/and/{*rest}");
  });

  test("combined params with extension", () => {
    expect(
      pathFactory(
        pathTokensFactory(
          "some/[required]/with/[[optional]]/and/[...rest].html",
        ),
      ),
    ).toEqual("some/:required/with/{/:optional}/and/{*rest}.html");
  });

  test("index prefix replaced with /", () => {
    expect(pathFactory(pathTokensFactory("index"))).toEqual("");
    expect(pathFactory(pathTokensFactory("index/[id]"))).toEqual(":id");
  });
});
