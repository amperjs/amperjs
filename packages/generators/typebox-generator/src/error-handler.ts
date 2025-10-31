import { format } from "node:util";

import type { TValidationError } from "typebox/error";

import type { ValidationErrorEntry } from "@kappajs/api";

/**
 * Message codes for i18n/l10n support
 */
export const MESSAGE_CODES = {
  // Generic messages

  /** Singular form of "property" word for i18n */
  PROPERTY: "PROPERTY",
  /** Plural form of "properties" word for i18n */
  PROPERTIES: "PROPERTIES",

  /** Text for "allowed values" phrase for i18n */
  ALLOWED_VALUES: "ALLOWED_VALUES",
  /** Message template for displaying count of duplicate items found */
  FOUND_N_DUPLICATES: "FOUND_N_DUPLICATES",

  /** Message displayed when validation succeeds */
  VALIDATION_PASSED: "VALIDATION_PASSED",
  /** Prefix text for validation error messages (e.g., "Validation failed:") */
  VALIDATION_FAILED_PREFIX: "VALIDATION_FAILED_PREFIX",

  /** Template for error summary showing error count and affected fields */
  ERROR_SUMMARY: "ERROR_SUMMARY",
  /** Plural suffix for words (e.g., "s" in English) */
  PLURAL_SUFFIX: "PLURAL_SUFFIX",

  /** Ordinal position label for first element in tuple/array */
  FIRST: "FIRST",
  /** Ordinal position label for second element in tuple/array */
  SECOND: "SECOND",
  /** Ordinal position label for third element in tuple/array */
  THIRD: "THIRD",
  /** Ordinal position label for fourth element in tuple/array */
  FOURTH: "FOURTH",
  /** Ordinal position label for fifth element in tuple/array */
  FIFTH: "FIFTH",

  // Error messages

  // Type validation
  /** Invalid data type - expected a specific type */
  TYPE_INVALID: "TYPE_INVALID",

  // String validation
  /** String is too short - minimum length constraint violated */
  STRING_MIN_LENGTH: "STRING_MIN_LENGTH",
  /** String is too long - maximum length constraint violated */
  STRING_MAX_LENGTH: "STRING_MAX_LENGTH",
  /** String doesn't match required pattern/regex */
  STRING_PATTERN: "STRING_PATTERN",
  /** String doesn't match required format (generic) */
  STRING_FORMAT: "STRING_FORMAT",
  /** Invalid email address format */
  STRING_FORMAT_EMAIL: "STRING_FORMAT_EMAIL",
  /** Invalid date format */
  STRING_FORMAT_DATE: "STRING_FORMAT_DATE",
  /** Invalid date-time format */
  STRING_FORMAT_DATETIME: "STRING_FORMAT_DATETIME",
  /** Invalid time format */
  STRING_FORMAT_TIME: "STRING_FORMAT_TIME",
  /** Invalid URI format */
  STRING_FORMAT_URI: "STRING_FORMAT_URI",
  /** Invalid URL format */
  STRING_FORMAT_URL: "STRING_FORMAT_URL",
  /** Invalid UUID format */
  STRING_FORMAT_UUID: "STRING_FORMAT_UUID",
  /** Invalid IPv4 address format */
  STRING_FORMAT_IPV4: "STRING_FORMAT_IPV4",
  /** Invalid IPv6 address format */
  STRING_FORMAT_IPV6: "STRING_FORMAT_IPV6",
  /** Invalid hostname format */
  STRING_FORMAT_HOSTNAME: "STRING_FORMAT_HOSTNAME",
  /** Invalid JSON pointer format */
  STRING_FORMAT_JSON_POINTER: "STRING_FORMAT_JSON_POINTER",
  /** Invalid regular expression format */
  STRING_FORMAT_REGEX: "STRING_FORMAT_REGEX",

  // Number validation
  /** Number is below minimum value */
  NUMBER_MINIMUM: "NUMBER_MINIMUM",
  /** Number exceeds maximum value */
  NUMBER_MAXIMUM: "NUMBER_MAXIMUM",
  /** Number is below exclusive minimum value */
  NUMBER_EXCLUSIVE_MINIMUM: "NUMBER_EXCLUSIVE_MINIMUM",
  /** Number exceeds exclusive maximum value */
  NUMBER_EXCLUSIVE_MAXIMUM: "NUMBER_EXCLUSIVE_MAXIMUM",
  /** Number is not a multiple of required value */
  NUMBER_MULTIPLE_OF: "NUMBER_MULTIPLE_OF",

  // Array validation
  /** Array has too few items - minimum items constraint violated */
  ARRAY_MIN_ITEMS: "ARRAY_MIN_ITEMS",
  /** Array has too many items - maximum items constraint violated */
  ARRAY_MAX_ITEMS: "ARRAY_MAX_ITEMS",
  /** Array contains duplicate items when uniqueness is required */
  ARRAY_UNIQUE_ITEMS: "ARRAY_UNIQUE_ITEMS",
  /** Array doesn't contain required valid items */
  ARRAY_CONTAINS: "ARRAY_CONTAINS",
  /** Array contains too few items matching criteria */
  ARRAY_MIN_CONTAINS: "ARRAY_MIN_CONTAINS",
  /** Array contains too many items matching criteria */
  ARRAY_MAX_CONTAINS: "ARRAY_MAX_CONTAINS",
  /** Invalid tuple structure */
  ARRAY_PREFIX_ITEMS: "ARRAY_PREFIX_ITEMS",
  /** Invalid additional items beyond tuple definition */
  ARRAY_ITEMS: "ARRAY_ITEMS",
  /** Invalid unevaluated items in array */
  ARRAY_UNEVALUATED_ITEMS: "ARRAY_UNEVALUATED_ITEMS",

  // Tuple-specific validation
  /** Tuple has too few elements */
  TUPLE_MIN_ITEMS: "TUPLE_MIN_ITEMS",
  /** Tuple has too many elements */
  TUPLE_MAX_ITEMS: "TUPLE_MAX_ITEMS",

  // Object validation
  /** Missing required property/properties */
  OBJECT_REQUIRED: "OBJECT_REQUIRED",
  /** Object contains additional properties not allowed by schema */
  OBJECT_ADDITIONAL_PROPERTIES: "OBJECT_ADDITIONAL_PROPERTIES",
  /** Object has too few properties */
  OBJECT_MIN_PROPERTIES: "OBJECT_MIN_PROPERTIES",
  /** Object has too many properties */
  OBJECT_MAX_PROPERTIES: "OBJECT_MAX_PROPERTIES",
  /** Invalid property name */
  OBJECT_PROPERTY_NAMES: "OBJECT_PROPERTY_NAMES",
  /** Missing dependent required properties */
  OBJECT_DEPENDENCIES: "OBJECT_DEPENDENCIES",
  /** Object contains unevaluated properties */
  OBJECT_UNEVALUATED_PROPERTIES: "OBJECT_UNEVALUATED_PROPERTIES",

  // Enum and const validation
  /** Value is not one of the allowed enum values */
  ENUM_MISMATCH: "ENUM_MISMATCH",
  /** Value doesn't match the required constant value */
  CONST_MISMATCH: "CONST_MISMATCH",

  // Conditional schema validation
  /** Doesn't match conditional if schema */
  CONDITIONAL_IF: "CONDITIONAL_IF",
  /** Doesn't satisfy then schema condition */
  CONDITIONAL_THEN: "CONDITIONAL_THEN",
  /** Doesn't satisfy else schema condition */
  CONDITIONAL_ELSE: "CONDITIONAL_ELSE",

  // Composition validation
  /** Must match exactly one schema (oneOf) */
  COMPOSITION_ONE_OF: "COMPOSITION_ONE_OF",
  /** Must match at least one schema (anyOf) */
  COMPOSITION_ANY_OF: "COMPOSITION_ANY_OF",
  /** Must match all schemas (allOf) */
  COMPOSITION_ALL_OF: "COMPOSITION_ALL_OF",
  /** Must not match the schema (not) */
  COMPOSITION_NOT: "COMPOSITION_NOT",

  // Content validation
  /** Invalid discriminator value */
  CONTENT_DISCRIMINATOR: "CONTENT_DISCRIMINATOR",
  /** Invalid content encoding */
  CONTENT_ENCODING: "CONTENT_ENCODING",
  /** Invalid content media type */
  CONTENT_MEDIA_TYPE: "CONTENT_MEDIA_TYPE",

  // Custom keywords (ajv-keywords)
  /** Value outside allowed range */
  CUSTOM_RANGE: "CUSTOM_RANGE",
  /** Value outside exclusive range */
  CUSTOM_EXCLUSIVE_RANGE: "CUSTOM_EXCLUSIVE_RANGE",
  /** Doesn't match regular expression */
  CUSTOM_REGEXP: "CUSTOM_REGEXP",
  /** Failed to apply dynamic default */
  CUSTOM_DYNAMIC_DEFAULTS: "CUSTOM_DYNAMIC_DEFAULTS",
  /** Doesn't match any selected case */
  CUSTOM_SELECT: "CUSTOM_SELECT",
  /** Transformation failed */
  CUSTOM_TRANSFORM: "CUSTOM_TRANSFORM",
  /** Items don't have unique property values */
  CUSTOM_UNIQUE_ITEM_PROPERTIES: "CUSTOM_UNIQUE_ITEM_PROPERTIES",

  // Fallback
  /** Unknown validation error */
  UNKNOWN: "UNKNOWN",
} as const;

