# Tenant Logo System

This system automatically detects the current tenant and displays the appropriate logo based on the URL domain or cookie settings.

## How It Works

### 1. Tenant Detection Logic

The system uses the following priority order to determine the current tenant:

1. **For Super Admins**:
   - If a tenant is set in the `payload-tenant` cookie, use that tenant
   - If no cookie is set, show the default logo

2. **For Regular Users**:
   - First try to get tenant from the `payload-tenant` cookie
   - If no cookie, detect tenant from the URL domain
   - If no tenant found, show the default logo

### 2. Domain-Based Detection

When a user visits a URL like `tenant-1.com`, the system:

- Looks up the tenant with `domain: 'tenant-1.com'`
- Only considers active tenants (`isActive: true`)
- Sets the tenant ID in the `payload-tenant` cookie for future requests

### 3. Logo Display

The logo component (`src/graphics/Logo.tsx`) automatically:

- Fetches the current tenant's logo from the database
- Falls back to the default logo (`/vrhotelo-logo.png`) if no tenant logo is found
- Works in both the admin panel and frontend

## Implementation Details

### Key Files

- `src/utils/get-tenant-from-request.ts` - Main utility for tenant detection
- `src/graphics/Logo.tsx` - Updated logo component
- `src/collections/Users/hooks/setCookieBasedOnDomain.ts` - Cookie setting on login

### Usage

```typescript
import { getTenantFromRequest, getTenantLogo } from '@/utils/get-tenant-from-request'

// Get current tenant ID
const tenantId = await getTenantFromRequest()

// Get current tenant's logo URL
const logoUrl = await getTenantLogo()
```

### Testing

1. **Local Development**:
   - Add entries to your `/etc/hosts` file:
     ```
     127.0.0.1 tenant-1.com
     127.0.0.1 tenant-2.com
     ```
   - Visit `http://tenant-1.com:3000` to see tenant-specific logos

2. **Admin Panel**:
   - Super admins can switch between tenants using the tenant selector
   - The logo will update based on the selected tenant

## Configuration

### Tenant Setup

Each tenant in the database should have:

- `name`: Display name
- `slug`: URL-friendly identifier
- `domain`: Primary domain for this tenant
- `logo`: Uploaded logo file (optional)
- `isActive`: Whether the tenant is active

### Example Tenant Data

```json
{
  "name": "Tenant 1",
  "slug": "tenant-1",
  "domain": "tenant-1.com",
  "logo": {
    "id": 1,
    "url": "/media/tenant-1-logo.png"
  },
  "isActive": true
}
```

## Security Considerations

- Only active tenants are considered for domain detection
- Super admins can access all tenants but see the default logo when no specific tenant is selected
- Regular users are restricted to their assigned tenants
- Cookie values are validated against the database

## Troubleshooting

### Common Issues

1. **Logo not showing**: Check if the tenant has a logo uploaded
2. **Wrong tenant detected**: Verify the domain matches exactly in the database
3. **Cookie not set**: Check the `setCookieBasedOnDomain` hook is working
4. **Super admin sees default logo**: This is expected when no specific tenant is selected

### Debug Mode

Enable debug logging in development to see tenant detection:

```typescript
// In get-tenant-from-request.ts
console.log('Current host:', host)
console.log('Tenant from cookie:', tenantFromCookie)
console.log('Detected tenant:', tenantId)
```
