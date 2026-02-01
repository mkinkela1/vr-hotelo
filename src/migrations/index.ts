import * as migration_20250807_164422 from './20250807_164422';
import * as migration_20250928_174840_localization from './20250928_174840_localization';
import * as migration_20250930_104724_orders_email_and_ai_content from './20250930_104724_orders_email_and_ai_content';
import * as migration_20251004_204241_localization_ai_content from './20251004_204241_localization_ai_content';
import * as migration_20251004_210220_remove_tenant_uploaded from './20251004_210220_remove_tenant_uploaded';
import * as migration_20251005_191009_one_ai_content_per_lang from './20251005_191009_one_ai_content_per_lang';
import * as migration_20251116_232749_update_media from './20251116_232749_update_media';
import * as migration_20251207_175806_revert_locale from './20251207_175806_revert_locale';
import * as migration_20251213_103841_locale_title from './20251213_103841_locale_title';
import * as migration_20260201_194711_add_slovenian_locale from './20260201_194711_add_slovenian_locale';
import * as migration_20260201_201945_change_si_to_sl from './20260201_201945_change_si_to_sl';

export const migrations = [
  {
    up: migration_20250807_164422.up,
    down: migration_20250807_164422.down,
    name: '20250807_164422',
  },
  {
    up: migration_20250928_174840_localization.up,
    down: migration_20250928_174840_localization.down,
    name: '20250928_174840_localization',
  },
  {
    up: migration_20250930_104724_orders_email_and_ai_content.up,
    down: migration_20250930_104724_orders_email_and_ai_content.down,
    name: '20250930_104724_orders_email_and_ai_content',
  },
  {
    up: migration_20251004_204241_localization_ai_content.up,
    down: migration_20251004_204241_localization_ai_content.down,
    name: '20251004_204241_localization_ai_content',
  },
  {
    up: migration_20251004_210220_remove_tenant_uploaded.up,
    down: migration_20251004_210220_remove_tenant_uploaded.down,
    name: '20251004_210220_remove_tenant_uploaded',
  },
  {
    up: migration_20251005_191009_one_ai_content_per_lang.up,
    down: migration_20251005_191009_one_ai_content_per_lang.down,
    name: '20251005_191009_one_ai_content_per_lang',
  },
  {
    up: migration_20251116_232749_update_media.up,
    down: migration_20251116_232749_update_media.down,
    name: '20251116_232749_update_media',
  },
  {
    up: migration_20251207_175806_revert_locale.up,
    down: migration_20251207_175806_revert_locale.down,
    name: '20251207_175806_revert_locale',
  },
  {
    up: migration_20251213_103841_locale_title.up,
    down: migration_20251213_103841_locale_title.down,
    name: '20251213_103841_locale_title'
  },
  {
    up: migration_20260201_194711_add_slovenian_locale.up,
    down: migration_20260201_194711_add_slovenian_locale.down,
    name: '20260201_194711_add_slovenian_locale'
  },
  {
    up: migration_20260201_201945_change_si_to_sl.up,
    down: migration_20260201_201945_change_si_to_sl.down,
    name: '20260201_201945_change_si_to_sl'
  },
];
