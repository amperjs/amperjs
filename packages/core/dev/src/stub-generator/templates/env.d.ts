/**
 * Enhances base TypeScript types with JSON Schema validation constraints.
 * Allows declaring refined types that carry validation metadata for runtime
 * schema validation while maintaining full TypeScript type safety.
 *
 * Useful for generating validation schemas and ensuring
 * data conforms to specific business rules beyond basic type checking.
 * */
export declare global {
  type TRefine<
    T extends unknown[] | number | string | object,
    _ extends T extends unknown[]
      ? TArrayOptions
      : T extends number
        ? TNumberOptions
        : T extends string
          ? TStringOptions
          : TObjectOptions,
  > = T;
}

/**
 * Type definitions inspired by and gently adapted from TypeBox.
 * Original TypeBox created by sinclairzx81: https://github.com/sinclairzx81/typebox
 * TypeBox is licensed under MIT: https://github.com/sinclairzx81/typebox/blob/main/license
 *
 * These types provide JSON Schema compatible type refinements for TypeScript.
 * */
interface TSchema {}

// ------------------------------------------------------------------
// ObjectOptions
// ------------------------------------------------------------------
interface TObjectOptions {
  /**
   * Defines whether additional properties are allowed beyond those explicitly defined in `properties`.
   */
  additionalProperties?: TSchema | boolean;
  /**
   * The minimum number of properties required in the object.
   */
  minProperties?: number;
  /**
   * The maximum number of properties allowed in the object.
   */
  maxProperties?: number;
  /**
   * Defines conditional requirements for properties.
   */
  dependencies?: Record<string, boolean | TSchema | string[]>;
  /**
   * Specifies properties that *must* be present if a given property is present.
   */
  dependentRequired?: Record<string, string[]>;
  /**
   * Defines schemas that apply if a specific property is present.
   */
  dependentSchemas?: Record<string, TSchema>;
  /**
   * Maps regular expressions to schemas properties matching a pattern must validate against the schema.
   */
  patternProperties?: Record<string, TSchema>;
  /**
   * A schema that all property names within the object must validate against.
   */
  propertyNames?: TSchema;
}

// ------------------------------------------------------------------
// ArrayOptions
// ------------------------------------------------------------------
interface TArrayOptions {
  /**
   * The minimum number of items allowed in the array.
   */
  minItems?: number;
  /**
   * The maximum number of items allowed in the array.
   */
  maxItems?: number;
  /**
   * A schema that at least one item in the array must validate against.
   */
  contains?: TSchema;
  /**
   * The minimum number of array items that must validate against the `contains` schema.
   */
  minContains?: number;
  /**
   * The maximum number of array items that may validate against the `contains` schema.
   */
  maxContains?: number;
  /**
   * An array of schemas, where each schema in `prefixItems` validates against items at corresponding positions from the beginning of the array.
   */
  prefixItems?: TSchema[];
  /**
   * If `true`, all items in the array must be unique.
   */
  uniqueItems?: boolean;
}

// ------------------------------------------------------------------
// NumberOptions
// ------------------------------------------------------------------
interface TNumberOptions {
  /**
   * Specifies an exclusive upper limit for the number (number must be less than this value).
   */
  exclusiveMaximum?: number | bigint;
  /**
   * Specifies an exclusive lower limit for the number (number must be greater than this value).
   */
  exclusiveMinimum?: number | bigint;
  /**
   * Specifies an inclusive upper limit for the number (number must be less than or equal to this value).
   */
  maximum?: number | bigint;
  /**
   * Specifies an inclusive lower limit for the number (number must be greater than or equal to this value).
   */
  minimum?: number | bigint;
  /**
   * Specifies that the number must be a multiple of this value.
   */
  multipleOf?: number | bigint;
}

// ------------------------------------------------------------------
// StringOptions
// ------------------------------------------------------------------
type TFormat =
  | "date-time"
  | "date"
  | "duration"
  | "email"
  | "hostname"
  | "idn-email"
  | "idn-hostname"
  | "ipv4"
  | "ipv6"
  | "iri-reference"
  | "iri"
  | "json-pointer-uri-fragment"
  | "json-pointer"
  | "json-string"
  | "regex"
  | "relative-json-pointer"
  | "time"
  | "uri-reference"
  | "uri-template"
  | "url"
  | "uuid";

interface TStringOptions {
  /**
   * Specifies the expected string format.
   *
   * Common values include:
   * - `base64` – Base64-encoded string.
   * - `date-time` – [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date-time format.
   * - `date` – [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date (YYYY-MM-DD).
   * - `duration` – [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) duration format.
   * - `email` – RFC 5321/5322 compliant email address.
   * - `hostname` – RFC 1034/1035 compliant host name.
   * - `idn-email` – Internationalized email address.
   * - `idn-hostname` – Internationalized host name.
   * - `ipv4` – IPv4 address.
   * - `ipv6` – IPv6 address.
   * - `iri` / `iri-reference` – Internationalized Resource Identifier.
   * - `json-pointer` / `json-pointer-uri-fragment` – JSON Pointer format.
   * - `json-string` – String containing valid JSON.
   * - `regex` – Regular expression syntax.
   * - `relative-json-pointer` – Relative JSON Pointer format.
   * - `time` – [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) time (HH:MM:SS).
   * - `uri-reference` / `uri-template` – URI reference or template.
   * - `url` – Web URL format.
   * - `uuid` – RFC 4122 UUID string.
   *
   * May also be a custom format string.
   */
  format?: TFormat;
  /**
   * Specifies the minimum number of characters allowed in the string.
   * Must be a non-negative integer.
   */
  minLength?: number;
  /**
   * Specifies the maximum number of characters allowed in the string.
   * Must be a non-negative integer.
   */
  maxLength?: number;
  /**
   * Specifies a regular expression pattern that the string value must match.
   * Can be provided as a string (ECMA-262 regex syntax) or a `RegExp` object.
   */
  pattern?: string | RegExp;
}
