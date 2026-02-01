import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Add 'sl' to enum_media_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sl' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_locale" ADD VALUE 'sl';
      END IF;
    END $$;
  `)
  
  // Step 2: Add 'sl' to enum_media_localized_titles_locale if it doesn't exist
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'sl' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_media_localized_titles_locale')
      ) THEN
        ALTER TYPE "public"."enum_media_localized_titles_locale" ADD VALUE 'sl';
      END IF;
    END $$;
  `)

  // Step 3: Update all data from 'si' to 'sl' in media_locale table
  await db.execute(sql`
    UPDATE "public"."media_locale"
    SET "value" = 'sl'::enum_media_locale
    WHERE "value" = 'si'::enum_media_locale;
  `)

  // Step 4: Update all data from 'si' to 'sl' in media_localized_titles table
  await db.execute(sql`
    UPDATE "public"."media_localized_titles"
    SET "locale" = 'sl'::enum_media_localized_titles_locale
    WHERE "locale" = 'si'::enum_media_localized_titles_locale;
  `)

  // Step 5: Recreate enum_media_locale without 'si' and with 'sl'
  // PostgreSQL doesn't support removing enum values, so we need to recreate the enum
  await db.execute(sql`
    -- Create temporary enum type
    CREATE TYPE "public"."enum_media_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'sl');
    
    -- Alter the column to use the new enum type
    ALTER TABLE "public"."media_locale" 
      ALTER COLUMN "value" TYPE "public"."enum_media_locale_new" 
      USING "value"::text::"public"."enum_media_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_locale_new" RENAME TO "enum_media_locale";
  `)

  // Step 6: Recreate enum_media_localized_titles_locale without 'si' and with 'sl'
  await db.execute(sql`
    -- Create temporary enum type
    CREATE TYPE "public"."enum_media_localized_titles_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'sl');
    
    -- Alter the column to use the new enum type
    ALTER TABLE "public"."media_localized_titles" 
      ALTER COLUMN "locale" TYPE "public"."enum_media_localized_titles_locale_new" 
      USING "locale"::text::"public"."enum_media_localized_titles_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_localized_titles_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_localized_titles_locale_new" RENAME TO "enum_media_localized_titles_locale";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reverse the process: change 'sl' back to 'si'
  
  // Step 1: Add 'si' back to enum_media_locale if it doesn't exist
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
  
  // Step 2: Add 'si' back to enum_media_localized_titles_locale if it doesn't exist
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

  // Step 3: Update all data from 'sl' back to 'si' in media_locale table
  await db.execute(sql`
    UPDATE "public"."media_locale"
    SET "value" = 'si'::enum_media_locale
    WHERE "value" = 'sl'::enum_media_locale;
  `)

  // Step 4: Update all data from 'sl' back to 'si' in media_localized_titles table
  await db.execute(sql`
    UPDATE "public"."media_localized_titles"
    SET "locale" = 'si'::enum_media_localized_titles_locale
    WHERE "locale" = 'sl'::enum_media_localized_titles_locale;
  `)

  // Step 5: Recreate enum_media_locale with 'si' instead of 'sl'
  await db.execute(sql`
    CREATE TYPE "public"."enum_media_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'si');
    
    ALTER TABLE "public"."media_locale" 
      ALTER COLUMN "value" TYPE "public"."enum_media_locale_new" 
      USING "value"::text::"public"."enum_media_locale_new";
    
    DROP TYPE "public"."enum_media_locale";
    
    ALTER TYPE "public"."enum_media_locale_new" RENAME TO "enum_media_locale";
  `)

  // Step 6: Recreate enum_media_localized_titles_locale with 'si' instead of 'sl'
  await db.execute(sql`
    CREATE TYPE "public"."enum_media_localized_titles_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'si');
    
    ALTER TABLE "public"."media_localized_titles" 
      ALTER COLUMN "locale" TYPE "public"."enum_media_localized_titles_locale_new" 
      USING "locale"::text::"public"."enum_media_localized_titles_locale_new";
    
    DROP TYPE "public"."enum_media_localized_titles_locale";
    
    ALTER TYPE "public"."enum_media_localized_titles_locale_new" RENAME TO "enum_media_localized_titles_locale";
  `)
}
