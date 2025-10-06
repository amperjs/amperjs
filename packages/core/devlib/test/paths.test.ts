import { describe, expect, test } from "vitest";

import { defaults } from "@/defaults";
import { pathResolver } from "@/paths";

describe("pathResolver", () => {
  const appRoot = "/app";
  const sourceFolder = "test";

  const { resolve } = pathResolver({ appRoot, sourceFolder });

  test("@ shortcut", () => {
    expect(resolve("@")).toEqual(`${appRoot}/${sourceFolder}`);
    expect(resolve("@", "a", "b", "c")).toEqual(
      `${appRoot}/${sourceFolder}/a/b/c`,
    );
  });

  for (const dir of ["coreDir", "libDir"] as const) {
    test(dir, () => {
      expect(resolve(dir)).toEqual(`${appRoot}/${defaults[dir]}`);
      expect(resolve(dir, "a", "b", "c")).toEqual(
        `${appRoot}/${defaults[dir]}/a/b/c`,
      );
    });
  }

  for (const dir of ["configDir", "apiDir", "pagesDir"] as const) {
    test(dir, () => {
      expect(resolve(dir)).toEqual(
        `${appRoot}/${sourceFolder}/${defaults[dir]}`,
      );
      expect(resolve(dir, "a", "b", "c")).toEqual(
        `${appRoot}/${sourceFolder}/${defaults[dir]}/a/b/c`,
      );
    });
  }

  for (const libDir of ["apiLibDir", "pagesLibDir", "fetchLibDir"] as const) {
    test(libDir, () => {
      expect(resolve(libDir)).toEqual(
        `${appRoot}/${defaults.libDir}/${sourceFolder}/${defaults[libDir]}`,
      );
      expect(resolve(libDir, "a", "b", "c")).toEqual(
        `${appRoot}/${defaults.libDir}/${sourceFolder}/${defaults[libDir]}/a/b/c`,
      );
    });
  }
});

describe("pathResolver without appRoot", () => {
  const sourceFolder = "test";

  const { resolve } = pathResolver({ sourceFolder });

  test("@ shortcut", () => {
    expect(resolve("@")).toEqual(`${sourceFolder}`);
    expect(resolve("@", "a", "b", "c")).toEqual(`${sourceFolder}/a/b/c`);
  });

  for (const dir of ["coreDir", "libDir"] as const) {
    test(dir, () => {
      expect(resolve(dir)).toEqual(`${defaults[dir]}`);
      expect(resolve(dir, "a", "b", "c")).toEqual(`${defaults[dir]}/a/b/c`);
    });
  }

  for (const dir of ["configDir", "apiDir", "pagesDir"] as const) {
    test(dir, () => {
      expect(resolve(dir)).toEqual(`${sourceFolder}/${defaults[dir]}`);
      expect(resolve(dir, "a", "b", "c")).toEqual(
        `${sourceFolder}/${defaults[dir]}/a/b/c`,
      );
    });
  }

  for (const libDir of ["apiLibDir", "pagesLibDir", "fetchLibDir"] as const) {
    test(libDir, () => {
      expect(resolve(libDir)).toEqual(
        `${defaults.libDir}/${sourceFolder}/${defaults[libDir]}`,
      );
      expect(resolve(libDir, "a", "b", "c")).toEqual(
        `${defaults.libDir}/${sourceFolder}/${defaults[libDir]}/a/b/c`,
      );
    });
  }
});
