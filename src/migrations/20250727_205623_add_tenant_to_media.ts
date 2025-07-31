import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Only add the tenant_id column to media table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'tenant_id'
      ) THEN
        ALTER TABLE "media" ADD COLUMN "tenant_id" integer;
        ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_tenants_id_fk" 
          FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") 
          ON DELETE set null ON UPDATE no action;
        CREATE INDEX "media_tenant_idx" ON "media" USING btree ("tenant_id");
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_tenant_id_tenants_id_fk";
    DROP INDEX IF EXISTS "media_tenant_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "tenant_id";
  `)
}
