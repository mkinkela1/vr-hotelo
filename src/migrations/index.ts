import * as migration_20250807_164422 from './20250807_164422';
import * as migration_20250928_174840_localization from './20250928_174840_localization';
import * as migration_20250930_104724_orders_email_and_ai_content from './20250930_104724_orders_email_and_ai_content';
import * as migration_20251004_204241_localization_ai_content from './20251004_204241_localization_ai_content';
import * as migration_20251004_210220_remove_tenant_uploaded from './20251004_210220_remove_tenant_uploaded';

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
    name: '20251004_210220_remove_tenant_uploaded'
  },
];
