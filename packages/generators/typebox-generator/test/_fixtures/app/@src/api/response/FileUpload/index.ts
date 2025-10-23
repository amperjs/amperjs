import { defineRoute } from "@amperjs/api";

export default defineRoute(({ POST }) => [
  POST<
    never,
    {
      fileId: TRefine<string, { pattern: "^[a-zA-Z0-9_-]{1,50}$" }>;
      fileName: TRefine<string, { minLength: 1; maxLength: 255 }>;
      fileUrl: TRefine<string, { format: "url" }>;
      fileSize: TRefine<number, { minimum: 1; maximum: 5368709120 }>;
      mimeType: TRefine<string, { pattern: "^[a-z]+/[a-z0-9.+-]+$" }>;
      uploadStatus: "success" | "processing" | "failed";
      uploadedAt: Date; // Date instance (from ORM)
      expiresAt?: string; // String (from DB)
      thumbnailUrl?: TRefine<string, { format: "url" }>;
      metadata: {
        dimensions?: {
          width: TRefine<number, { minimum: 1 }>;
          height: TRefine<number, { minimum: 1 }>;
        };
        duration?: TRefine<number, { minimum: 0 }>;
        checksum: TRefine<string, { pattern: "^[a-f0-9]{32,64}$" }>;
      };
    }
  >(async () => {}),
]);
