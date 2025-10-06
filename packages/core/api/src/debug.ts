import { bgBlue, black, blue, cyan, dim, green, grey, red } from "kleur/colors";
import picomatch from "picomatch";
import stringWidth from "string-width";

import type { RouterRoute } from "./types";

type Printer = (line: string) => void;

const dot = "·";

const colorizeMethod = (method: string): string => {
  const color = {
    HEAD: grey,
    GET: green,
    POST: blue,
    PATCH: blue,
    PUT: blue,
    DELETE: red,
  }[method];
  return color?.(method) || method;
};

export default (
  routes: Array<RouterRoute>,
  printer: Printer,
  patterns?: Array<string> | undefined, // picomatch patterns
) => {
  const patternMatchers = patterns?.flatMap((pattern) => {
    return pattern?.trim?.() ? [picomatch(pattern)] : [];
  });

  for (const { path, file, methods, slot, debug, kind } of routes.filter(
    ({ name, path }) => {
      return patternMatchers?.length
        ? patternMatchers.some((isMatch) => isMatch(name) || isMatch(path))
        : true;
    },
  )) {
    const lines: Array<string> = [];

    lines.push(
      [`[ ${bgBlue(black(` ${path} `))} ]`, grey(file)]
        .filter((e) => e)
        .join(" "),
    );

    const methodsLine = methods
      .map((method) => {
        const coloredMethod = colorizeMethod(method);
        if (method === "GET" && kind === "handler") {
          return coloredMethod + grey("|HEAD");
        }
        return coloredMethod;
      })
      .join(" ");

    lines.push(`${dim("  methods:")} ${methodsLine}`);

    if (slot) {
      lines.push(`${dim("  slot:   ")} ${cyan(slot)}`);
    }

    if (debug) {
      lines.push(`  ${cyan(debug)}`);
    }

    const maxColumns = process.stdout.isTTY
      ? Number(process.stdout.columns || 80)
      : 80;

    for (const line of lines.map((e) => `${e} `)) {
      const freeColumns = maxColumns - stringWidth(line);
      printer(
        freeColumns > 0 //
          ? line + dim(grey(Array(freeColumns).fill(dot).join("")))
          : line,
      );
    }

    printer("\n");
  }
};
