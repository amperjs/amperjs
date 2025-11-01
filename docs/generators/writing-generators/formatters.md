---
title: Code Formatters
description: Apply code formatters to generated files with renderToFile or applyFormatters to ensure generated code matches project style conventions like Biome or Prettier.
head:
  - - meta
    - name: keywords
      content: code formatting, biome formatter, prettier, generated code style, renderToFile, applyFormatters, code style consistency
---

Always pass formatters when rendering files
to ensure generated code matches your project's style:

```ts
await renderToFile(
  outputPath,
  template,
  templateData,
  { formatters } // <-- Include formatters from plugin options
);
```

If you generate code without templates, apply formatters manually:

```ts
import { applyFormatters } from "@kappajs/devlib";

let code = generateCodeSomehow();
code = await applyFormatters(code, outputPath, formatters);
await fs.writeFile(outputPath, code);
```

