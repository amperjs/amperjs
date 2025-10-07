import { describe, expect, test } from "vitest";

import {
  createProject,
  extractDefaultExport,
  extractRouteMethods,
} from "@/base-plugin/ast";

describe("extractRouteMethods", () => {
  const project = createProject();

  test("detect methods", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `export default defineRoute(({ GET, POST, PUT, PATCH, DELETE }) => [
          GET(),
          POST(),
          PUT(),
          PATCH(),
          DELETE(),
        ])`,
      ),
    );
    const methods = defaultExport
      ? extractRouteMethods(defaultExport, {
          importName: "test",
          optionalParams: false,
        })
      : [];
    expect(methods).toEqual([
      {
        method: "GET",
        payloadType: undefined,
        responseType: undefined,
      },
      {
        method: "POST",
        payloadType: undefined,
        responseType: undefined,
      },
      {
        method: "PUT",
        payloadType: undefined,
        responseType: undefined,
      },
      {
        method: "PATCH",
        payloadType: undefined,
        responseType: undefined,
      },
      {
        method: "DELETE",
        payloadType: undefined,
        responseType: undefined,
      },
    ]);
  });

  test("with payload type", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `export default defineRoute(({ POST }) => [
        POST<{ id?: number }>(),
      ])`,
      ),
    );
    const methods = defaultExport
      ? extractRouteMethods(defaultExport, {
          importName: "test",
          optionalParams: false,
        })
      : [];
    expect(methods).toEqual([
      {
        method: "POST",
        payloadType: {
          id: "PayloadT1477002244",
          isOptional: false,
          method: "POST",
          responseTypeId: undefined,
          skipValidation: false,
          text: "{ id?: number }",
        },
        responseType: undefined,
      },
    ]);
  });

  test("with payload and response type", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `export default defineRoute(({ POST }) => [
        POST<{ name?: string }, { id: number }>(),
      ])`,
      ),
    );
    const methods = defaultExport
      ? extractRouteMethods(defaultExport, {
          importName: "test",
          optionalParams: false,
        })
      : [];
    expect(methods).toEqual([
      {
        method: "POST",
        payloadType: {
          id: "PayloadT1477002244",
          isOptional: false,
          method: "POST",
          responseTypeId: "ResponseT1477002244",
          skipValidation: false,
          text: "{ name?: string }",
        },
        responseType: {
          id: "ResponseT1477002244",
          method: "POST",
          skipValidation: false,
          text: "{ id: number }",
        },
      },
    ]);
  });

  test("with @skip-validation", ({ task }) => {
    const defaultExport = extractDefaultExport(
      project.createSourceFile(
        `${task.id}.ts`,
        `export default defineRoute(({ POST }) => [
        POST<
          // @skip-validation
          { name?: string }
        >(),
      ])`,
      ),
    );
    const methods = defaultExport
      ? extractRouteMethods(defaultExport, {
          importName: "test",
          optionalParams: false,
        })
      : [];
    expect(methods).toEqual([
      {
        method: "POST",
        payloadType: {
          id: "PayloadT1477002244",
          isOptional: false,
          method: "POST",
          responseTypeId: undefined,
          skipValidation: true,
          text: `
          // @skip-validation
          { name?: string }`,
        },
        responseType: undefined,
      },
    ]);
  });
});
