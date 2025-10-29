import { afterAll, describe, expect, it } from "vitest";

import { setupTestProject } from "../setup";

describe("SolidJS Generator - Route Integration", async () => {
  const {
    //
    withRouteContent,
    defaultContentPatternFor,
    teardown,
  } = await setupTestProject({
    name: "solid",
  });

  afterAll(async () => {
    await teardown();
  });

  describe("Static Routes", () => {
    it("should render index route with welcome template", async () => {
      await withRouteContent("index", [], ({ path, content }) => {
        expect(path).toBe("/");
        expect(content).toMatch("Powered by SolidJS and ready to perform");
      });
    });

    it("should render nested static route with default template", async () => {
      await withRouteContent(
        "about",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("about");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render deeply nested static route with default template", async () => {
      await withRouteContent(
        "blog/posts",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("blog/posts");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render static route with extension", async () => {
      await withRouteContent(
        "blog/index.html",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("blog/index.html");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });
  });

  describe("Required Parameters", () => {
    it("should render route with single required parameter", async () => {
      await withRouteContent(
        "users/[id]",
        ["123"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("users/123");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render route with multiple required parameters", async () => {
      await withRouteContent(
        "posts/[userId]/comments/[commentId]",
        ["456", "789"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("posts/456/comments/789");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should handle numeric parameter values", async () => {
      await withRouteContent(
        "users/[id]",
        ["999"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("users/999");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should handle string parameter values", async () => {
      await withRouteContent(
        "users/[id]",
        ["john-doe"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("users/john-doe");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });
  });

  describe("Optional Parameters", () => {
    it("should render route without optional parameter", async () => {
      await withRouteContent(
        "products/[[category]]",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("products");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render route with optional parameter provided", async () => {
      await withRouteContent(
        "products/[[category]]",
        ["electronics"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("products/electronics");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should handle multiple optional parameters", async () => {
      // Without any parameters
      await withRouteContent(
        "search/[[query]]/[[page]]",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("search");
          expect(content).toMatch(defaultContentPattern);
        },
      );

      // With first parameter only
      await withRouteContent(
        "search/[[query]]/[[page]]",
        ["laptops"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("search/laptops");
          expect(content).toMatch(defaultContentPattern);
        },
      );

      // With both parameters
      await withRouteContent(
        "search/[[query]]/[[page]]",
        ["laptops", "2"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("search/laptops/2");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });
  });

  describe("Rest Parameters", () => {
    it("should render route with rest parameter - single segment", async () => {
      await withRouteContent(
        "docs/[...path]",
        ["getting-started"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("docs/getting-started");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render route with rest parameter - multiple segments", async () => {
      await withRouteContent(
        "docs/[...path]",
        ["api", "reference", "types"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("docs/api/reference/types");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should render route with rest parameter - deeply nested", async () => {
      await withRouteContent(
        "docs/[...path]",
        ["guides", "deployment", "production", "best-practices"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("docs/guides/deployment/production/best-practices");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });
  });

  describe("Combined Parameters", () => {
    it("should handle required + optional parameters", async () => {
      // Without optional
      await withRouteContent(
        "shop/[category]/[[subcategory]]",
        ["electronics"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("shop/electronics");
          expect(content).toMatch(defaultContentPattern);
        },
      );

      // With optional
      await withRouteContent(
        "shop/[category]/[[subcategory]]",
        ["electronics", "laptops"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("shop/electronics/laptops");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should handle required + rest parameters", async () => {
      await withRouteContent(
        "files/[bucket]/[...path]",
        ["my-bucket", "folder", "subfolder", "file.txt"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("files/my-bucket/folder/subfolder/file.txt");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });

    it("should handle complex parameter combinations", async () => {
      // With optional
      await withRouteContent(
        "admin/[tenant]/resources/[[type]]/[...path]",
        ["acme", "users", "active", "list"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("admin/acme/resources/users/active/list");
          expect(content).toMatch(defaultContentPattern);
        },
      );

      // Without optional (skipped optional param)
      await withRouteContent(
        "admin/[tenant]/resources/[[type]]/[...path]",
        ["acme", "active", "list"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("admin/acme/resources/active/list");
          expect(content).toMatch(defaultContentPattern);
        },
      );
    });
  });

  describe("Route Specificity", () => {
    it("should prioritize static routes over dynamic routes", async () => {
      await withRouteContent(
        "priority/profile",
        [],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("priority/profile");
          expect(content).toMatch(defaultContentPattern);
          expect(content).not.toMatch(
            defaultContentPatternFor("priority/[id]"),
          );
        },
      );
    });

    it("should match dynamic route for non-static values", async () => {
      await withRouteContent(
        "priority/[id]",
        ["123"],
        ({ path, content, defaultContentPattern }) => {
          expect(path).toBe("priority/123");
          expect(content).toMatch(defaultContentPattern);
          expect(content).not.toMatch(
            defaultContentPatternFor("priority/profile"),
          );
        },
      );
    });
  });
});
