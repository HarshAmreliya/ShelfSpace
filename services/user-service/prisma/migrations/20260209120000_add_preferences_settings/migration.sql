-- Add settings JSON for extended preferences
ALTER TABLE "public"."Preferences" ADD COLUMN "settings" JSONB;
