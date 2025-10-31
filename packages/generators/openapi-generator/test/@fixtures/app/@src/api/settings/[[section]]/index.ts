import { defineRoute } from "@kappajs/api";

type NotificationSettings = {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: "instant" | "daily" | "weekly";
};

type PrivacySettings = {
  profileVisibility: "public" | "private" | "friends";
  dataSharing: boolean;
  searchEngineIndexing: boolean;
};

type SettingsPayload = {
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
  language?: string;
  timezone?: string;
};

type SettingsResponse = {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: string;
  timezone: string;
  updatedAt: TRefine<string, { format: "date-time" }>;
};

type SettingsQuery = {
  format?: "full" | "minimal";
  includeDefaults?: boolean;
};

export default defineRoute<["notifications" | "privacy" | "general"]>(
  ({ GET, PATCH }) => [
    GET<SettingsQuery, SettingsResponse>(async (ctx) => {
      ctx.body = {
        notifications: {
          email: true,
          push: false,
          sms: false,
          frequency: "instant",
        },
        privacy: {
          profileVisibility: "public",
          dataSharing: true,
          searchEngineIndexing: true,
        },
        language: "en",
        timezone: "UTC",
        updatedAt: new Date().toISOString(),
      };
    }),

    PATCH<
      /** @skip-validation */
      SettingsPayload,
      SettingsResponse
    >(async (ctx) => {
      const updates = ctx.payload;
      ctx.body = {
        notifications: updates.notifications || {
          email: true,
          push: false,
          sms: false,
          frequency: "instant",
        },
        privacy: updates.privacy || {
          profileVisibility: "public",
          dataSharing: true,
          searchEngineIndexing: true,
        },
        language: updates.language || "en",
        timezone: updates.timezone || "UTC",
        updatedAt: new Date().toISOString(),
      };
    }),
  ],
);
