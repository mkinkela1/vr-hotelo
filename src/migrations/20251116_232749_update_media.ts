import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" RENAME COLUMN "alt" TO "title";
  DROP INDEX "media_filename_idx";
  ALTER TABLE "media" ALTER COLUMN "filename" SET NOT NULL;
  ALTER TABLE "media" ADD COLUMN "r2_key" varchar NOT NULL;
  ALTER TABLE "media" DROP COLUMN "locale";
  ALTER TABLE "media" DROP COLUMN "thumbnail_u_r_l";
  DROP TYPE "public"."enum_media_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_locale" AS ENUM('hr', 'en', 'fr', 'de', 'it');
  ALTER TABLE "media" ALTER COLUMN "filename" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "alt" varchar NOT NULL;
  ALTER TABLE "media" ADD COLUMN "locale" "enum_media_locale" DEFAULT 'hr';
  ALTER TABLE "media" ADD COLUMN "thumbnail_u_r_l" varchar;
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  ALTER TABLE "media" DROP COLUMN "title";
  ALTER TABLE "media" DROP COLUMN "r2_key";`)
}
