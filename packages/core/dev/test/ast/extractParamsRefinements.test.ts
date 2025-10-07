import { describe, expect, test } from "vitest";

import {
  createProject,
  extractDefaultExport,
  extractParamsRefinements,
} from "@/base-plugin/ast";

describe("extractParamsRefinements", () => {
  const project = createProject();

  test("no refinements", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        "export default defineRoute<Params>()",
      ),
    );
    const refinements = defaultExport
      ? extractParamsRefinements(defaultExport)
      : [];
    expect(refinements).toBeUndefined();
  });

  test("single refinement", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        "export default defineRoute<Params<number>>()",
      ),
    );
    const refinements = defaultExport
      ? extractParamsRefinements(defaultExport)
      : [];
    expect(refinements).toEqual([
      {
        index: 0,
        text: "number",
      },
    ]);
  });

  test("multiple refinements", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `export default defineRoute<Params<number, "a" | "b">>()`,
      ),
    );
    const refinements = defaultExport
      ? extractParamsRefinements(defaultExport)
      : [];
    expect(refinements).toEqual([
      {
        index: 0,
        text: "number",
      },
      {
        index: 1,
        text: `"a" | "b"`,
      },
    ]);
  });

  test("with type references", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `type T = string; export default defineRoute<Params<T>>()`,
      ),
    );
    const refinements = defaultExport
      ? extractParamsRefinements(defaultExport)
      : [];
    expect(refinements).toEqual([
      {
        index: 0,
        text: "T",
      },
    ]);
  });
});
