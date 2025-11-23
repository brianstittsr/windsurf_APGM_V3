# QR Code Management System - Recreation Prompt

Use this prompt to recreate the QR Code Management System on another website's admin dashboard.

---

## PROMPT FOR AI ASSISTANT

I need you to implement a comprehensive QR Code Management System on the admin side of my website. This system should allow administrators to generate, store, track, and manage QR codes for various business purposes.

### Requirements

#### 1. Admin Dashboard Component

Create a QR Code Manager component with the following features:

**Visual Interface:**
- Statistics cards displaying:
  - Total QR Codes count
  - Active QR Codes count
  - Total Scans across all QR codes
  - Inactive QR Codes count
- Grid layout displaying all QR codes as cards
- Each QR code card should show:
  - The actual QR code image (scannable)
  - Name and active/inactive status badge
  - Description text
  - Target URL (clickable link)
  - Scan count
  - Creation date
  - Last scanned date (if applicable)
  - Action buttons: Download, Edit, Delete

**CRUD Operations:**
- **Create**: Modal form with fields:
  - Name (required)
  - Target URL (required, must be valid URL)
  - Description (optional)
  - Active status checkbox (default: true)
- **Edit**: Same modal pre-filled with existing data
- **Delete**: Confirmation dialog before deletion
- **Download**: Download QR code as PNG file with filename format: `[Name]_QRCode.png`

**QR Code Generation:**
- Automatically generate QR code image when creating/editing
- Use 400x400px resolution
- 2-pixel margin
- Black and white color scheme
- Store as base64 data URL in database

#### 2. Database Structure

Create a collection/table named `qr-codes` with the following fields:

```typescript
{
  id: string;                    // Auto-generated unique ID
  name: string;                  // Display name
  url: string;                   // Target URL for redirect
  description: string;           // Optional description
  qrCodeDataUrl: string;         // Base64 encoded PNG image
  scans: number;                 // Total scan count (default: 0)
  isActive: boolean;             // Active status (default: true)
  createdAt: Timestamp;          // Creation timestamp
  lastScannedAt?: Timestamp;     // Last scan timestamp (optional)
  updatedAt?: Timestamp;         // Last update timestamp (optional)
}
```

#### 3. API Endpoints

Create the following API endpoints:

**A. Scan Tracking Endpoint**
- **Method**: POST
- **Path**: `/api/qr-codes/scan`
- **Request Body**: `{ qrCodeId: string }`
- **Functionality**:
  - Increment the scan count by 1
  - Update lastScannedAt timestamp to current time
  - Return the target URL for redirect
- **Response**: `{ success: boolean, url: string, scans: number }`

**B. Analytics Endpoint**
- **Method**: GET
- **Path**: `/api/qr-codes/analytics`
- **Functionality**:
  - Calculate total QR codes
  - Calculate active/inactive counts
  - Calculate total scans across all codes
  - Calculate average scans per code
  - Find top 5 performing QR codes (by scan count)
  - Find 5 most recently scanned codes
  - Count codes with zero scans
- **Response**: 
```json
{
  "success": true,
  "analytics": {
    "totalQRCodes": number,
    "activeQRCodes": number,
    "inactiveQRCodes": number,
    "totalScans": number,
    "averageScans": number,
    "noScans": number,
    "topPerformers": Array<{id, name, scans, url}>,
    "recentlyScanned": Array<{id, name, lastScannedAt, scans}>
  }
}
```

#### 4. Public QR Code Redirect Page

Create a public-facing page at `/qr/[id]` that:
- Accepts QR code ID as URL parameter
- Calls the scan tracking API to increment counter
- Shows a loading screen with spinner
- Automatically redirects user to the target URL
- Shows error page if QR code is invalid or not found
- Error page should have a "Return to Home" button

#### 5. Admin Dashboard Integration

Add a new tab to the admin dashboard:
- **Tab Name**: "QR Codes"
- **Icon**: QR code icon (e.g., `fa-qrcode` or equivalent)
- **Position**: Add it to the navigation tabs
- **Overview Card**: Add a card in the dashboard overview section with:
  - Title: "QR Codes"
  - Description: "Generate and track QR codes"
  - Button: "Manage QR Codes" (navigates to QR Codes tab)

#### 6. Dependencies

Install the following packages:
- `qrcode` - For QR code generation
- `@types/qrcode` - TypeScript definitions (if using TypeScript)

#### 7. Initial Data

