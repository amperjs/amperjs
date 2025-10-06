import type {
  ValidationErrorData,
  ValidationErrorEntry,
  ValidationErrorScope,
} from "./types";

/**
 * Standardized error wrapper used by validation generators.
 *
 * Instances of this class are thrown whenever validation fails,
 * carrying both the error scope (e.g. `"params"`, `"payload"`)
 * and the list of validation error details.
 */
export class ValidationError extends Error {
  public scope: ValidationErrorScope;
  public errors: Array<ValidationErrorEntry> = [];
  public errorMessage: string;
  public errorSummary: string;

  constructor([scope, { errors, errorMessage, errorSummary }]: [
    ValidationErrorScope,
    ValidationErrorData,
  ]) {
    super(JSON.stringify(errors, null, 2));
    this.name = `${scope}ValidationError`;
    this.scope = scope;
    this.errors = errors;
    this.errorMessage = errorMessage;
    this.errorSummary = errorSummary;
  }
}
