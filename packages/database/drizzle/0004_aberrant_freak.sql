CREATE TABLE "forms_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid,
	"value" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "forms_fields" ALTER COLUMN "label" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "forms_submission" ADD CONSTRAINT "forms_submission_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;