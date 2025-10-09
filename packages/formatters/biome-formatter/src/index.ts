import { Biome, type Configuration, Distribution } from "@biomejs/js-api";

import type { FormatterConstructor } from "@oreum/devlib";

const biome = await Biome.create({ distribution: Distribution.NODE });

const { projectKey } = biome.openProject(process.cwd());

const supportedFiles = [
  //
  /\.tsx?$/,
  /\.jsx?$/,
  /\.json$/,
];

export default (config: Configuration): FormatterConstructor<Configuration> => {
  biome.applyConfiguration(projectKey, config);
  return {
    moduleImport: import.meta.filename,
    moduleConfig: config,
    formatter: (text, filePath) => {
      return supportedFiles.some((e) => e.test(filePath))
        ? biome.formatContent(projectKey, text, { filePath }).content
        : text;
    },
  };
};
