CREATE TABLE "paste_tag" (
	"paste_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "paste_tag_paste_id_tag_id_pk" PRIMARY KEY("paste_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name"),
	CONSTRAINT "tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "paste_tag" ADD CONSTRAINT "paste_tag_paste_id_paste_id_fk" FOREIGN KEY ("paste_id") REFERENCES "public"."paste"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paste_tag" ADD CONSTRAINT "paste_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_paste_tag_paste_id" ON "paste_tag" USING btree ("paste_id");--> statement-breakpoint
CREATE INDEX "idx_paste_tag_tag_id" ON "paste_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_tag_name" ON "tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_tag_slug" ON "tag" USING btree ("slug");