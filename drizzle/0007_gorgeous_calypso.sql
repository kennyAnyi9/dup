ALTER TABLE "comment" DROP CONSTRAINT "comment_parent_id_comment_id_fk";
--> statement-breakpoint
ALTER TABLE "paste" ADD COLUMN "qr_code_color" text DEFAULT '#000000';--> statement-breakpoint
ALTER TABLE "paste" ADD COLUMN "qr_code_background" text DEFAULT '#ffffff';