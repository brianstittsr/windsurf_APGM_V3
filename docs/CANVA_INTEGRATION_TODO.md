# Canva Integration TODO

## Overview
Integrate Canva with the website to allow content created in Canva to be easily imported and used across the site (hero slides, social media posts, marketing materials, etc.).

---

## Phase 1: Canva Connect API Setup
**Priority:** High

### Authentication & Setup
- [ ] Register for Canva Connect API access
- [ ] Create Canva Developer App
- [ ] Implement OAuth 2.0 flow for user authentication
- [ ] Store Canva access tokens securely in Firestore
- [ ] Handle token refresh automatically

### Environment Variables Needed
```
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
CANVA_REDIRECT_URI=
```

---

## Phase 2: Design Import Features
**Priority:** High

### Browse Canva Designs
- [ ] Create `/api/canva/designs` endpoint to list user's designs
- [ ] Build design picker modal component
- [ ] Display design thumbnails with metadata
- [ ] Filter by design type (social media, presentation, etc.)
- [ ] Search designs by name

### Import Design as Image
- [ ] Export Canva design as PNG/JPG
- [ ] Download and save to `/public/images/canva/`
- [ ] Generate multiple sizes (thumbnail, medium, full)
- [ ] Return public URL for use in website

### Supported Import Destinations
- [ ] Hero Carousel slides (background images)
- [ ] Social Media posts
- [ ] Email marketing templates
- [ ] Gallery images
- [ ] Blog post featured images

---

## Phase 3: Canva Design Picker Component
**Priority:** High

### UI Components to Build
- [ ] `CanvaConnectButton` - OAuth login button
- [ ] `CanvaDesignPicker` - Modal to browse and select designs
- [ ] `CanvaDesignPreview` - Preview selected design before import
- [ ] `CanvaImportProgress` - Show import/download progress

### Integration Points
- [ ] Add "Import from Canva" button to Hero Slide Media step
- [ ] Add "Import from Canva" button to Social Media scheduler
- [ ] Add "Import from Canva" button to Email builder
- [ ] Add "Import from Canva" button to Gallery manager

---

## Phase 4: Canva Brand Kit Sync
**Priority:** Medium

### Brand Assets
- [ ] Sync brand colors from Canva
- [ ] Import brand fonts
- [ ] Import brand logos
- [ ] Store brand kit in Firestore for site-wide use

### Template Library
- [ ] List Canva brand templates
- [ ] Quick-create from template
- [ ] Customize template before import

---

## Phase 5: Two-Way Sync (Advanced)
**Priority:** Low

### Edit in Canva
- [ ] "Edit in Canva" button for imported designs
- [ ] Open Canva editor in new tab/iframe
- [ ] Webhook to detect when design is updated
- [ ] Auto-refresh imported image when design changes

### Create from Website
- [ ] Launch Canva editor with pre-filled content
- [ ] Pass website branding to Canva
- [ ] Create social posts from booking confirmations
- [ ] Generate promotional graphics from service data

---

## API Endpoints to Create

### `/api/canva/auth`
```typescript
// POST - Initiate OAuth flow
// GET - Handle OAuth callback
```

### `/api/canva/designs`
```typescript
// GET - List user's Canva designs
// Query params: type, search, limit, offset
```

### `/api/canva/import`
```typescript
// POST - Import a design as image
// Body: { designId, format, size, destination }
// Returns: { url, width, height }
```

### `/api/canva/disconnect`
```typescript
// POST - Revoke Canva access
```

---

## Database Schema

### Firestore Collection: `canvaIntegration`
```typescript
{
  userId: string,
  canvaUserId: string,
  accessToken: string (encrypted),
  refreshToken: string (encrypted),
  tokenExpiry: Timestamp,
  connectedAt: Timestamp,
  lastSync: Timestamp
}
```

### Firestore Collection: `canvaImports`
```typescript
{
  id: string,
  userId: string,
  canvaDesignId: string,
  designName: string,
  importedUrl: string,
  originalUrl: string,
  format: 'png' | 'jpg',
  width: number,
  height: number,
  usedIn: string[], // ['hero-slide-123', 'social-post-456']
  importedAt: Timestamp
}
```

---

## UI/UX Flow

### Connecting Canva Account
1. User clicks "Connect Canva" in Settings or Marketing Hub
2. Redirected to Canva OAuth consent screen
3. User authorizes access
4. Redirected back to website with success message
5. Canva designs now accessible throughout admin panel

### Importing a Design
1. User clicks "Import from Canva" button
2. Design picker modal opens
3. User browses/searches their Canva designs
4. User selects a design
5. Preview shown with size options
6. User clicks "Import"
7. Design downloaded and saved to website
8. URL automatically populated in the form field

---

## Dependencies
- [ ] `@canva/connect-api-ts` - Official Canva SDK
- [ ] OAuth 2.0 implementation
- [ ] Image processing (sharp) for resizing

---

## Security Considerations
- [ ] Encrypt access tokens at rest
- [ ] Validate Canva webhook signatures
- [ ] Rate limit API calls
- [ ] Audit log for imports

---

## Testing Checklist
- [ ] OAuth flow works correctly
- [ ] Token refresh works before expiry
- [ ] Design list loads with pagination
- [ ] Import works for various design sizes
- [ ] Imported images display correctly
- [ ] Disconnect properly revokes access
- [ ] Error handling for API failures

---

## Estimated Timeline
| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1 | 2-3 days | Canva API access |
| Phase 2 | 3-4 days | Phase 1 |
| Phase 3 | 2-3 days | Phase 2 |
| Phase 4 | 2-3 days | Phase 3 |
| Phase 5 | 4-5 days | Phase 4 |

**Total Estimated Time:** 2-3 weeks

---

## Resources
- [Canva Connect API Documentation](https://www.canva.dev/docs/connect/)
- [Canva OAuth Guide](https://www.canva.dev/docs/connect/authentication/)
- [Canva Design Export API](https://www.canva.dev/docs/connect/api-reference/designs/)
