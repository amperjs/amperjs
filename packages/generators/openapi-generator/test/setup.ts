import { rimraf } from "rimraf";

import { appRoot } from ".";

export default async () => {
  await rimraf(`${appRoot}/lib`, { preserveRoot: false });

  return async () => {};
};