export type ValidationMessages = typeof MESSAGE_CODES;

/**
 * Error message templates using node:util format syntax
 * Placeholders: %s (string), %d (number), %j (JSON)
 *
 * Usage: format(ERROR_MESSAGES[ErrorCode.STRING_MIN_LENGTH], 5)
 * Result: "must be at least 5 characters long"
 */
const MESSAGE_MAP: Record<keyof ValidationMessages, string> = {
  // Generic messages

  [MESSAGE_CODES.PROPERTY]: "property",
  [MESSAGE_CODES.PROPERTIES]: "properties",

  [MESSAGE_CODES.ALLOWED_VALUES]: "the allowed values",
  [MESSAGE_CODES.FOUND_N_DUPLICATES]: " (found %d duplicate%s)",

  [MESSAGE_CODES.VALIDATION_PASSED]: "Validation Passed",
  [MESSAGE_CODES.VALIDATION_FAILED_PREFIX]: "Validation Failed:",

  [MESSAGE_CODES.ERROR_SUMMARY]:
    "%d validation error%s found across %d field%s",
  [MESSAGE_CODES.PLURAL_SUFFIX]: "s",

  [MESSAGE_CODES.FIRST]: "first",
  [MESSAGE_CODES.SECOND]: "second",
  [MESSAGE_CODES.THIRD]: "third",
  [MESSAGE_CODES.FOURTH]: "fourth",
  [MESSAGE_CODES.FIFTH]: "fifth",

  // Error messages

  // Type validation
  [MESSAGE_CODES.TYPE_INVALID]: "must be %s",

  // String validation
  [MESSAGE_CODES.STRING_MIN_LENGTH]: "must be at least %d character%s long",
  [MESSAGE_CODES.STRING_MAX_LENGTH]: "must not exceed %d character%s",
  [MESSAGE_CODES.STRING_PATTERN]: "must match the required pattern",
  [MESSAGE_CODES.STRING_FORMAT]: `must match format "%s"`,
  [MESSAGE_CODES.STRING_FORMAT_EMAIL]: "must be a valid email address",
  [MESSAGE_CODES.STRING_FORMAT_DATE]: "must be a valid date",
  [MESSAGE_CODES.STRING_FORMAT_DATETIME]: "must be a valid date-time",
  [MESSAGE_CODES.STRING_FORMAT_TIME]: "must be a valid time",
  [MESSAGE_CODES.STRING_FORMAT_URI]: "must be a valid URI",
  [MESSAGE_CODES.STRING_FORMAT_URL]: "must be a valid URL",
  [MESSAGE_CODES.STRING_FORMAT_UUID]: "must be a valid UUID",
  [MESSAGE_CODES.STRING_FORMAT_IPV4]: "must be a valid IPv4 address",
  [MESSAGE_CODES.STRING_FORMAT_IPV6]: "must be a valid IPv6 address",
  [MESSAGE_CODES.STRING_FORMAT_HOSTNAME]: "must be a valid hostname",
  [MESSAGE_CODES.STRING_FORMAT_JSON_POINTER]: "must be a valid JSON pointer",
  [MESSAGE_CODES.STRING_FORMAT_REGEX]: "must be a valid regular expression",

  // Number validation
  [MESSAGE_CODES.NUMBER_MINIMUM]: "must be %s %s",
  [MESSAGE_CODES.NUMBER_MAXIMUM]: "must be %s %s",
  [MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM]: "must be %s %s",
  [MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM]: "must be %s %s",
  [MESSAGE_CODES.NUMBER_MULTIPLE_OF]: "must be a multiple of %s",

  // Array validation
  [MESSAGE_CODES.ARRAY_MIN_ITEMS]: "must have at least %d item%s",
  [MESSAGE_CODES.ARRAY_MAX_ITEMS]: "must not have more than %d item%s",
  [MESSAGE_CODES.ARRAY_UNIQUE_ITEMS]: "must not have duplicate items%s",
  [MESSAGE_CODES.ARRAY_CONTAINS]: "must contain at least %d valid item%s",
  [MESSAGE_CODES.ARRAY_MIN_CONTAINS]:
    "must contain at least %d item%s matching the criteria",
  [MESSAGE_CODES.ARRAY_MAX_CONTAINS]:
    "must contain no more than %d item%s matching the criteria",
  [MESSAGE_CODES.ARRAY_PREFIX_ITEMS]: "tuple structure is invalid",
  [MESSAGE_CODES.ARRAY_ITEMS]: "array items are invalid",
  [MESSAGE_CODES.ARRAY_UNEVALUATED_ITEMS]: "should not have unevaluated items",

  // Tuple-specific
  [MESSAGE_CODES.TUPLE_MIN_ITEMS]: "tuple must have at least %d element%s",
  [MESSAGE_CODES.TUPLE_MAX_ITEMS]: "tuple must not have more than %d element%s",

  // Object validation
  [MESSAGE_CODES.OBJECT_REQUIRED]: "missing required %s: %s",
  [MESSAGE_CODES.OBJECT_ADDITIONAL_PROPERTIES]: `should not have additional property "%s"`,
  [MESSAGE_CODES.OBJECT_MIN_PROPERTIES]: "must have at least %d %s",
  [MESSAGE_CODES.OBJECT_MAX_PROPERTIES]: "must not have more than %d %s",
  [MESSAGE_CODES.OBJECT_PROPERTY_NAMES]: `property name "%s" is invalid`,
  [MESSAGE_CODES.OBJECT_DEPENDENCIES]: "requires %s when present",
  [MESSAGE_CODES.OBJECT_UNEVALUATED_PROPERTIES]: `should not have unevaluated property "%s"`,

  // Enum and const
  [MESSAGE_CODES.ENUM_MISMATCH]: "must be one of: %s",
  [MESSAGE_CODES.CONST_MISMATCH]: "must be equal to %s",

  // Conditional
  [MESSAGE_CODES.CONDITIONAL_IF]: "does not match the conditional schema",
  [MESSAGE_CODES.CONDITIONAL_THEN]: `does not satisfy the "then" schema condition`,
  [MESSAGE_CODES.CONDITIONAL_ELSE]: `does not satisfy the "else" schema condition`,

  // Composition
  [MESSAGE_CODES.COMPOSITION_ONE_OF]:
    "must match exactly one schema (currently matches %d)",
  [MESSAGE_CODES.COMPOSITION_ANY_OF]: "must match at least one schema",
  [MESSAGE_CODES.COMPOSITION_ALL_OF]: "must match all schemas",
  [MESSAGE_CODES.COMPOSITION_NOT]: "must not match the schema",

  // Content
  [MESSAGE_CODES.CONTENT_DISCRIMINATOR]: `discriminator property "%s" has invalid value`,
  [MESSAGE_CODES.CONTENT_ENCODING]: `content encoding "%s" is invalid`,
  [MESSAGE_CODES.CONTENT_MEDIA_TYPE]: `content media type "%s" is invalid`,

  // Custom keywords
  [MESSAGE_CODES.CUSTOM_RANGE]: "must be within the range %s to %s",
  [MESSAGE_CODES.CUSTOM_EXCLUSIVE_RANGE]:
    "must be strictly within the range %s to %s",
  [MESSAGE_CODES.CUSTOM_REGEXP]: "must match the regular expression pattern",
  [MESSAGE_CODES.CUSTOM_DYNAMIC_DEFAULTS]:
    "failed to apply dynamic default value",
  [MESSAGE_CODES.CUSTOM_SELECT]: "does not match any of the selected cases",
  [MESSAGE_CODES.CUSTOM_TRANSFORM]: "transformation failed",
  [MESSAGE_CODES.CUSTOM_UNIQUE_ITEM_PROPERTIES]:
    "must have unique values for %s: %s",

  // Fallback
  [MESSAGE_CODES.UNKNOWN]: `validation failed for keyword "%s"`,
};

