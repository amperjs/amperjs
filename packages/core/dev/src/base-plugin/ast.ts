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

export const extractDefaultExport = (
  sourceFile: SourceFile,
): CallExpression | undefined => {
  const [defaultExport] = sourceFile
    .getExportAssignments()
    .flatMap((exportAssignment) => {
      if (exportAssignment.isExportEquals()) {
        return [];
      }
      const callExpression = exportAssignment.getExpression();
      return callExpression.isKind(SyntaxKind.CallExpression)
        ? [callExpression]
        : [];
    });
  return defaultExport;
};

export const extractParamsRefinements = (
  callExpression: CallExpression,
):
  | Array<{
      index: number;
      text: string;
    }>
  | undefined => {
  const [firstGeneric] = extractGenerics(callExpression);

  if (!firstGeneric?.node.isKind(SyntaxKind.TypeReference)) {
    return;
  }

  const typeArguments = firstGeneric.node.getTypeArguments();

  if (!typeArguments.length) {
    return;
  }

  return typeArguments.map((node, index) => {
    return {
      index,
      text: node.getText(),
    };
  });
};

export const extractRouteMethods = (
  callExpression: CallExpression,
  route: Pick<ApiRoute, "importName" | "optionalParams">,
): Array<{
  method: HTTPMethod;
  payloadType: (PayloadType & { text: string }) | undefined;
  responseType: (ResponseType & { text: string }) | undefined;
}> => {
  const funcDeclaration =
    callExpression.getFirstChildByKind(SyntaxKind.ArrowFunction) ||
    callExpression.getFirstChildByKind(SyntaxKind.FunctionExpression);

  if (!funcDeclaration) {
    return [];
  }

  const arrayLiteralExpression = funcDeclaration.getFirstChildByKind(
    SyntaxKind.ArrayLiteralExpression,
  );

  if (!arrayLiteralExpression) {
    return [];
  }

  const callExpressions: Array<[CallExpression, HTTPMethod]> = [];

  for (const e of arrayLiteralExpression.getChildrenOfKind(
    SyntaxKind.CallExpression,
  )) {
    const name = e.getExpression().getText() as HTTPMethod;
    if (HTTPMethods[name]) {
      callExpressions.push([e, name]);
    }
  }

  const methods = [];

  const skipValidationFilter = (e: string) => /@skip-validation/.test(e);

  for (const [callExpression, method] of callExpressions) {
    const [payloadGeneric, responseGeneric] = extractGenerics(callExpression);

    const payloadText = payloadGeneric?.node
      ? payloadGeneric.node.getChildren().length === 0
        ? "{}"
        : payloadGeneric.node.getFullText()
      : undefined;

    const responseText = responseGeneric?.node.getText();

    const responseType = responseText
      ? {
          id: ["ResponseT", crc(route.importName + method)].join(""),
          method,
          skipValidation: responseGeneric?.comments
            ? responseGeneric.comments.some(skipValidationFilter)
            : false,
          text: ["never", "object"].includes(responseText)
            ? "{}"
            : responseText,
        }
      : undefined;

    const payloadType = payloadText
      ? {
          id: ["PayloadT", crc(route.importName + method)].join(""),
          responseTypeId: responseType?.id,
          method,
          skipValidation: payloadGeneric?.comments
            ? payloadGeneric.comments.some(skipValidationFilter)
            : false,
          isOptional: payloadText
            ? payloadText === "{}" || route.optionalParams
            : true,
          text: payloadText,
        }
      : undefined;

    methods.push({
      method,
      payloadType,
      responseType,
    });
  }

  return methods;
};
