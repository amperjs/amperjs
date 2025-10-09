import { rimraf } from "rimraf";

import routesFactory from "@oreum/dev/routes";
import type { RouteResolverEntry } from "@oreum/devlib";

import { appRoot, resolvedOptions } from "./lib";

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
