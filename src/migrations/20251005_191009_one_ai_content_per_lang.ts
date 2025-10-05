import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "tenants_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "tenants_locales" CASCADE;
  ALTER TABLE "thumbnails" RENAME COLUMN "tenant_uploaded_id" TO "tenant_id";
  ALTER TABLE "thumbnails" DROP CONSTRAINT "thumbnails_tenant_uploaded_id_tenants_id_fk";
  
  DROP INDEX "thumbnails_tenant_uploaded_idx";
  ALTER TABLE "whitelabels" ALTER COLUMN "tenant_id" DROP NOT NULL;
  ALTER TABLE "tenants" ADD COLUMN "ai_content_hr" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ai_content_en" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ai_content_fr" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ai_content_de" varchar;
  ALTER TABLE "tenants" ADD COLUMN "ai_content_it" varchar;
  ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "thumbnails_tenant_idx" ON "thumbnails" USING btree ("tenant_id");
  DROP TYPE "public"."_locales";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  CREATE TABLE "tenants_locales" (
  	"ai_content" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "thumbnails" DROP CONSTRAINT "thumbnails_tenant_id_tenants_id_fk";
  
  DROP INDEX "thumbnails_tenant_idx";
  ALTER TABLE "whitelabels" ALTER COLUMN "tenant_id" SET NOT NULL;
  ALTER TABLE "thumbnails" ADD COLUMN "tenant_uploaded_id" integer;
  ALTER TABLE "tenants_locales" ADD CONSTRAINT "tenants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tenants_locales_locale_parent_id_unique" ON "tenants_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "thumbnails" ADD CONSTRAINT "thumbnails_tenant_uploaded_id_tenants_id_fk" FOREIGN KEY ("tenant_uploaded_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "thumbnails_tenant_uploaded_idx" ON "thumbnails" USING btree ("tenant_uploaded_id");
  ALTER TABLE "tenants" DROP COLUMN "ai_content_hr";
  ALTER TABLE "tenants" DROP COLUMN "ai_content_en";
  ALTER TABLE "tenants" DROP COLUMN "ai_content_fr";
  ALTER TABLE "tenants" DROP COLUMN "ai_content_de";
  ALTER TABLE "tenants" DROP COLUMN "ai_content_it";
  ALTER TABLE "thumbnails" DROP COLUMN "tenant_id";`)
}
