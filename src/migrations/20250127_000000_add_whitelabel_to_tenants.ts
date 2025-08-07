import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Only add the whitelabel_id column to tenants table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'whitelabel_id'
      ) THEN
        ALTER TABLE "tenants" ADD COLUMN "whitelabel_id" integer;
        ALTER TABLE "tenants" ADD CONSTRAINT "tenants_whitelabel_id_whitelabels_id_fk" 
          FOREIGN KEY ("whitelabel_id") REFERENCES "public"."whitelabels"("id") 
          ON DELETE set null ON UPDATE no action;
        CREATE INDEX "tenants_whitelabel_idx" ON "tenants" USING btree ("whitelabel_id");
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants" DROP CONSTRAINT IF EXISTS "tenants_whitelabel_id_whitelabels_id_fk";
    DROP INDEX IF EXISTS "tenants_whitelabel_idx";
    ALTER TABLE "tenants" DROP COLUMN IF EXISTS "whitelabel_id";
  `)
}
