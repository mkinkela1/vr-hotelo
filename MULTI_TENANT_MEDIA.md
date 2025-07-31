# Multi-Tenant Media Setup

This project implements a multi-tenant media system using PayloadCMS and the `@payloadcms/plugin-multi-tenant` plugin. Each tenant can upload and manage their own media files, with the ability to share media across all tenants.

## Features

- **Tenant-Specific Media**: Each tenant can only see and manage their own media files
- **Shared Media**: Media can be marked as "shared" to be visible across all tenants
- **Automatic Tenant Association**: Media is automatically associated with the current tenant when uploaded
- **Role-Based Access**: Different access levels for super admins, tenant admins, and regular users
- **Domain-Based Tenant Detection**: Automatic tenant detection based on domain

## Setup

### 1. Collections Configuration

#### Media Collection (`src/collections/Media.ts`)

- Configured with tenant-specific access control
- Includes `isShared` field for cross-tenant media sharing
- Automatic image resizing and optimization
- Support for images, videos, and PDFs

#### Tenants Collection (`src/collections/Tenants.ts`)

- Global collection (not tenant-specific)
- Includes tenant settings for media uploads
- Domain and slug-based tenant identification
- Configurable media upload constraints per tenant

#### Users Collection (`src/collections/Users/Users.ts`)

- Multi-tenant user management
- Role-based access control
- Automatic tenant association on login

### 2. Multi-Tenant Plugin Configuration

The plugin is configured in `src/plugins/multi-tenant-plugin.ts` with:

- Media collection enabled for tenant access
- Users collection with tenant associations
- Debug mode enabled in development
- Proper access control for tenant management

### 3. Domain-Based Tenant Detection

The system automatically detects tenants based on the domain using the `setCookieBasedOnDomain` hook in the Users collection.

## Usage

### Uploading Media

1. **Via Admin Panel**:
   - Log in to the admin panel
   - Navigate to the Media collection
   - Upload files (automatically associated with current tenant)
   - Optionally mark as "shared" for cross-tenant visibility

2. **Via API**:

   ```typescript
   // Upload media via API
   const formData = new FormData()
   formData.append('file', file)
   formData.append('alt', 'Image description')

   const response = await fetch('/api/media', {
     method: 'POST',
     body: formData,
     headers: {
       Authorization: `Bearer ${token}`,
     },
   })
   ```

### Querying Media

1. **Via Admin Panel**:
   - Media is automatically filtered by tenant
   - Shared media is visible to all tenants
   - Super admins can see all media

2. **Via API**:

   ```typescript
   // Get tenant-specific media
   const response = await fetch('/api/media', {
     headers: {
       Authorization: `Bearer ${token}`,
     },
   })

   const { data: media } = await response.json()
   ```

3. **Via Payload SDK**:

   ```typescript
   import payload from 'payload'

   // Media is automatically filtered by tenant
   const media = await payload.find({
     collection: 'media',
     depth: 1,
     limit: 100,
   })
   ```

### Managing Shared Media

- Only super admins can create/edit/delete shared media
- Regular users can view shared media but cannot modify it
- Shared media appears in all tenant contexts

## Access Control

### User Roles

1. **Super Admin**:
   - Can access all media across all tenants
   - Can create/edit/delete shared media
   - Can manage tenant settings

2. **Tenant Admin**:
   - Can manage media within their assigned tenants
   - Cannot access media from other tenants (unless shared)
   - Cannot create shared media

3. **Tenant Viewer**:
   - Can view media within their assigned tenants
   - Cannot upload or modify media
   - Can view shared media

### Media Access Rules

1. **Tenant-Specific Media**: Only accessible to users associated with that tenant
2. **Shared Media**: Accessible to all authenticated users
3. **Public Media**: Readable by anyone (if configured)

## Configuration

### Tenant Settings

Each tenant can have custom media upload settings:

```typescript
{
  settings: {
    allowMediaUpload: true,
    maxMediaSize: 10, // MB
    allowedMediaTypes: ['image/*', 'video/*', 'application/pdf']
  }
}
```

### Environment Variables

```bash
# Required
PAYLOAD_SECRET=your-secret-key
DATABASE_URI=your-database-connection-string

# Optional
NODE_ENV=development # Enables debug mode for multi-tenant plugin
```

## API Endpoints

### GET /api/media

Returns tenant-specific media files.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "media-id",
      "filename": "image.jpg",
      "alt": "Image description",
      "isShared": false,
      "url": "https://example.com/media/image.jpg",
      "sizes": {
        "thumbnail": "https://example.com/media/image-thumbnail.jpg",
        "card": "https://example.com/media/image-card.jpg"
      }
    }
  ],
  "totalDocs": 1,
  "totalPages": 1
}
```

### POST /api/media

Uploads a new media file for the current tenant.

**Request:**

- `file`: The file to upload
- `alt`: Alt text for the image

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-media-id",
    "filename": "uploaded-file.jpg",
    "alt": "Uploaded image",
    "url": "https://example.com/media/uploaded-file.jpg"
  }
}
```

## Troubleshooting

### Common Issues

1. **Media not showing up**: Check if the user has access to the tenant
2. **Upload failures**: Verify tenant media upload settings
3. **Shared media not visible**: Ensure the user is authenticated
4. **Domain detection issues**: Check the `setCookieBasedOnDomain` hook

### Debug Mode

Enable debug mode in development to see tenant fields in the admin panel:

```typescript
// In multi-tenant-plugin.ts
debug: process.env.NODE_ENV === 'development'
```

## Security Considerations

1. **File Upload Validation**: All uploads are validated for type and size
2. **Tenant Isolation**: Media is strictly isolated by tenant
3. **Access Control**: Role-based access control at multiple levels
4. **Domain Validation**: Tenant detection is based on verified domains

## Future Enhancements

- [ ] Tenant-specific storage locations
- [ ] Advanced media processing per tenant
- [ ] Media usage analytics per tenant
- [ ] Bulk media operations
- [ ] Media versioning and rollback