/**
 * Comprehensive error handler for TypeBox validation errors.
 * Supports most JSON Schema validation keywords and produces human-friendly messages
 * with i18n/l10n support through message code mapping.
 */
export default (
  customMessages?: Partial<Record<keyof ValidationMessages, string>>,
) => {
  const messageMap = { ...MESSAGE_MAP, ...customMessages };

  /**
   * Formats the instancePath into a human-readable field name
   */
  function formatFieldPath(instancePath: string, schemaPath?: string): string {
    if (!instancePath?.trim?.()) {
      return "root";
    }

    // Check if this is a tuple validation (prefixItems in schemaPath)
    const isTupleItem = schemaPath?.includes("/prefixItems/");

    // Remove leading slash and convert to readable format
    const formatted = instancePath
      .replace(/^\//, "")
      .replace(/\//g, " → ")
      .replace(/(\d+)/g, (match) => {
        const index = Number(match);
        // For tuples, use more readable position labels
        if (isTupleItem) {
          const positions = [
            messageMap[MESSAGE_CODES.FIRST],
            messageMap[MESSAGE_CODES.SECOND],
            messageMap[MESSAGE_CODES.THIRD],
            messageMap[MESSAGE_CODES.FOURTH],
            messageMap[MESSAGE_CODES.FIFTH],
          ];
          return positions[index] //
            ? `(${positions[index]})`
            : `[${match}]`;
        }
        return `[${match}]`;
      })
      .replace(/→ \[/g, "[")
      .replace(/→ \(/g, " ");

    return formatted;
  }

  /**
   * Pluralizes a word based on count
   */
  function pluralize(
    count: number,
    plural: string = messageMap[MESSAGE_CODES.PLURAL_SUFFIX],
  ): string {
    return count === 1 ? "" : plural;
  }

  /**
   * Maps validation error to error code and formats message
   */
  function getErrorCodeAndMessage(error: TValidationError): {
    code: keyof ValidationMessages;
    message: string;
  } {
    const { keyword, params, schemaPath } = error;
    const isTupleValidation = schemaPath?.includes("/prefixItems/");

    const defaultMessage = format(messageMap[MESSAGE_CODES.UNKNOWN], keyword);

    const defaultError = {
      code: MESSAGE_CODES.UNKNOWN,
      message:
        "message" in error
          ? typeof error.message === "string"
            ? error.message || defaultMessage
            : JSON.stringify(error.message)
          : defaultMessage,
    };

    switch (keyword) {
      // Type validation
      case "type": {
        const p = params as { type: string };
        return {
          code: MESSAGE_CODES.TYPE_INVALID,
          message: format(messageMap[MESSAGE_CODES.TYPE_INVALID], p.type),
        };
      }

      // String validation
      case "minLength": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.STRING_MIN_LENGTH,
          message: format(
            messageMap[MESSAGE_CODES.STRING_MIN_LENGTH],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "maxLength": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.STRING_MAX_LENGTH,
          message: format(
            messageMap[MESSAGE_CODES.STRING_MAX_LENGTH],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "pattern":
        return {
          code: MESSAGE_CODES.STRING_PATTERN,
          message: messageMap[MESSAGE_CODES.STRING_PATTERN],
        };

      case "format": {
        const p = params as { format: string };
        const formatMap: Record<string, keyof ValidationMessages> = {
          email: MESSAGE_CODES.STRING_FORMAT_EMAIL,
          date: MESSAGE_CODES.STRING_FORMAT_DATE,
          "date-time": MESSAGE_CODES.STRING_FORMAT_DATETIME,
          time: MESSAGE_CODES.STRING_FORMAT_TIME,
          uri: MESSAGE_CODES.STRING_FORMAT_URI,
          url: MESSAGE_CODES.STRING_FORMAT_URL,
          uuid: MESSAGE_CODES.STRING_FORMAT_UUID,
          ipv4: MESSAGE_CODES.STRING_FORMAT_IPV4,
          ipv6: MESSAGE_CODES.STRING_FORMAT_IPV6,
          hostname: MESSAGE_CODES.STRING_FORMAT_HOSTNAME,
          "json-pointer": MESSAGE_CODES.STRING_FORMAT_JSON_POINTER,
          regex: MESSAGE_CODES.STRING_FORMAT_REGEX,
        };
        const code = formatMap[p.format] || MESSAGE_CODES.STRING_FORMAT;
        const message = formatMap[p.format]
          ? messageMap[code]
          : format(messageMap[MESSAGE_CODES.STRING_FORMAT], p.format);
        return { code, message };
      }

      // Number validation
      case "minimum": {
        const p = params as { comparison: string; limit: number };
        return {
          code: MESSAGE_CODES.NUMBER_MINIMUM,
          message: format(
            messageMap[MESSAGE_CODES.NUMBER_MINIMUM],
            p.comparison,
            p.limit,
          ),
        };
      }

      case "maximum": {
        const p = params as { comparison: string; limit: number };
        return {
          code: MESSAGE_CODES.NUMBER_MAXIMUM,
          message: format(
            messageMap[MESSAGE_CODES.NUMBER_MAXIMUM],
            p.comparison,
            p.limit,
          ),
        };
      }

      case "exclusiveMinimum": {
        const p = params as { comparison: string; limit: number };
        return {
          code: MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM,
          message: format(
            messageMap[MESSAGE_CODES.NUMBER_EXCLUSIVE_MINIMUM],
            p.comparison,
            p.limit,
          ),
        };
      }

      case "exclusiveMaximum": {
        const p = params as { comparison: string; limit: number };
        return {
          code: MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM,
          message: format(
            messageMap[MESSAGE_CODES.NUMBER_EXCLUSIVE_MAXIMUM],
            p.comparison,
            p.limit,
          ),
        };
      }

      case "multipleOf": {
        const p = params as { multipleOf: number };
        return {
          code: MESSAGE_CODES.NUMBER_MULTIPLE_OF,
          message: format(
            messageMap[MESSAGE_CODES.NUMBER_MULTIPLE_OF],
            p.multipleOf,
          ),
        };
      }

      // Array validation
      case "minItems": {
        const p = params as { limit: number };
        if (isTupleValidation) {
          return {
            code: MESSAGE_CODES.TUPLE_MIN_ITEMS,
            message: format(
              messageMap[MESSAGE_CODES.TUPLE_MIN_ITEMS],
              p.limit,
              pluralize(p.limit),
            ),
          };
        }
        return {
          code: MESSAGE_CODES.ARRAY_MIN_ITEMS,
          message: format(
            messageMap[MESSAGE_CODES.ARRAY_MIN_ITEMS],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "maxItems": {
        const p = params as { limit: number };
        if (isTupleValidation) {
          return {
            code: MESSAGE_CODES.TUPLE_MAX_ITEMS,
            message: format(
              messageMap[MESSAGE_CODES.TUPLE_MAX_ITEMS],
              p.limit,
              pluralize(p.limit),
            ),
          };
        }
        return {
          code: MESSAGE_CODES.ARRAY_MAX_ITEMS,
          message: format(
            messageMap[MESSAGE_CODES.ARRAY_MAX_ITEMS],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "uniqueItems": {
        const p = params as { duplicateItems?: number[] };
        const duplicateCount = p.duplicateItems?.length || 0;
        const suffix = duplicateCount
          ? format(
              messageMap[MESSAGE_CODES.FOUND_N_DUPLICATES],
              duplicateCount,
              pluralize(duplicateCount),
            )
          : "";
        return {
          code: MESSAGE_CODES.ARRAY_UNIQUE_ITEMS,
          message: format(messageMap[MESSAGE_CODES.ARRAY_UNIQUE_ITEMS], suffix),
        };
      }

      case "contains": {
        const p = params as { minContains?: number };
        const minContains = p.minContains || 1;
        return {
          code: MESSAGE_CODES.ARRAY_CONTAINS,
          message: format(
            messageMap[MESSAGE_CODES.ARRAY_CONTAINS],
            minContains,
            pluralize(minContains),
          ),
        };
      }

      case "unevaluatedItems":
        return {
          code: MESSAGE_CODES.ARRAY_UNEVALUATED_ITEMS,
          message: messageMap[MESSAGE_CODES.ARRAY_UNEVALUATED_ITEMS],
        };

      // Object validation
      case "required": {
        const p = params as {
          requiredProperties?: string[];
          missingProperty?: string;
        };
        const missingProps = p.requiredProperties || p.missingProperty;
        if (Array.isArray(missingProps)) {
          const props = missingProps.map((prop) => `"${prop}"`).join(", ");
          const propWord =
            missingProps.length === 1 //
              ? messageMap[MESSAGE_CODES.PROPERTY]
              : messageMap[MESSAGE_CODES.PROPERTIES];
          return {
            code: MESSAGE_CODES.OBJECT_REQUIRED,
            message: format(
              messageMap[MESSAGE_CODES.OBJECT_REQUIRED],
              propWord,
              props,
            ),
          };
        }
        return {
          code: MESSAGE_CODES.OBJECT_REQUIRED,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_REQUIRED],
            messageMap[MESSAGE_CODES.PROPERTY],
            `"${missingProps}"`,
          ),
        };
      }

      case "additionalProperties": {
        const p = params as { additionalProperties: string[] };
        return {
          code: MESSAGE_CODES.OBJECT_ADDITIONAL_PROPERTIES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_ADDITIONAL_PROPERTIES],
            p.additionalProperties.join(", "),
          ),
        };
      }

      case "minProperties": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.OBJECT_MIN_PROPERTIES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_MIN_PROPERTIES],
            p.limit,
            messageMap[
              p.limit === 1 //
                ? MESSAGE_CODES.PROPERTY
                : MESSAGE_CODES.PROPERTIES
            ],
          ),
        };
      }

      case "maxProperties": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.OBJECT_MAX_PROPERTIES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_MAX_PROPERTIES],
            p.limit,
            messageMap[
              p.limit === 1 //
                ? MESSAGE_CODES.PROPERTY
                : MESSAGE_CODES.PROPERTIES
            ],
          ),
        };
      }

      case "propertyNames": {
        const p = params as { propertyNames: string[] };
        return {
          code: MESSAGE_CODES.OBJECT_PROPERTY_NAMES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_PROPERTY_NAMES],
            p.propertyNames.join(", "),
          ),
        };
      }

      case "dependencies":
      case "dependentRequired": {
        const p = params as {
          deps?: string | string[];
          dependentRequired?: string | string[];
        };
        const deps = p.deps || p.dependentRequired;
        const depsStr = Array.isArray(deps)
          ? deps.map((d) => `"${d}"`).join(", ")
          : deps;
        return {
          code: MESSAGE_CODES.OBJECT_DEPENDENCIES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_DEPENDENCIES],
            depsStr,
          ),
        };
      }

      case "unevaluatedProperties": {
        const p = params as { unevaluatedProperties: string[] };
        return {
          code: MESSAGE_CODES.OBJECT_UNEVALUATED_PROPERTIES,
          message: format(
            messageMap[MESSAGE_CODES.OBJECT_UNEVALUATED_PROPERTIES],
            p.unevaluatedProperties.join(", "),
          ),
        };
      }

      // Enum and const
      case "enum": {
        const p = params as { allowedValues: unknown[] };
        if (Array.isArray(p.allowedValues) && p.allowedValues.length <= 5) {
          const values = p.allowedValues
            .map((v) => JSON.stringify(v))
            .join(", ");
          return {
            code: MESSAGE_CODES.ENUM_MISMATCH,
            message: format(messageMap[MESSAGE_CODES.ENUM_MISMATCH], values),
          };
        }
        return {
          code: MESSAGE_CODES.ENUM_MISMATCH,
          message: format(
            messageMap[MESSAGE_CODES.ENUM_MISMATCH],
            messageMap[MESSAGE_CODES.ALLOWED_VALUES],
          ),
        };
      }

      case "const": {
        const p = params as { allowedValue: unknown };
        return {
          code: MESSAGE_CODES.CONST_MISMATCH,
          message: format(
            messageMap[MESSAGE_CODES.CONST_MISMATCH],
            JSON.stringify(p.allowedValue),
          ),
        };
      }

      // Conditional schemas
      case "if":
        return {
          code: MESSAGE_CODES.CONDITIONAL_IF,
          message: messageMap[MESSAGE_CODES.CONDITIONAL_IF],
        };

      // Composition
      case "oneOf": {
        const p = params as { passingSchemas?: number[] };
        return {
          code: MESSAGE_CODES.COMPOSITION_ONE_OF,
          message: format(
            messageMap[MESSAGE_CODES.COMPOSITION_ONE_OF],
            p.passingSchemas?.length || 0,
          ),
        };
      }

      case "anyOf":
        return {
          code: MESSAGE_CODES.COMPOSITION_ANY_OF,
          message: messageMap[MESSAGE_CODES.COMPOSITION_ANY_OF],
        };

      case "not":
        return {
          code: MESSAGE_CODES.COMPOSITION_NOT,
          message: messageMap[MESSAGE_CODES.COMPOSITION_NOT],
        };

      case "boolean":
        // Schema explicitly set to false - usually for additionalItems in tuples
        if (
          schemaPath?.includes("/items") ||
          schemaPath?.includes("/additionalItems")
        ) {
          return {
            code: MESSAGE_CODES.ARRAY_ITEMS,
            message: messageMap[MESSAGE_CODES.ARRAY_ITEMS],
          };
        }
        return defaultError;

      /**
       * TODO: Periodically check the TypeBox repository for implementation updates.
       * Some validation cases (minContains, prefixItems, etc.) are not yet
       * implemented by TypeBox, so they are commented out below.
       */

      /**
      case "minContains": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.ARRAY_MIN_CONTAINS,
          message: format(
            messageMap[MESSAGE_CODES.ARRAY_MIN_CONTAINS],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "maxContains": {
        const p = params as { limit: number };
        return {
          code: MESSAGE_CODES.ARRAY_MAX_CONTAINS,
          message: format(
            messageMap[MESSAGE_CODES.ARRAY_MAX_CONTAINS],
            p.limit,
            pluralize(p.limit),
          ),
        };
      }

      case "prefixItems":
        return {
          code: MESSAGE_CODES.ARRAY_PREFIX_ITEMS,
          message: messageMap[MESSAGE_CODES.ARRAY_PREFIX_ITEMS],
        };

      case "items":
        return {
          code: MESSAGE_CODES.ARRAY_ITEMS,
          message: messageMap[MESSAGE_CODES.ARRAY_ITEMS],
        };

      case "then":
        return {
          code: MESSAGE_CODES.CONDITIONAL_THEN,
          message: messageMap[MESSAGE_CODES.CONDITIONAL_THEN],
        };

      case "else":
        return {
          code: MESSAGE_CODES.CONDITIONAL_ELSE,
          message: messageMap[MESSAGE_CODES.CONDITIONAL_ELSE],
        };

      case "allOf":
        return {
          code: MESSAGE_CODES.COMPOSITION_ALL_OF,
          message: messageMap[MESSAGE_CODES.COMPOSITION_ALL_OF],
        };

      // Content validation
      case "discriminator": {
        const p = params as { propertyName: string };
        return {
          code: MESSAGE_CODES.CONTENT_DISCRIMINATOR,
          message: format(
            messageMap[MESSAGE_CODES.CONTENT_DISCRIMINATOR],
            p.propertyName,
          ),
        };
      }

      case "contentEncoding": {
        const p = params as { encoding: string };
        return {
          code: MESSAGE_CODES.CONTENT_ENCODING,
          message: format(
            messageMap[MESSAGE_CODES.CONTENT_ENCODING],
            p.encoding,
          ),
        };
      }

      case "contentMediaType": {
        const p = params as { mediaType: string };
        return {
          code: MESSAGE_CODES.CONTENT_MEDIA_TYPE,
          message: format(
            messageMap[MESSAGE_CODES.CONTENT_MEDIA_TYPE],
            p.mediaType,
          ),
        };
      }

      // Custom keywords
      case "range": {
        const p = params as { min?: number; max?: number };
        return {
          code: MESSAGE_CODES.CUSTOM_RANGE,
          message: format(messageMap[MESSAGE_CODES.CUSTOM_RANGE], p.min, p.max),
        };
      }

      case "exclusiveRange": {
        const p = params as { min?: number; max?: number };
        return {
          code: MESSAGE_CODES.CUSTOM_EXCLUSIVE_RANGE,
          message: format(
            messageMap[MESSAGE_CODES.CUSTOM_EXCLUSIVE_RANGE],
            p.min,
            p.max,
          ),
        };
      }

      case "regexp":
        return {
          code: MESSAGE_CODES.CUSTOM_REGEXP,
          message: messageMap[MESSAGE_CODES.CUSTOM_REGEXP],
        };

      case "dynamicDefaults":
        return {
          code: MESSAGE_CODES.CUSTOM_DYNAMIC_DEFAULTS,
          message: messageMap[MESSAGE_CODES.CUSTOM_DYNAMIC_DEFAULTS],
        };

      case "select":
      case "selectCases":
      case "selectDefault":
        return {
          code: MESSAGE_CODES.CUSTOM_SELECT,
          message: messageMap[MESSAGE_CODES.CUSTOM_SELECT],
        };

      case "transform":
        return {
          code: MESSAGE_CODES.CUSTOM_TRANSFORM,
          message: messageMap[MESSAGE_CODES.CUSTOM_TRANSFORM],
        };

      case "uniqueItemProperties": {
        const p = params as { properties?: string[] };
        const props = p.properties || [];
        return {
          code: MESSAGE_CODES.CUSTOM_UNIQUE_ITEM_PROPERTIES,
          message: format(
            messageMap[MESSAGE_CODES.CUSTOM_UNIQUE_ITEM_PROPERTIES],
            messageMap[
              props.length === 1 //
                ? MESSAGE_CODES.PROPERTY
                : MESSAGE_CODES.PROPERTIES
            ],
            props.join(", "),
          ),
        };
      }
      */

      // Default fallback
      default: {
        return defaultError;
      }
    }
  }

  /**
   * Groups errors by field to avoid duplicate messages
   */
  function groupErrorsByField(
    errors: TValidationError[],
  ): Map<string, TValidationError[]> {
    const grouped = new Map<string, TValidationError[]>();

    for (const error of errors) {
      const field = error.instancePath;
      if (!grouped.has(field)) {
        grouped.set(field, []);
      }
      grouped.get(field)?.push(error);
    }

    return grouped;
  }

  /**
   * Prioritizes errors to show the most important one per field
   */
  function prioritizeErrors(errors: TValidationError[]): TValidationError {
    // Priority order: required > type > format > const/enum > other constraints
    const priority: Record<string, number> = {
      required: 1,
      type: 2,
      format: 3,
      const: 4,
      enum: 4,
      pattern: 5,
      minimum: 6,
      maximum: 6,
      exclusiveMinimum: 6,
      exclusiveMaximum: 6,
      minLength: 6,
      maxLength: 6,
      minItems: 6,
      maxItems: 6,
      minProperties: 6,
      maxProperties: 6,
    };

    return errors.sort((a, b) => {
      const aPriority = priority[a.keyword] || 99;
      const bPriority = priority[b.keyword] || 99;
      return aPriority - bPriority;
    })[0];
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Main function to format validation errors
   */
  function formatValidationErrors(
    errors: TValidationError[],
    options: {
      groupByField?: boolean;
      singleError?: boolean;
    } = {},
  ): ValidationErrorEntry[] {
    if (!errors?.length) {
      return [];
    }

    const { groupByField = true, singleError = false } = options;

    if (singleError) {
      // Return only the first error
      const error = errors[0];
      const { code, message } = getErrorCodeAndMessage(error);
      return [
        {
          keyword: error.keyword,
          path: formatFieldPath(error.instancePath, error.schemaPath),
          message,
          code,
          params: error.params,
        },
      ];
    }

    if (groupByField) {
      // Group errors by field and return one error per field
      const grouped = groupErrorsByField(errors);
      const formatted: ValidationErrorEntry[] = [];

      for (const [_, fieldErrors] of grouped) {
        const prioritized = prioritizeErrors(fieldErrors);
        const { code, message } = getErrorCodeAndMessage(prioritized);
        formatted.push({
          keyword: prioritized.keyword,
          path: formatFieldPath(
            prioritized.instancePath,
            prioritized.schemaPath,
          ),
          message,
          code,
          params: prioritized.params,
        });
      }

      return formatted;
    }

    // Return all errors
    return errors.map((error) => {
      const { code, message } = getErrorCodeAndMessage(error);
      return {
        keyword: error.keyword,
        path: formatFieldPath(error.instancePath, error.schemaPath),
        message,
        code,
        params: error.params,
      };
    });
  }

  /**
   * Formats errors into a single human-readable message
   */
  function formatValidationErrorMessage(
    errors: TValidationError[],
    options: {
      prefix?: string;
      separator?: string;
      includeField?: boolean;
    } = {},
  ): string {
    const {
      prefix = messageMap[MESSAGE_CODES.VALIDATION_FAILED_PREFIX],
      separator = "; ",
      includeField = true,
    } = options;

    const formatted = formatValidationErrors(errors, { groupByField: true });

    const messageList = formatted.map((error) => {
      if (includeField && error.path !== "root") {
        return `${error.path}: ${error.message}`;
      }
      return error.message;
    });

    return `${prefix} ${messageList.join(separator)}`;
  }

  /**
   * Gets a simple error summary for quick feedback
   */
  function getErrorSummary(errors: TValidationError[]): string {
    if (!errors?.length) {
      return messageMap[MESSAGE_CODES.VALIDATION_PASSED];
    }

    const uniqueFields = new Set(errors.map((e) => e.instancePath));
    const fieldCount = uniqueFields.size;

    if (fieldCount === 1) {
      const error = errors[0];
      const { message } = getErrorCodeAndMessage(error);
      const field = formatFieldPath(error.instancePath, error.schemaPath);
      return field === "root" ? message : `${field}: ${message}`;
    }

    return format(
      messageMap[MESSAGE_CODES.ERROR_SUMMARY],
      errors.length,
      pluralize(errors.length),
      fieldCount,
      pluralize(fieldCount),
    );
  }

  return {
    formatValidationErrors,
    formatValidationErrorMessage,
    getErrorSummary,
  };
};
