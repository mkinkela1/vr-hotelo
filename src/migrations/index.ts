import * as migration_20250127_000000_add_whitelabel_to_tenants from './20250127_000000_add_whitelabel_to_tenants'
import * as migration_20250727_115210_tenants from './20250727_115210_tenants'
import * as migration_20250727_205623_add_tenant_to_media from './20250727_205623_add_tenant_to_media'

export const migrations = [
  {
    up: migration_20250727_115210_tenants.up,
    down: migration_20250727_115210_tenants.down,
    name: '20250727_115210_tenants',
  },
  {
    up: migration_20250727_205623_add_tenant_to_media.up,
    down: migration_20250727_205623_add_tenant_to_media.down,
    name: '20250727_205623_add_tenant_to_media',
  },
  {
    up: migration_20250127_000000_add_whitelabel_to_tenants.up,
    down: migration_20250127_000000_add_whitelabel_to_tenants.down,
    name: '20250127_000000_add_whitelabel_to_tenants',
  },
]
