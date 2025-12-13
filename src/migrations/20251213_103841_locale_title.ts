import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_localized_titles_locale" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  CREATE TABLE "media_locale" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_locale",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "media_localized_titles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"locale" "enum_media_localized_titles_locale" NOT NULL,
  	"title" varchar NOT NULL
  );
  
  ALTER TABLE "media_locale" ADD CONSTRAINT "media_locale_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_localized_titles" ADD CONSTRAINT "media_localized_titles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_locale_order_idx" ON "media_locale" USING btree ("order");
  CREATE INDEX "media_locale_parent_idx" ON "media_locale" USING btree ("parent_id");
  CREATE INDEX "media_localized_titles_order_idx" ON "media_localized_titles" USING btree ("_order");
  CREATE INDEX "media_localized_titles_parent_id_idx" ON "media_localized_titles" USING btree ("_parent_id");
  ALTER TABLE "media" DROP COLUMN "locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "media_locale" CASCADE;
  DROP TABLE "media_localized_titles" CASCADE;
  ALTER TABLE "media" ADD COLUMN "locale" "enum_media_locale" DEFAULT 'hr';
  DROP TYPE "public"."enum_media_localized_titles_locale";`)
}
