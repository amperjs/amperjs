import crc from "crc/crc32";

import type { PathToken } from "./types";

export const pathTokensFactory = (path: string): Array<PathToken> => {
  const requiredParamRegex = /^\[([^\]]+)\]$/;
  const optionalParamRegex = /^\[\[([^\]]+)\]\]$/;
  const restParamRegex = /^\[\.\.\.([^\]]+)\]$/;

  return path.split("/").map((orig, i) => {
    const [base, ext = ""] = orig.split(/(\.([\w\d-]+)$)/);

    const paramBase = (regex: RegExp) => {
      const name = base.replace(regex, "$1") || base;
      return {
        name,
        const: /\W/.test(name)
          ? [name.replace(/\W/g, "_"), crc(orig)].join("_")
          : name,
      };
    };

    let param: PathToken["param"] | undefined;

    if (base.startsWith("[")) {
      // order is highly important!
      if (restParamRegex.test(base)) {
        param = {
          ...paramBase(restParamRegex),
          isRequired: false,
          isOptional: false,
          isRest: true,
        };
      } else if (optionalParamRegex.test(base)) {
        param = {
          ...paramBase(optionalParamRegex),
          isRequired: false,
          isOptional: true,
          isRest: false,
        };
      } else if (requiredParamRegex.test(base)) {
        param = {
          ...paramBase(requiredParamRegex),
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
