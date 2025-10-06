import type { PathToken } from "./types";

export const pathTokensFactory = (path: string): Array<PathToken> => {
  const requiredParamRegex = /^\[([^\]]+)\]$/;
  const optionalParamRegex = /^\[\[([^\]]+)\]\]$/;
  const restParamRegex = /^\[\.\.\.([^\]]+)\]$/;

  return path.split("/").map((orig, i) => {
    const [base, ext = ""] = orig.split(/(\.([\w\d-]+)$)/);

    const paramName = (regex: RegExp) => base.replace(regex, "$1") || base;

    let param: PathToken["param"] | undefined;

    if (base.startsWith("[")) {
      // order is highly important!
      if (restParamRegex.test(base)) {
        param = {
          name: paramName(restParamRegex),
          isRequired: false,
          isOptional: false,
          isRest: true,
        };
      } else if (optionalParamRegex.test(base)) {
        param = {
          name: paramName(optionalParamRegex),
          isRequired: false,
          isOptional: true,
          isRest: false,
        };
      } else if (requiredParamRegex.test(base)) {
        param = {
          name: paramName(requiredParamRegex),
          isRequired: true,
          isOptional: false,
          isRest: false,
        };
      }
    }

    return {
      orig,
      base,
      path: i === 0 ? orig.replace(/^index$/, "/") : orig,
      ext,
      ...(param ? { param } : {}),
    } satisfies PathToken;
  });
};