After implementation, create an initialization script that adds a first QR code with these details:
- **Name**: "[Your Business Name] Reviews"
- **URL**: [Provide your review page URL]
- **Description**: "Scan to leave us a review"
- **Status**: Active

### Technical Specifications

**QR Code Generation Settings:**
```javascript
{
  width: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}
```

**File Structure:**
- Component: `src/components/admin/QRCodeManager.tsx` (or equivalent)
- API Scan: `src/app/api/qr-codes/scan/route.ts` (or equivalent)
- API Analytics: `src/app/api/qr-codes/analytics/route.ts` (or equivalent)
- Public Page: `src/app/qr/[id]/page.tsx` (or equivalent)
- Init Script: `src/scripts/initializeQRCodes.ts` (or equivalent)

**Styling:**
- Use existing admin dashboard styling/theme
- Statistics cards should use color scheme: primary, success, info, warning
- QR code cards should have shadow and hover effects
- Modal should be centered with backdrop
- Buttons should follow existing button styles

**Error Handling:**
- Validate URL format before creating QR code
- Show loading states during QR generation
- Display error messages for failed operations
- Confirm before deleting QR codes
- Handle missing/invalid QR code IDs gracefully

**Security:**
- Ensure only authenticated admins can access QR Code Manager
- Validate all inputs on both client and server
- Sanitize URLs before storing
- Use HTTPS URLs only for production

### User Experience Flow

1. **Admin creates QR code:**
   - Clicks "Create QR Code" button
   - Fills in form (name, URL, description)
   - Clicks "Create QR Code"
   - System generates QR image automatically
   - QR code appears in grid
   - Admin can download PNG file

2. **Customer scans QR code:**
   - Scans QR code pointing to `/qr/[id]`
   - Sees loading screen briefly
   - Gets redirected to target URL
   - Scan is tracked automatically

3. **Admin views analytics:**
   - Sees real-time scan counts on each card
   - Views statistics cards at top
   - Can identify top-performing QR codes
   - Can see which codes haven't been scanned

### Additional Features (Optional but Recommended)

- **Search/Filter**: Add search bar to filter QR codes by name
- **Sort Options**: Sort by name, scans, date created
- **Bulk Actions**: Select multiple QR codes for bulk operations
- **Export**: Export QR code list to CSV
- **Print View**: Optimized view for printing QR codes
- **Copy URL**: Quick copy button for QR redirect URL

### Testing Checklist

After implementation, verify:
- [ ] QR codes generate correctly
- [ ] QR codes are scannable with phone camera
- [ ] Scan tracking increments counter
- [ ] Download produces valid PNG file
- [ ] Edit updates QR code and regenerates image
- [ ] Delete removes QR code from database
- [ ] Public redirect page works correctly
- [ ] Analytics calculations are accurate
- [ ] Error handling works for invalid IDs
- [ ] Only admins can access manager
- [ ] Mobile responsive design works

### Example Usage

After implementation, the admin should be able to:

```
1. Create a QR code for Facebook reviews
2. Download the QR code image
3. Print it on business cards
4. Place it in physical location
5. Track how many people scan it
6. See when it was last scanned
7. Update the URL if needed
8. Deactivate it without losing data
```

### Documentation

Please also create:
- README section explaining how to use the QR Code Manager
- Comments in code explaining key functions
- API endpoint documentation
- Database schema documentation

---

## END OF PROMPT

### Usage Instructions

1. Copy the prompt above (from "I need you to implement..." to "...Database schema documentation")
2. Paste it to your AI assistant
3. Provide any site-specific details:
   - Your database type (Firestore, MongoDB, PostgreSQL, etc.)
   - Your framework (Next.js, React, Vue, etc.)
   - Your styling framework (Bootstrap, Tailwind, Material-UI, etc.)
   - Your review page URL for the initial QR code
4. Let the AI implement the system
5. Test thoroughly before deploying to production

### Customization Options

You can modify the prompt to add:
- Custom branding colors for QR codes
- Logo embedding in QR codes
- Different QR code sizes
- Additional tracking fields (location, device type, etc.)
- Integration with your CRM system
- Email notifications on scans
- Scheduled reports

### Notes

- The system uses base64 encoding to store QR codes in the database
- QR codes are generated on-demand, not pre-generated
- Scan tracking happens server-side for accuracy
- The public redirect page ensures all scans are tracked
- Inactive QR codes still redirect but can be filtered in analytics
