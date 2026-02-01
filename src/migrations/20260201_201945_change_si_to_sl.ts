import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Recreate enum_media_locale without 'si' and with 'sl'
  // PostgreSQL doesn't support removing enum values, so we need to recreate the enum
  // The USING clause converts 'si' to 'sl' during the type change
  await db.execute(sql`
    -- Create temporary enum type with 'sl' instead of 'si'
    CREATE TYPE "public"."enum_media_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'sl');
    
    -- Alter the column to use the new enum type, converting 'si' to 'sl' during the change
    ALTER TABLE "public"."media_locale" 
      ALTER COLUMN "value" TYPE "public"."enum_media_locale_new" 
      USING CASE 
        WHEN "value"::text = 'si' THEN 'sl'::text
        ELSE "value"::text
      END::"public"."enum_media_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_locale_new" RENAME TO "enum_media_locale";
  `)

  // Step 2: Recreate enum_media_localized_titles_locale without 'si' and with 'sl'
  await db.execute(sql`
    -- Create temporary enum type with 'sl' instead of 'si'
    CREATE TYPE "public"."enum_media_localized_titles_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'sl');
    
    -- Alter the column to use the new enum type, converting 'si' to 'sl' during the change
    ALTER TABLE "public"."media_localized_titles" 
      ALTER COLUMN "locale" TYPE "public"."enum_media_localized_titles_locale_new" 
      USING CASE 
        WHEN "locale"::text = 'si' THEN 'sl'::text
        ELSE "locale"::text
      END::"public"."enum_media_localized_titles_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_localized_titles_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_localized_titles_locale_new" RENAME TO "enum_media_localized_titles_locale";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reverse the process: change 'sl' back to 'si'
  
  // Step 1: Recreate enum_media_locale with 'si' instead of 'sl'
  await db.execute(sql`
    -- Create temporary enum type with 'si' instead of 'sl'
    CREATE TYPE "public"."enum_media_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'si');
    
    -- Alter the column to use the new enum type, converting 'sl' to 'si' during the change
    ALTER TABLE "public"."media_locale" 
      ALTER COLUMN "value" TYPE "public"."enum_media_locale_new" 
      USING CASE 
        WHEN "value"::text = 'sl' THEN 'si'::text
        ELSE "value"::text
      END::"public"."enum_media_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_locale_new" RENAME TO "enum_media_locale";
  `)

  // Step 2: Recreate enum_media_localized_titles_locale with 'si' instead of 'sl'
  await db.execute(sql`
    -- Create temporary enum type with 'si' instead of 'sl'
    CREATE TYPE "public"."enum_media_localized_titles_locale_new" AS ENUM('hr', 'en', 'fr', 'de', 'it', 'si');
    
    -- Alter the column to use the new enum type, converting 'sl' to 'si' during the change
    ALTER TABLE "public"."media_localized_titles" 
      ALTER COLUMN "locale" TYPE "public"."enum_media_localized_titles_locale_new" 
      USING CASE 
        WHEN "locale"::text = 'sl' THEN 'si'::text
        ELSE "locale"::text
      END::"public"."enum_media_localized_titles_locale_new";
    
    -- Drop the old enum type
    DROP TYPE "public"."enum_media_localized_titles_locale";
    
    -- Rename the new enum type to the original name
    ALTER TYPE "public"."enum_media_localized_titles_locale_new" RENAME TO "enum_media_localized_titles_locale";
  `)
}
