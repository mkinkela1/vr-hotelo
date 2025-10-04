import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "tenants_locales" (
  	"ai_content" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "tenants" ADD COLUMN "license_expiration" timestamp(3) with time zone;
  ALTER TABLE "tenants_locales" ADD CONSTRAINT "tenants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "tenants_locales_locale_parent_id_unique" ON "tenants_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "tenants" DROP COLUMN "ai_content";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tenants_locales" CASCADE;
  ALTER TABLE "tenants" ADD COLUMN "ai_content" varchar;
  ALTER TABLE "tenants" DROP COLUMN "license_expiration";`)
}
