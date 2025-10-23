import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<{
    fileName: TRefine<string, { minLength: 1; maxLength: 255 }>;
    fileSize: TRefine<number, { minimum: 1; maximum: 5368709120 }>;
    mimeType: TRefine<string, { pattern: "^[a-z]+/[a-z0-9.+-]+$" }>;
    description?: string;
    tags?: string[];
    isPublic: boolean;
    expiresAt?: string;
  }>(async () => {}),
]);
