import crc from "crc/crc32";
import Type from "typebox";

import {
  type ApiRoute,
  type PathToken,
  type PayloadType,
  type PluginOptionsResolved,
  type ResponseType,
  typeboxLiteralText,
} from "@oreum/devlib";

import type {
  JsonSchema,
  OpenAPIOperation,
  OpenAPIParameter,
  OpenAPIPaths,
  OpenAPIRequestBody,
  OpenAPIResponse,
} from "./types";

export default (pluginOptions: PluginOptionsResolved) => {
  const jsonSchemaBuilder = (text: string) => {
    return Type.Script(
      typeboxLiteralText(text, pluginOptions),
    ) as unknown as JsonSchema;
  };

  // Generate unique component ID
  const generateComponentId = (
    route: ApiRoute,
    type: ApiRoute["params"] | PayloadType | ResponseType,
    propName?: string,
  ): string => {
    const suffix = propName
      ? `_${propName.replace(/[^\w.-]/g, "_")}${crc(propName)}`
      : "";
    return `${route.importName}_${type.id + suffix}`;
  };

  // Generate unique component Path
  const generateComponentPath = (
    section: "parameters" | "schemas",
    route: ApiRoute,
    type: ApiRoute["params"] | PayloadType | ResponseType,
    propName?: string,
  ): string => {
    return [
      "#",
      "components",
      section,
      generateComponentId(route, type, propName),
    ].join("/");
  };

  /**
   * Path Variation Generator
   *   variations for a/b/c:
   *   [ a/b/c ]
   *   variations for a/b/[c]:
   *   [ a/b/{c} ]
   *   variations for a/b/[[c]]:
   *   [ a/b/{c}, a/b ]
   *   variations for a/[b]/[[c]]:
   *   [ a/{b}/{c}, a/{b} ]
   *   variations for a/[[b]]/[[c]]:
   *   [ a/{b}/{c}, a/{b}, a ]
   * */
  const generatePathVariations = (route: ApiRoute) => {
    return route.pathTokens
      .flatMap((e, i) => {
        const next = route.pathTokens[i + 1];
        return !next || next.param?.isOptional || next.param?.isRest
          ? [generateSinglePath([...route.pathTokens.slice(0, i), e])]
          : [];
      })
      .sort(
        /**
         * Sorting paths by sections length in reverse order,
         * so ones with more sections - more specific - goes first.
         *
         * WARN: without this sorting, more specific paths
         * may override schemas for less specific ones.
         *
         * Example: Without proper sorting:
         *   /search                 (least specific)
         *   /search/{type}          (medium specific)
         *   /search/{type}/{page}   (most specific)
         *
         * Would cause the more specific /search/{type}/{page} path to OVERRIDE
         * schemas for less specific /search/{type} and /search.
         *
         * Correct order (most specific first):
         *   /search/{type}/{page}
         *   /search/{type}
         *   /search
         *
         * */
        (a, b) => b.split("/").length - a.split("/").length,
      );
  };

  const generateSinglePath = (tokens: PathToken[]): string => {
    return tokens
      .flatMap((token, i) => {
        if (token.param) {
          if (token.param.isRest) {
            return [`{${token.param.name}*}`];
          }
          return [`{${token.param.name}}`];
        }
        if (i === 0) {
          return token.base === "index" //
            ? ["/"]
            : ["", token.base];
        }
        return [token.base];
      })
      .join("/")
      .replace(/\n+/g, "")
      .replace(/\+/g, "\\\\+");
  };

  // Generate path parameters using component references
  const generatePathParameters = (
    route: ApiRoute,
    openapiPath: string,
  ): Array<OpenAPIParameter> | undefined => {
    const parameters = route.params.resolvedType?.properties?.flatMap(
      ({ name }) => {
        return new RegExp(`\\{${name}\\*?\\}`).test(openapiPath)
          ? [
              {
                $ref: generateComponentPath(
                  "parameters",
                  route,
                  route.params,
                  name,
                ),
              },
            ]
          : [];
      },
    );
    return parameters?.length //
      ? parameters
      : undefined;
  };

  // Generate request body
  const generateRequestBody = (
    route: ApiRoute,
    method: string,
  ): OpenAPIRequestBody | undefined => {
    const payloadType = route.payloadTypes.find((p) => p.method === method);

    if (!payloadType?.resolvedType) {
      return undefined;
    }

    return {
      required: !payloadType.isOptional,
      content: {
        "application/json": {
          schema: {
            $ref: generateComponentPath("schemas", route, payloadType),
          },
        },
      },
    };
  };

  // Generate responses
  const generateResponses = (
    route: ApiRoute,
    method: string,
  ): Record<string, OpenAPIResponse> => {
    const responseType = route.responseTypes.find((r) => r.method === method);

    if (!responseType?.resolvedType) {
      return { "200": { description: "Success" } };
    }

    return {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              $ref: generateComponentPath("schemas", route, responseType),
            },
          },
        },
      },
    };
  };

  // Generate component schemas for a route
  const generateComponentSchemas = (
    route: ApiRoute,
  ): {
    parameters: Record<string, OpenAPIParameter>;
    schemas: Record<string, JsonSchema>;
  } => {
    const {
      //
      parameters,
      schemas,
    }: ReturnType<typeof generateComponentSchemas> = {
      parameters: {},
      schemas: {},
    };

    if (route.params.resolvedType) {
      for (const { name, text } of route.params.resolvedType.properties || []) {
        parameters[generateComponentId(route, route.params, name)] = {
          name,
          in: "path",
          required: true,
          schema: jsonSchemaBuilder(text),
        };
      }
    }

    for (const type of route.payloadTypes) {
      if (["GET", "DELETE"].includes(type.method)) {
        for (const prop of type.resolvedType?.properties || []) {
          schemas[
            generateComponentId(
              // generating a schema for every property
              route,
              type,
              prop.name,
            )
          ] = jsonSchemaBuilder(prop.text);
        }
      } else if (type.resolvedType) {
        schemas[generateComponentId(route, type)] = jsonSchemaBuilder(
          type.resolvedType.text,
        );
      }
    }

    for (const type of route.responseTypes) {
      if (type.resolvedType) {
        schemas[generateComponentId(route, type)] = jsonSchemaBuilder(
          type.resolvedType.text,
        );
      }
    }

    return { parameters, schemas };
  };

  // Generate paths for a route
  const generateRoutePaths = (route: ApiRoute): OpenAPIPaths => {
    const paths: OpenAPIPaths = {};

    for (const path of generatePathVariations(route)) {
      for (const method of route.methods) {
        const operation: OpenAPIOperation = {
          responses: generateResponses(route, method),
        };

        const parameters = generatePathParameters(route, path);

        if (parameters) {
          operation.parameters = parameters;
        }

        if (["GET", "DELETE"].includes(method)) {
          for (const payloadType of route.payloadTypes.filter(
            (e) => e.method === method,
          )) {
            for (const prop of payloadType.resolvedType?.properties || []) {
              if (!operation.parameters) {
                operation.parameters = [];
              }
              operation.parameters.push({
                name: prop.name,
                in: "query",
                required: !prop.optional,
                schema: {
                  $ref: generateComponentPath(
                    "schemas",
                    route,
                    payloadType,
                    prop.name,
                  ),
                },
              });
            }
          }
        } else {
          const requestBody = generateRequestBody(route, method);
          if (requestBody) {
            operation.requestBody = requestBody;
          }
        }

        if (!paths[path]) {
          paths[path] = {};
        }

        paths[path][method.toLowerCase()] = operation;
      }
    }

    return paths;
  };

  const generateOpenAPISchema = (routes: ApiRoute[]) => {
    const { components, paths } = routes
      .sort(
        /**
         * Sorting routes by path sections length in reverse order,
         * so ones with more sections - more specific - goes first.
         * */
        (a, b) => b.name.split("/").length - a.name.split("/").length,
      )
      .reduce(
        (acc, route) => {
          const paths = generateRoutePaths(route);
          const { parameters, schemas } = generateComponentSchemas(route);
          return {
            paths: { ...acc.paths, ...paths },
            components: {
              parameters: { ...acc.components.parameters, ...parameters },
              schemas: { ...acc.components.schemas, ...schemas },
            },
          };
        },
        {
          paths: {},
          components: {
            parameters: {},
            schemas: {},
          },
        },
      );

    return {
      paths,
      components,
    };
  };

  return {
    generateComponentId,
    generateComponentPath,
    generatePathVariations,
    generateOpenAPISchema,
  };
};
