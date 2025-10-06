import zlib from "node:zlib";

import IncomingForm from "formidable";
import rawParser from "raw-body";

import type { Middleware } from "@oreum/api";

import config from "./config";
import type {
  FormOptions,
  JsonOptions,
  RawOptions,
  Trimmer,
  TrimOption,
} from "./types";

export * from "./types";
export { config };

export function json(opts: JsonOptions = {}): Array<Middleware> {
  return [
    async (ctx, next) => {
      const form = IncomingForm({
        maxFieldsSize: opts.limit || config.json.limit,
        ...opts,
      });

      const trimmer = trimmerFactory(opts.trim);

      ctx.request.body = await new Promise((resolve, reject) => {
        form.parse(ctx.request.req, (err, fields) => {
          if (err) {
            return reject(err);
          }

          resolve(trimmer ? trimmer(fields) : fields);
        });
      });

      return next();
    },
  ];
}

export function form(opts: FormOptions = {}): Array<Middleware> {
  return [
    async (ctx, next) => {
      const form = IncomingForm({
        maxFieldsSize: opts.limit || config.form.limit,
        maxFileSize: opts.limit || config.form.limit,
        ...opts,
      });

      let trimmer = trimmerFactory(opts.trim);

      if (opts.multipart || opts.urlencoded) {
        trimmer = undefined;
      }

      ctx.request.body = await new Promise((resolve, reject) => {
        form.parse(ctx.request.req, (err, fields, files) => {
          if (err) {
            return reject(err);
          }

          resolve({
            fields: trimmer ? trimmer(fields) : fields,
            files,
          });
        });
      });

      return next();
    },
  ];
}
