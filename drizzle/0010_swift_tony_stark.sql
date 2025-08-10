ALTER TABLE "paste_view" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "paste_view" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "paste_view" ADD COLUMN "continent" text;--> statement-breakpoint
CREATE INDEX "idx_paste_view_region" ON "paste_view" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_paste_view_city" ON "paste_view" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_paste_view_continent" ON "paste_view" USING btree ("continent");--> statement-breakpoint
CREATE INDEX "idx_paste_view_os" ON "paste_view" USING btree ("os");