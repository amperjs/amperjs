import type { PluginOptionsResolved } from "./types";

export const typeboxLiteralText = (
  text: string,
  options: Pick<PluginOptionsResolved, "refineTypeName">,
) => {
  return [
    // Escape backticks for safe use in template literals
    [/(?<!\\)`/g, "\\`"],
    // Escape $ for safe use in template literals
    [/(?<!\\)\$\{/g, "\\${"],
    /**
     * TypeBox's built-in `Options` type is not configurable.
     * To allow a custom type name, exposing `refineTypeName` option,
     * defaulted to TRefine, then renaming it to `Options`.
     * */
    [new RegExp(`\\b${options.refineTypeName}\\s*<`, "g"), "Options<"],
  ].reduce((text, [a, b]) => text.replace(a, b as never), text);
};
