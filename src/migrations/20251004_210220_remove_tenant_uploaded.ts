import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP CONSTRAINT "media_tenant_uploaded_id_tenants_id_fk";
  
  DROP INDEX "media_tenant_uploaded_idx";
  ALTER TABLE "media" DROP COLUMN "tenant_uploaded_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "tenant_uploaded_id" integer;
  ALTER TABLE "media" ADD CONSTRAINT "media_tenant_uploaded_id_tenants_id_fk" FOREIGN KEY ("tenant_uploaded_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_tenant_uploaded_idx" ON "media" USING btree ("tenant_uploaded_id");`)
}
