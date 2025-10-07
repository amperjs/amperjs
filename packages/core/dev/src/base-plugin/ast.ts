import crc from "crc/crc32";
import {
  type CallExpression,
  type Identifier,
  type Node,
  Project,
  type ProjectOptions,
  type SourceFile,
  SyntaxKind,
} from "ts-morph";

import { type HTTPMethod, HTTPMethods } from "@oreum/api";
import type {
  ApiRoute,
  PayloadType,
  ResponseType,
  TypeDeclaration,
} from "@oreum/devlib";

type PathResolver = (path: string) => string;

export const createProject = (opts?: ProjectOptions) => new Project(opts);

export const resolveRouteSignature = async (
  route: Pick<ApiRoute, "importName" | "fileFullpath" | "optionalParams">,
  opts?: {
    relpathResolver?: PathResolver;
    sourceFile?: SourceFile;
    withReferencedFiles?: boolean;
  },
) => {
  const {
    sourceFile = createProject().addSourceFileAtPath(route.fileFullpath),
  } = { ...opts };

  const [typeDeclarations, referencedFiles] = extractTypeDeclarations(
    sourceFile,
    opts,
  );

  const defaultExport = extractDefaultExport(sourceFile);

  const paramsRefinements = defaultExport
    ? extractParamsRefinements(defaultExport)
    : undefined;

  const methods = defaultExport
    ? extractRouteMethods(defaultExport, route)
    : [];

  const payloadTypes = methods.flatMap((e) => {
    return e.payloadType ? [e.payloadType] : [];
  });

  const responseTypes = methods.flatMap((e) => {
    return e.responseType ? [e.responseType] : [];
  });

  return {
    typeDeclarations,
    paramsRefinements,
    methods: methods.map((e) => e.method),
    payloadTypes,
    responseTypes,
    referencedFiles,
  };
};

