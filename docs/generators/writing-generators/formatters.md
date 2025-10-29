---
title: Writing Generators - Formatters
description: Writing Generators - Formatters
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
import { applyFormatters } from "@amperjs/devlib";

let code = generateCodeSomehow();
code = await applyFormatters(code, outputPath, formatters);
await fs.writeFile(outputPath, code);
```

