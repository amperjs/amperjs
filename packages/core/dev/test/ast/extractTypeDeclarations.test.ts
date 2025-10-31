import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import { createProject, extractTypeDeclarations } from "@/base-plugin/ast";

describe("extractTypeDeclarations", () => {
  const project = createProject();

  describe("imports", () => {
    test("typeOnly imports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import type { A } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          importDeclaration: {
            alias: undefined,
            name: "A",
            path: "./a",
          },
          text: `import type { A } from "./a";`,
        },
      ]);
    });

    test("typeOnly aliased imports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import type { A as B } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          importDeclaration: {
            alias: "B",
            name: "A",
            path: "./a",
          },
          text: `import type { A as B } from "./a";`,
        },
      ]);
    });

    test("typeOnly combined imports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import type { A, B as C } from "./x"`,
      );
      expect(extractTypeDeclarations(sourceFile)).toEqual([
        [
          {
            importDeclaration: {
              alias: undefined,
              name: "A",
              path: "./x",
            },
            text: `import type { A } from "./x";`,
          },
          {
            importDeclaration: {
              alias: "C",
              name: "B",
              path: "./x",
            },
            text: `import type { B as C } from "./x";`,
          },
        ],
      ]);
    });

    test("default imports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import type A from "./a"`,
      );
      expect(extractTypeDeclarations(sourceFile)).toEqual([
        [
          {
            importDeclaration: {
              name: "A",
              path: "./a",
            },
            text: `import type A from "./a";`,
          },
        ],
      ]);
    });

    test("mixed imports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import { type A, type B as C, x } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          importDeclaration: {
            alias: undefined,
            name: "A",
            path: "./a",
          },
          text: `import type { A } from "./a";`,
        },
        {
          importDeclaration: {
            alias: "C",
            name: "B",
            path: "./a",
          },
          text: `import type { B as C } from "./a";`,
        },
      ]);
    });

    test("with path resolver", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `import type { A } from "./a"`,
      );
      expect(
        extractTypeDeclarations(sourceFile, {
          relpathResolver: (path) => `/app/${path}`,
        }),
      ).toEqual([
        [
          {
            importDeclaration: {
              alias: undefined,
              name: "A",
              path: "/app/./a",
            },
            text: `import type { A } from "/app/./a";`,
          },
        ],
      ]);
    });

    test("with referenced files", () => {
      const sourceFile = project.addSourceFileAtPath(
        resolve(
          import.meta.dirname,
          "../@fixtures/ast/extractTypeDeclarations/imports/with-referenced-files.ts",
        ),
      );

      const [typeDeclarations, referencedFiles] = extractTypeDeclarations(
        sourceFile,
        { withReferencedFiles: true },
      );

      expect(typeDeclarations).toEqual([
        {
          importDeclaration: {
            alias: undefined,
            name: "ParsedPath",
            path: "node:path",
          },
          text: `import type { ParsedPath } from "node:path";`,
        },
      ]);

      expect(referencedFiles?.[0]).toMatch(/node\/path.d.ts$/);
    });
  });

  describe("exports", () => {
    test("typeOnly exports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export type A = "a"; type B = "b"; export type { B }`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          text: `export type A = "a";`,
          typeAliasDeclaration: {
            name: "A",
          },
        },
        {
          text: `type B = "b";`,
          typeAliasDeclaration: {
            name: "B",
          },
        },
        {
          exportDeclaration: {
            alias: "B",
            name: "B",
          },
          text: "export type { B };",
        },
      ]);
    });

    test("typeOnly aliased exports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export type A = "a"; export type { A  as  B }`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          text: `export type A = "a";`,
          typeAliasDeclaration: {
            name: "A",
          },
        },
        {
          exportDeclaration: {
            alias: "B",
            name: "A",
          },
          text: "export type { A as B };",
        },
      ]);
    });

    test("mixed exports", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export { type A as B, type C, x }`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          exportDeclaration: {
            alias: "B",
            name: "A",
            path: undefined,
          },
          text: "export type { A as B };",
        },
        {
          exportDeclaration: {
            alias: "C",
            name: "C",
            path: undefined,
          },
          text: "export type { C };",
        },
      ]);
    });

    test("typeOnly export from path", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export type {  A  } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          exportDeclaration: {
            alias: "A",
            name: "A",
            path: "./a",
          },
          text: `export type { A } from "./a";`,
        },
      ]);
    });

    test("mixed export from path", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export { type A, type B as C, x } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile);
      expect(typeDeclarations).toEqual([
        {
          exportDeclaration: {
            alias: "A",
            name: "A",
            path: "./a",
          },
          text: `export type { A } from "./a";`,
        },
        {
          exportDeclaration: {
            alias: "C",
            name: "B",
            path: "./a",
          },
          text: `export type { B as C } from "./a";`,
        },
      ]);
    });

    test("export from path with pathResolver", ({ task }) => {
      const sourceFile = project.createSourceFile(
        `${task.id}.ts`,
        `export type { A } from "./a"`,
      );
      const [typeDeclarations] = extractTypeDeclarations(sourceFile, {
        relpathResolver: (path) => path.replace(".", ""),
      });
      expect(typeDeclarations).toEqual([
        {
          exportDeclaration: {
            alias: "A",
            name: "A",
            path: "/a",
          },
          text: `export type { A } from "/a";`,
        },
      ]);
    });

    test("export from path with referencedFiles", () => {
      const sourceFile = project.addSourceFileAtPath(
        resolve(
          import.meta.dirname,
          "../@fixtures/ast/extractTypeDeclarations/exports/with-referenced-files.ts",
        ),
      );
      const [typeDeclarations, referencedFiles] = extractTypeDeclarations(
        sourceFile,
        { withReferencedFiles: true },
      );
      expect(typeDeclarations).toEqual([
        {
          exportDeclaration: {
            alias: "ParsedPath",
            name: "ParsedPath",
            path: "node:path",
          },
          text: `export type { ParsedPath } from "node:path";`,
        },
      ]);
      expect(referencedFiles?.[0]).toMatch(/node\/path.d.ts$/);
    });
  });

  test("types", ({ task }) => {
    const sourceFile = project.createSourceFile(
      `${task.id}.ts`,
      `type A = "A"; export type B = A & { C: "C" }`,
    );
    const [typeDeclarations] = extractTypeDeclarations(sourceFile);
    expect(typeDeclarations).toEqual([
      {
        text: `type A = "A";`,
        typeAliasDeclaration: {
          name: "A",
        },
      },
      {
        text: `export type B = A & { C: "C" }`,
        typeAliasDeclaration: {
          name: "B",
        },
      },
    ]);
  });

  test("interfaces", ({ task }) => {
    const sourceFile = project.createSourceFile(
      `${task.id}.ts`,
      `interface A {}; export interface B extends A {}`,
    );
    const [typeDeclarations] = extractTypeDeclarations(sourceFile);
    expect(typeDeclarations).toEqual([
      {
        interfaceDeclaration: {
          name: "A",
        },
        text: "interface A {}",
      },
      {
        interfaceDeclaration: {
          name: "B",
        },
        text: "export interface B extends A {}",
      },
    ]);
  });

  test("enums", ({ task }) => {
    const sourceFile = project.createSourceFile(
      `${task.id}.ts`,
      `enum A {}; export enum B {}`,
    );
    const [typeDeclarations] = extractTypeDeclarations(sourceFile);
    expect(typeDeclarations).toEqual([
      {
        enumDeclaration: {
          name: "A",
        },
        text: "enum A {}",
      },
      {
        enumDeclaration: {
          name: "B",
        },
        text: "export enum B {}",
      },
    ]);
  });
});
