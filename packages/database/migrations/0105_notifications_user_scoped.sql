ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_workspace_id_workspaces_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notifications_workspace";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notifications_dedupe_workspace";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_notifications_dedupe";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_notifications_dedupe" ON "notifications" USING btree ("user_id","dedupe_key");--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "workspace_id";
