import type { ValidationMessages } from "./error-handler";

export type Options = {
  /**
   * Optional map of custom messages to override default validation messages.
   * Allows to customize error text for i18n/l10n or project-specific wording.
   *
   * Values are format strings compatible with `node:util.format`,
   * allowing placeholders like `%s` or `%d` to interpolate parameters.
   *
   * @example
   * validationMessages: {
   *    STRING_MIN_LENGTH: "must be at least %d character%s long",
   *    NUMBER_MULTIPLE_OF: "must be a multiple of %s",
   * }
   */
  validationMessages?: Partial<ValidationMessages>;

  /**
   * Path to a file whose **default export** should be a map of type references.
   * These references are used to extend or complement TypeBox schemas.
   *
   * Each exported type should extend `Type.Base` (or another TypeBox type)
   * and be instantiated in the default export object.
   *
   * @example
   * import Type from "typebox";
   *
   * class TDate extends Type.Base<Date> {
   *   // ... implementation ...
   * }
   *
   * export default {
   *   Date: new TDate(),
   * };
   *
   */
  importCustomTypes?: string;
};
