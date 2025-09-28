import * as migration_20250807_164422 from './20250807_164422';
import * as migration_20250928_174840_localization from './20250928_174840_localization';

export const migrations = [
  {
    up: migration_20250807_164422.up,
    down: migration_20250807_164422.down,
    name: '20250807_164422',
  },
  {
    up: migration_20250928_174840_localization.up,
    down: migration_20250928_174840_localization.down,
    name: '20250928_174840_localization'
  },
];
