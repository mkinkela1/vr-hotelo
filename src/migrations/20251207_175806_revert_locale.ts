import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_locale" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  ALTER TABLE "media" ALTER COLUMN "filename" DROP NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "r2_key" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "locale" "enum_media_locale" DEFAULT 'hr';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "filename" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "r2_key" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "locale";
  DROP TYPE "public"."enum_media_locale";`)
}
