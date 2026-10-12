import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    AUTH_GOOGLE_ID: v.optional(v.string()),
    AUTH_GOOGLE_SECRET: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
    ALLOWED_SITE_URLS: v.optional(v.string()),
    DEV_PASSWORD_AUTH: v.optional(v.string()),
    INVITE_DEV_RELAXED: v.optional(v.string()),
  },
});
