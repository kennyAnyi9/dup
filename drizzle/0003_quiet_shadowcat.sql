CREATE INDEX "idx_paste_user_id" ON "paste" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_paste_created_at" ON "paste" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_paste_visibility" ON "paste" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "idx_paste_expires_at" ON "paste" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_paste_is_deleted" ON "paste" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "idx_paste_user_created" ON "paste" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_paste_public_created" ON "paste" USING btree ("visibility","is_deleted","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_expires_at" ON "session" USING btree ("expires_at");