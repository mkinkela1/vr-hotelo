import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  CREATE TYPE "public"."enum_media_locale" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  CREATE TABLE "thumbnails" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"tenant_uploaded_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "media" ADD COLUMN "locale" "enum_media_locale" DEFAULT 'hr';
  ALTER TABLE "media" ADD COLUMN "thumbnail_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "thumbnails_id" integer;
  ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_tenant_uploaded_id_tenants_id_fk" FOREIGN KEY ("tenant_uploaded_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "thumbnails_tenant_uploaded_idx" ON "thumbnails" USING btree ("tenant_uploaded_id");
  CREATE INDEX "thumbnails_updated_at_idx" ON "thumbnails" USING btree ("updated_at");
  CREATE INDEX "thumbnails_created_at_idx" ON "thumbnails" USING btree ("created_at");
  CREATE UNIQUE INDEX "thumbnails_filename_idx" ON "thumbnails" USING btree ("filename");
  ALTER TABLE "media" ADD CONSTRAINT "media_thumbnail_id_thumbnails_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."thumbnails"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_thumbnails_fk" FOREIGN KEY ("thumbnails_id") REFERENCES "public"."thumbnails"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_thumbnail_idx" ON "media" USING btree ("thumbnail_id");
  CREATE INDEX "payload_locked_documents_rels_thumbnails_id_idx" ON "payload_locked_documents_rels" USING btree ("thumbnails_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "thumbnails" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "thumbnails" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_thumbnail_id_thumbnails_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_thumbnails_fk";
  
  DROP INDEX "media_thumbnail_idx";
  DROP INDEX "payload_locked_documents_rels_thumbnails_id_idx";
  ALTER TABLE "media" DROP COLUMN "locale";
  ALTER TABLE "media" DROP COLUMN "thumbnail_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "thumbnails_id";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_media_locale";`)
}
