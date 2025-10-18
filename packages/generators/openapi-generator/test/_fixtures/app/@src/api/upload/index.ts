import { defineRoute } from "@oreum/api";

type UploadResponse = {
  success: boolean;
  files: string[];
  message: string;
};

export default defineRoute(({ POST }) => [
  POST<never, UploadResponse>(async (ctx) => {
    ctx.body = {
      success: true,
      files: ["file1.jpg", "file2.pdf"],
      message: "Files uploaded without payload validation",
    };
  }),
]);
