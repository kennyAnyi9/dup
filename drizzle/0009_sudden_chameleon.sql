CREATE TABLE "paste_view" (
	"id" text PRIMARY KEY NOT NULL,
	"paste_id" text NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"referrer" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paste_view" ADD CONSTRAINT "paste_view_paste_id_paste_id_fk" FOREIGN KEY ("paste_id") REFERENCES "public"."paste"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_paste_view_paste_id" ON "paste_view" USING btree ("paste_id");--> statement-breakpoint
CREATE INDEX "idx_paste_view_viewed_at" ON "paste_view" USING btree ("viewed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_paste_view_paste_date" ON "paste_view" USING btree ("paste_id","viewed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_paste_view_country" ON "paste_view" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_paste_view_device" ON "paste_view" USING btree ("device");--> statement-breakpoint
CREATE INDEX "idx_paste_view_browser" ON "paste_view" USING btree ("browser");