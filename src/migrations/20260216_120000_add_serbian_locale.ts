import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add 'sr' to enum_media_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sr' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_locale" ADD VALUE 'sr';
      END IF;
    END $$;
  `)
  
  // Add 'sr' to enum_media_localized_titles_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sr' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_localized_titles_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_localized_titles_locale" ADD VALUE 'sr';
      END IF;
    END $$;
  `)
  
  // Add 'ai_content_sr' column to tenants table if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'ai_content_sr'
      ) THEN
        ALTER TABLE "public"."tenants" ADD COLUMN "ai_content_sr" varchar;
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Drop the ai_content_sr column
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tenants' 
        AND column_name = 'ai_content_sr'
      ) THEN
        ALTER TABLE "public"."tenants" DROP COLUMN "ai_content_sr";
      END IF;
    END $$;
  `)
  
  // Note: PostgreSQL does not support removing values from ENUM types directly.
  // To properly rollback, we would need to recreate the ENUMs without 'sr',
  // but this is complex and may break existing data. For safety, we'll leave
  // this as a no-op. If rollback is truly needed, it should be done manually
  // with data migration.
  await db.execute(sql`
    -- Rollback not supported for ENUM value removal
    -- Manual intervention required if needed
  `)
}
