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

export const extractTypeDeclarations = (
  sourceFile: SourceFile,
  opts?: {
    relpathResolver?: PathResolver;
    withReferencedFiles?: boolean;
  },
): [d: Array<TypeDeclaration>, f?: Array<string>] => {
  const declarations: Array<TypeDeclaration> = [];

  const referencedFiles: Array<string> | undefined = opts?.withReferencedFiles
    ? []
    : undefined;

  for (const declaration of sourceFile.getImportDeclarations()) {
    const modulePath = declaration.getModuleSpecifierValue();

    const path = /^\.\.?\/?/.test(modulePath)
      ? opts?.relpathResolver
        ? opts.relpathResolver(modulePath)
        : modulePath
      : modulePath;

    const typeOnlyDeclaration = declaration.isTypeOnly();

    const defaultImport = typeOnlyDeclaration
      ? declaration.getDefaultImport()
      : undefined;

    if (defaultImport) {
      const name = defaultImport.getText();
      const text = `import type ${name} from "${path}";`;
      declarations.push({
        importDeclaration: {
          name,
          path,
        },
        text,
      });
      if (referencedFiles) {
        referencedFiles.push(...getReferencedFiles(defaultImport));
      }
    }

    for (const namedImport of declaration.getNamedImports()) {
      if (namedImport.isTypeOnly() || typeOnlyDeclaration) {
        const nameNode = namedImport.getNameNode();
        const name = nameNode.getText();
        const alias = namedImport.getAliasNode()?.getText();
        const nameText = alias ? `${name} as ${alias}` : name;

        declarations.push({
          importDeclaration: {
            name,
            alias,
            path,
          },
          text: `import type { ${nameText} } from "${path}";`,
        });

        if (referencedFiles) {
          if (nameNode.isKind(SyntaxKind.Identifier)) {
            referencedFiles.push(...getReferencedFiles(nameNode));
          }
        }
      }
    }
  }

  for (const declaration of sourceFile.getTypeAliases()) {
    const name = declaration.getName();
    const text = declaration.getFullText().trim();
    declarations.push({
      typeAliasDeclaration: { name },
      text,
    });
  }

  for (const declaration of sourceFile.getInterfaces()) {
    const name = declaration.getName();
    const text = declaration.getFullText().trim();
    declarations.push({
      interfaceDeclaration: { name },
      text,
    });
  }

  for (const declaration of sourceFile.getEnums()) {
    const name = declaration.getName();
    const text = declaration.getFullText().trim();
    declarations.push({
      enumDeclaration: { name },
      text,
    });
  }

  for (const declaration of sourceFile.getExportDeclarations()) {
    const typeOnlyDeclaration = declaration.isTypeOnly();

    const modulePath = declaration.getModuleSpecifierValue();

    const path = modulePath
      ? /^\.\.?\/?/.test(modulePath)
        ? opts?.relpathResolver
          ? opts.relpathResolver(modulePath)
          : modulePath
        : modulePath
      : undefined;

    for (const namedExport of declaration.getNamedExports()) {
      if (namedExport.isTypeOnly() || typeOnlyDeclaration) {
        const nameNode = namedExport.getNameNode();
        const name = nameNode.getText();
        const alias = namedExport.getAliasNode()?.getText();
        const nameText = alias ? `${name} as ${alias}` : name;

        declarations.push({
          exportDeclaration: {
            name,
            alias: alias ?? name,
            path,
          },
          text: path
            ? `export type { ${nameText} } from "${path}";`
            : `export type { ${nameText} };`,
        });

        if (referencedFiles) {
          if (nameNode.isKind(SyntaxKind.Identifier)) {
            referencedFiles.push(...getReferencedFiles(nameNode));
          }
        }
      }
    }
  }

  return referencedFiles
    ? [declarations, [...new Set<string>(referencedFiles)]]
    : [declarations];
};

const getReferencedFiles = (importIdentifier: Identifier): Array<string> => {
  // ambient modules may have declarations in multiple files
  const declarations =
    importIdentifier //
      ?.getSymbol()
      ?.getAliasedSymbol()
      ?.getDeclarations() || [];

  return declarations.flatMap((e) => {
    const sourceFile = e.getSourceFile();
    return sourceFile //
      ? [sourceFile.getFilePath()]
      : [];
  });
};

const extractGenerics = (
  callExpression: CallExpression,
): Array<{ node: Node; comments: Array<string> }> => {
  return callExpression.getTypeArguments().map((node) => {
    return {
      node,
      comments: node
        .getLeadingCommentRanges()
        .map((range) => range.getText().trim()),
    };
  });
};
