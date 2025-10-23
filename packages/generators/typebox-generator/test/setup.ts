import { rimraf } from "rimraf";

import routesFactory from "@amperjs/dev/routes";
import type { RouteResolverEntry } from "@amperjs/devlib";

import { appRoot, resolvedOptions } from ".";

export default async () => {
  await rimraf(`${appRoot}/lib`, { preserveRoot: false });

  const { resolvers } = await routesFactory(resolvedOptions);

  const resolvedRoutes: RouteResolverEntry[] = [];

  for (const { handler } of resolvers.values()) {
    resolvedRoutes.push(await handler());
  }

  for (const { factory } of resolvedOptions.generators) {
    const { watchHandler } = await factory(resolvedOptions);
    await watchHandler(resolvedRoutes);
  }

  return async () => {};
};
