import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add 'si' to enum_media_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'si' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_locale" ADD VALUE 'si';
      END IF;
    END $$;
  `)
  
  // Add 'si' to enum_media_localized_titles_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'si' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_localized_titles_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_localized_titles_locale" ADD VALUE 'si';
      END IF;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Note: PostgreSQL does not support removing values from ENUM types directly.
  // To properly rollback, we would need to recreate the ENUMs without 'si',
  // but this is complex and may break existing data. For safety, we'll leave
  // this as a no-op. If rollback is truly needed, it should be done manually
  // with data migration.
  await db.execute(sql`
    -- Rollback not supported for ENUM value removal
    -- Manual intervention required if needed
  `)
}
