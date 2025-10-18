export type Options = {
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

export type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  const?: unknown;
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean | JsonSchema;
  [key: string]: unknown;
};

// OpenAPI Type Definitions
export type OpenAPIParameter =
  | {
      name: string;
      in: "path" | "query" | "header" | "cookie";
      required: boolean;
      schema: JsonSchema | { $ref: string };
    }
  | { $ref: string };

export type OpenAPIRequestBody = {
  required: boolean;
  content: {
    "application/json": {
      schema: JsonSchema;
    };
  };
};

export type OpenAPIResponse = {
  description: string;
  content?: {
    "application/json": {
      schema: JsonSchema;
    };
  };
};

export type OpenAPIOperation = {
  parameters?: Array<OpenAPIParameter>;
  responses: Record<string, OpenAPIResponse>;
  requestBody?: OpenAPIRequestBody;
};

export type OpenAPIPaths = {
  [path: string]: {
    [method: string]: OpenAPIOperation;
  };
};
