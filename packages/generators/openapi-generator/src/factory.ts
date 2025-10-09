// import { Compile, TypeBox } from "@sinclair/typemap";
// import YAML from "yaml";

import type { GeneratorFactory, RouteResolverEntry } from "@oreum/devlib";

// type JsonSchema = {
//   properties?: Record<string, Record<string, unknown>>;
//   patternProperties?: Record<string, Record<string, unknown>>;
//   required: Array<string>;
// };

// type JsonSchemaSet = { allOf: Array<JsonSchema> };

type OpenapiOperation =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options"
  | "trace";

type OpenapiOperationSignature = {
  parameters?: Array<OpenapiRefParameter>;
  requestBody?: OpenapiRequestBody;
  responses?: Record<
    number, // response code
    {
      description: string;
      content: Record<
        string, // content type
        {
          schema: { $ref: string } | Record<string, unknown>;
        }
      >;
    }
  >;
};

// type OpenapiParameter = {
//   name: string;
//   in: "path" | "query";
//   required?: boolean;
//   schema: unknown;
// };

type OpenapiRefParameter = { $ref: string };

type OpenapiRequestBody = {
  required: boolean;
  content: Record<
    string,
    {
      schema: { $ref: string };
    }
  >;
};

type OpenapiPathSignature = Partial<
  Record<OpenapiOperation, OpenapiOperationSignature>
>;

export type OpenapiOptions = {
  outfile: string;
  openapi: `3.1.${number}`;
  info: {
    title: string;
    version: string;
    summary?: string;
    description?: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      identifier?: string;
      url?: string;
    };
  };
  servers: {
    url: string;
    description?: string;
  }[];
};
// const CONTENT_TYPE_REGEX = /.*@content-type:(\s+)?([\w\d.\-/]+).*/s;

// const ALTERNATE_RESPONSE_REGEX =
//   /.*@alternate-response:(\s+)?(\d+)\s+([^\s]+)(.+)?/s;

export const factory: GeneratorFactory<OpenapiOptions> = async (
  _options,
  openapiOptions: OpenapiOptions,
) => {
  const { outfile, ...baseSpec } = openapiOptions;

  const generateSchemas = async (entries: Array<RouteResolverEntry>) => {
    const spec = {
      ...JSON.parse(JSON.stringify(baseSpec)),
      paths: {},
      components: {
        parameters: {},
        schemas: {},
      },
    };

    for (const { kind } of entries) {
      if (kind !== "api") {
        continue;
      }

      let paths: Record<string, OpenapiPathSignature> | undefined;
      let components: Record<"parameters" | "schemas", unknown> | undefined;

      // try {
      //   const file = [
      //     libFilePath("openapi", route, { appRoot, sourceFolder }),
      //     new Date().getTime(), // needed to force re-import cached files
      //   ].join("?");
      //   await import(file, { with: { type: "json" } }).then(
      //     ({ default: json }) => {
      //       paths = json.paths;
      //       components = json.components;
      //     },
      //   );
      // } catch (e) {}

      if (!paths) {
        continue;
      }

      Object.assign(spec.paths, paths);

      if (components) {
        Object.assign(spec.components.parameters, components.parameters);
        Object.assign(spec.components.schemas, components.schemas);
      }
    }

    // const output = /ya?ml/.test(outfile)
    //   ? YAML.stringify(spec)
    //   : JSON.stringify(spec);

    // await generateFile(outfile, output);
  };

  return {
    async watchHandler(entries) {
      await generateSchemas(entries);
    },
  };
};

