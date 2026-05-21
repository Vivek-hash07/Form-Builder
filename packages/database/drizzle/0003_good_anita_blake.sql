CREATE TYPE "public"."form_type_enum" AS ENUM('TEXT', 'NUMBER', 'EMAIL', 'YES_NO', 'PASSWORD');--> statement-breakpoint
CREATE TABLE "forms_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"label_key" varchar(255) NOT NULL,
	"description" text,
	"placeholder" text,
	"is_required" boolean DEFAULT false,
	"index" numeric NOT NULL,
	"type" "form_type_enum" NOT NULL,
	"form_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "forms_fields_form_id_index_unique" UNIQUE("form_id","index")
);
--> statement-breakpoint
ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;