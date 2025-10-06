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
});