// export const generateOpenapiSpec = (entry: ParsedEntry) => {
//   const { apiRoute, types, resolvedTypes } = entry;
//
//   if (!apiRoute || !resolvedTypes) {
//     return;
//   }
//
//   const jsonSchema = TypeBox<string>(
//     resolvedTypes.map((e) => e.fullText).join(";\n"),
//   );
//
//   const jsonSchemas = extractVariableStatements(jsonSchema).reduce(
//     (a: Record<string, VariableStatement>, e) => {
//       a[e.name] = e;
//       return a;
//     },
//     {},
//   );
//
//   const openapiParameters: Record<string, OpenapiParameter> = {};
//   const openapiSchemas: Record<string, Record<string, unknown>> = {};
//   const openapiPaths: Record<string, OpenapiPathSignature> = {};
//
//   /**
//     variations for a/b/c:
//     [ a/b/c ]
//     variations for a/b/[c]:
//     [ a/b/{c} ]
//     variations for a/b/[[c]]:
//     [ a/b/{c}, a/b ]
//     variations for a/[b]/[[c]]:
//     [ a/{b}/{c}, a/{b} ]
//     variations for a/[[b]]/[[c]]:
//     [ a/{b}/{c}, a/{b}, a ]
//    * */
//   const pathVariations: Array<Array<PathToken>> = route.pathTokens.flatMap(
//     (e, i) => {
//       const nextToken = route.pathTokens[i + 1];
//       return !nextToken || nextToken.param?.isOptional || nextToken.param?.isRest
//         ? [[...route.pathTokens.slice(0, i), e]]
//         : [];
//     },
//   );
//
//   if (jsonSchemas[route.params.id]) {
//     const properties: Record<string, Record<string, unknown>> = new Function(`
//       const { allOf, properties } = ${jsonSchemas[route.params.id].text};
//       return properties || allOf?.[1]?.properties || {}
//     `)();
//     for (const { param } of route.pathTokens) {
//       if (!param || !properties[param.name]) {
//         continue;
//       }
//       openapiParameters[
//         [
//           route.params.id, //
//           param.name,
//         ].join("-")
//       ] = {
//         name: param.name,
//         in: "path",
//         required: true,
//         schema: properties[param.name],
//       };
//     }
//   }
//
//   for (const { id, httpMethod, comments, responseTypeId } of payloadTypes) {
//     if (!jsonSchemas[id]) {
//       continue;
//     }
//
//     const schema: JsonSchema | JsonSchemaSet = new Function(
//       `const { $id, ...schema } = ${jsonSchemas[id].text}; return schema;`,
//     )();
//
//     const method = httpMethod.toLowerCase() as OpenapiOperation;
//
//     for (const tokens of pathVariations) {
//       const path = tokens
//         .flatMap((e, i) => {
//           const token = e.param ? `{${e.param.name}}` : e.orig;
//           return i === 0 ? ["", token] : [token];
//         })
//         .join("/");
//
//       if (!openapiPaths[path]) {
//         openapiPaths[path] = {};
//       }
//
//       if (!openapiPaths[path][method]) {
//         openapiPaths[path][method] = {};
//       }
//
//       openapiPaths[path][method].parameters = tokens.flatMap((e) => {
//         return e.param
//           ? [
//               {
//                 $ref: `#/components/parameters/${route.params.id}-${e.param.name}`,
//               },
//             ]
//           : [];
//       });
//
//       if (["POST", "PUT", "PATCH"].includes(httpMethod)) {
//         /**
//          * default content type for payload is application/json.
//          * comments can be used to override the default.
//          *
//          * post<
//          *  object,
//          *  /**
//          *   * @content-type: multipart/form-data
//          *   * \/
//          *  { payload: ... }
//          * >((ctx) => { ... })
//          * */
//         let contentType = "application/json";
//         const commentLines = (comments || []).join("\n").split("\n");
//         for (const line of commentLines) {
//           if (CONTENT_TYPE_REGEX.test(line)) {
//             contentType = line.replace(CONTENT_TYPE_REGEX, "$2").trim();
//           }
//         }
//         openapiPaths[path][method].requestBody = {
//           required: true,
//           content: {
//             [contentType]: {
//               schema: {
//                 $ref: `#/components/schemas/${id}`,
//               },
//             },
//           },
//         };
//       } else {
//         const schemas: Array<JsonSchema> = [];
//
//         if (Array.isArray((schema as JsonSchemaSet)?.allOf)) {
//           schemas.push(
//             ...((schema as JsonSchemaSet).allOf as Array<JsonSchema>),
//           );
//         } else if (
//           (schema as JsonSchema).properties ||
//           (schema as JsonSchema).patternProperties
//         ) {
//           schemas.push(schema as JsonSchema);
//         }
//
//         const queryParams: Record<string, OpenapiRefParameter> = {};
//
//         for (const { properties, patternProperties, required } of schemas) {
//           for (const [propName, propSchema] of Object.entries({
//             ...properties,
//             ...patternProperties,
//           })) {
//             const key = [id, propName].join("-");
//             queryParams[propName] = { $ref: `#/components/parameters/${key}` };
//             openapiParameters[key] = {
//               name: propName,
//               in: "query",
//               required: required?.includes(propName),
//               schema: propSchema,
//             };
//           }
//         }
//
//         openapiPaths[path][method].parameters.push(
//           ...Object.values(queryParams),
//         );
//       }
//
//       const responseType = responseTypeId
//         ? responseTypes.find((e) => e.id === responseTypeId)
//         : undefined;
//
//       if (responseType) {
//         openapiPaths[path][method].responses = {
//           200: {
//             description: "ok",
//             content: {
//               "application/json": {
//                 schema: { $ref: `#/components/schemas/${responseType.id}` },
//               },
//             },
//           },
//         };
//
//         const commentLines = (responseType.comments || [])
//           .join("\n")
//           .split("\n");
//
//         /**
//          * alternate responses format:
//          * @alternate-response: statusCode contentType schemaOrDescription
//          *
//          * statusCode and contentType are required.
//          * if 3rd argument given and starts with a curly bracket {,
//          * it is JSON.parse-d and used as schema.
//          * otherwise it is used as description.
//          *
//          * if no 3rd argument given, a string schema used:
//          * {"schema": {"type": "string"}}
//          *
//          * post<
//          *  object,
//          *  { payload: ... }
//          *  /**
//          *   * @alternate-response: 400 text/plain Error Response
//          *   * \/
//          *  { ... }
//          * >((ctx) => { ... })
//          *
//          * adding alternate response type to default one:
//          * @alternate-response: 200 text/plain
//          *
//          * adding alternate response type to default one, with custom schema:
//          * @alternate-response: 200 application/xml {"type": "object", "properties": {...}}
//          *
//          * adding a permanent redirect response:
//          * @alternate-response: 301 text/plain
//          *
//          * adding a redirect response with description:
//          * @alternate-response: 302 text/plain redirect to somewhere
//          *
//          * adding error response:
//          * @alternate-response: 400 text/plain something went wrong
//          * */
//         for (const line of commentLines) {
//           if (ALTERNATE_RESPONSE_REGEX.test(line)) {
//             const matches = line
//               .match(ALTERNATE_RESPONSE_REGEX)
//               ?.map((e) => e?.trim());
//
//             if (matches?.length) {
//               const statusCode = Number(matches[2]);
//               const contentType = matches[3];
//
//               let schema = { type: "string" };
//               let description = "alternate response";
//
//               if (matches[4]?.startsWith("{")) {
//                 try {
//                   schema = JSON.parse(matches[4]);
//                 } catch (e) {}
//               } else if (matches[4]) {
//                 description = matches[4];
//               }
//
//               if (openapiPaths[path][method].responses[statusCode]) {
//                 openapiPaths[path][method].responses[statusCode].content[
//                   contentType
//                 ] = { schema };
//               } else {
//                 openapiPaths[path][method].responses[statusCode] = {
//                   description,
//                   content: {
//                     [contentType]: { schema },
//                   },
//                 };
//               }
//             }
//           }
//         }
//       }
//     }
//
//     openapiSchemas[id] = schema;
//   }
//
//   for (const { id } of responseTypes) {
//     if (jsonSchemas[id]) {
//       openapiSchemas[id] = new Function(
//         `const { $id, ...schema } = ${jsonSchemas[id].text}; return schema;`,
//       )();
//     }
//   }
//
//   return {
//     paths: openapiPaths,
//     components: {
//       parameters: openapiParameters,
//       schemas: openapiSchemas,
//     },
//   };
// };
