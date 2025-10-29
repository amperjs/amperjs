import { afterAll, describe, expect, it } from "vitest";

import { setupTestProject, testRoutes } from "../setup";

describe("React Generator - Link Component", async () => {
  // Generate template from test cases
  const navigationLinks = testRoutes.map((link) => {
    const paramsStr = link.params.length
      ? `, ${link.params.map((p) => JSON.stringify(p)).join(", ")}`
      : "";
    return `
      <Link to={["${link.name}"${paramsStr}]} data-testid="${link.id}">
        ${link.label}
      </Link>
    `;
  });

  const navigationTemplate = `
    import Link from "@front/components/Link";
    export default () => {
      return (
        <div data-testid="navigation-page">
          <h1>Navigation Links Test</h1>
          <ol>
            ${navigationLinks.map((e) => `<li>${e}</li>`).join("")}
          </ol>
        </div>
      );
    }
  `;

  const { withRouteContent, teardown } = await setupTestProject({
    name: "react",
    options: {
      templates: {
        navigation: navigationTemplate,
      },
    },
  });

  afterAll(async () => {
    await teardown();
  });

  describe("Link Rendering", () => {
    it("should render all links with correct hrefs", async () => {
      await withRouteContent("navigation", [], async ({ content, page }) => {
        // Verify page renders
        expect(content).toMatch("Navigation Links Test");
        expect(content).toMatch('data-testid="navigation-page"');

        // Use Playwright's locator API to find and verify links
        for (const link of testRoutes) {
          const locator = page.locator(`a[data-testid="${link.id}"]`);

          // Verify link exists and is visible
          const isVisible = await locator.isVisible();
          expect(isVisible).toBe(true);

          // Verify href attribute
          const href = await locator.getAttribute("href");
          expect(href).toBe(link.href);

          // Verify text content
          const text = await locator.textContent();
          expect(text).toBe(link.label);
        }

        // Verify total link count
        const allLinks = page.locator("a");
        const count = await allLinks.count();
        expect(count).toBe(testRoutes.length);
      });
    });
  });
});
