# QR Code Management System

## Overview

The QR Code Management System allows administrators to generate, track, and manage QR codes for various business purposes. The system includes automatic scan tracking, analytics, and easy download capabilities.

## Features

### 1. QR Code Generation
- **Automatic Generation**: QR codes are automatically generated when you create a new entry
- **High Quality**: 400x400px resolution with proper margins
- **Customizable**: Black and white color scheme for maximum compatibility

### 2. QR Code Management
- **Create**: Generate new QR codes with custom names, URLs, and descriptions
- **Edit**: Update existing QR codes (regenerates the QR image)
- **Delete**: Remove QR codes that are no longer needed
- **Activate/Deactivate**: Toggle QR code status without deleting

### 3. Tracking & Analytics
- **Scan Count**: Automatic tracking of how many times each QR code is scanned
- **Last Scanned**: Timestamp of the most recent scan
- **Statistics Dashboard**: Overview of total QR codes, active codes, and total scans

### 4. Download & Distribution
- **PNG Download**: Download QR codes as high-quality PNG images
- **Print Ready**: Generated images are suitable for printing on marketing materials

## Pre-Configured QR Codes

### Facebook Reviews QR Code
The system comes pre-configured with a QR code for Facebook reviews:

- **Name**: Facebook Reviews
- **URL**: https://www.facebook.com/people/A-Pretty-Girl-Matter/61581970516037/?sk=reviews
- **Description**: Scan to leave a review on our Facebook page
- **Status**: Active

This QR code can be:
- Printed on business cards
- Displayed in the salon
- Added to marketing materials
- Shared via email or social media

## Admin Dashboard Access

### Location
Navigate to: **Admin Dashboard → QR Codes** tab

### Interface Sections

#### 1. Statistics Cards
- **Total QR Codes**: Count of all QR codes in the system
- **Active QR Codes**: Count of currently active QR codes
- **Total Scans**: Cumulative scan count across all QR codes
- **Inactive QR Codes**: Count of deactivated QR codes

#### 2. QR Code Grid
Each QR code card displays:
- QR code image (scannable)
- Name and status badge
- Description
- Target URL (clickable)
- Scan statistics
- Creation date
- Last scanned date (if applicable)
- Action buttons (Download, Edit, Delete)

#### 3. Create/Edit Modal
Form fields:
- **Name** (required): Descriptive name for internal reference
- **Target URL** (required): The destination URL when scanned
- **Description** (optional): Internal notes about the QR code's purpose
- **Active Status**: Toggle to enable/disable the QR code

## API Endpoints

### 1. Scan Tracking
**POST** `/api/qr-codes/scan`

Tracks a QR code scan and returns the target URL.

**Request Body:**
```json
{
  "qrCodeId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "scans": 42
}
```

### 2. Analytics
**GET** `/api/qr-codes/analytics`

Returns comprehensive analytics for all QR codes.

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalQRCodes": 5,
    "activeQRCodes": 4,
    "inactiveQRCodes": 1,
    "totalScans": 150,
    "averageScans": 30,
    "noScans": 1,
    "topPerformers": [...],
    "recentlyScanned": [...]
  }
}
```

## Public QR Code Redirect

### URL Format
`https://yourdomain.com/qr/[qr-code-id]`

### How It Works
1. User scans QR code pointing to `/qr/[id]`
2. System tracks the scan (increments counter, updates timestamp)
3. User is automatically redirected to the target URL
4. Loading screen shows during the process

### Example
If a QR code has ID `abc123`, the URL would be:
```
https://yourdomain.com/qr/abc123
```

## Data Structure

### Firestore Collection: `qr-codes`

```typescript
{
  id: string;                    // Auto-generated document ID
  name: string;                  // Display name
  url: string;                   // Target URL
  description: string;           // Optional description
  qrCodeDataUrl: string;         // Base64 encoded PNG image
  scans: number;                 // Total scan count
  isActive: boolean;             // Active status
  createdAt: Timestamp;          // Creation timestamp
  lastScannedAt?: Timestamp;     // Last scan timestamp
  updatedAt?: Timestamp;         // Last update timestamp
}
```

## Usage Examples

### Creating a New QR Code

1. Click "Create QR Code" button
2. Fill in the form:
   - Name: "Instagram Profile"
   - URL: "https://instagram.com/yourprofile"
   - Description: "Follow us on Instagram"
   - Active: ✓
3. Click "Create QR Code"
4. System generates QR code automatically
5. Download the QR code image
6. Print or share as needed

### Editing an Existing QR Code

1. Find the QR code in the grid
2. Click the Edit button (yellow pencil icon)
3. Update the desired fields
4. Click "Update QR Code"
5. System regenerates the QR code with new URL if changed

### Downloading QR Codes

1. Find the QR code in the grid
2. Click the "Download" button
3. PNG file downloads automatically
4. File name format: `[Name]_QRCode.png`

### Tracking Performance

1. View scan count on each QR code card
2. Check "Last Scanned" date to see recent activity
3. Use statistics cards for overall metrics
4. Access `/api/qr-codes/analytics` for detailed reports

## Best Practices

### QR Code Placement
- **Size**: Minimum 2cm x 2cm for reliable scanning
- **Contrast**: Ensure good contrast with background
- **Location**: Place at eye level when possible
- **Lighting**: Avoid reflective surfaces or poor lighting

### URL Management
- Use short, clean URLs when possible
- Test URLs before generating QR codes
- Use HTTPS for security
- Consider using URL shorteners for tracking

### Naming Convention
- Use descriptive names: "Facebook Reviews", "Instagram Profile"
- Include location if multiple venues: "Salon A - Reviews"
- Add campaign names: "Summer 2024 - Discount"

### Security
- Regularly audit active QR codes
- Deactivate unused QR codes instead of deleting
- Monitor scan analytics for suspicious activity
- Use HTTPS URLs only

## Maintenance

### Regular Tasks
- **Weekly**: Review scan statistics
- **Monthly**: Audit active QR codes
- **Quarterly**: Update URLs if needed
- **Yearly**: Regenerate QR codes for printed materials

### Troubleshooting

**QR Code Not Scanning:**
- Check if QR code is active
- Verify URL is accessible
- Ensure adequate size and contrast
- Test with multiple QR code readers

**Scans Not Tracking:**
- Verify Firestore permissions
- Check API endpoint logs
- Ensure QR code ID is correct
- Test redirect URL manually

**Download Issues:**
- Check browser permissions
- Verify QR code image was generated
- Try different browser
- Clear browser cache

## Integration with Other Systems

### GoHighLevel Integration
QR code scans can trigger GHL workflows:
- Create contact when scanned
- Send follow-up SMS
- Add to specific pipeline
- Tag with QR code source

### BMAD Workflows
Integrate QR scans with automated workflows:
- Welcome messages
- Appointment reminders
- Review requests
- Loyalty program enrollment

### Analytics Platforms
Export scan data to:
- Google Analytics
- Facebook Pixel
- Custom analytics dashboards

## Future Enhancements

### Planned Features
- [ ] Dynamic QR codes (change URL without regenerating)
- [ ] A/B testing for different URLs
- [ ] Geolocation tracking
- [ ] Time-based analytics
- [ ] Bulk QR code generation
- [ ] Custom QR code colors and logos
- [ ] QR code templates
- [ ] Export analytics to CSV/PDF

## Support

For issues or questions:
1. Check this documentation
2. Review Firestore logs
3. Test API endpoints manually
4. Contact system administrator

## Initialization Script

To reinitialize the Facebook Reviews QR code:

```bash
npm run init-facebook-qr
```

This script will:
- Generate a new QR code for Facebook reviews
- Update existing entry if found
- Create new entry if not found
- Output success confirmation

## File Locations

- **Component**: `src/components/admin/QRCodeManager.tsx`
- **API - Scan**: `src/app/api/qr-codes/scan/route.ts`
- **API - Analytics**: `src/app/api/qr-codes/analytics/route.ts`
- **Public Page**: `src/app/qr/[id]/page.tsx`
- **Init Script**: `src/scripts/initializeFacebookReviewsQR.ts`
- **Documentation**: `docs/QR_CODE_SYSTEM.md`

## Dependencies

- `qrcode`: QR code generation library
- `@types/qrcode`: TypeScript definitions
- Firebase Firestore: Data storage
- Next.js: Routing and API

## Version History

- **v1.0.0** (2024): Initial release
  - QR code generation
  - Scan tracking
  - Admin dashboard
  - Facebook Reviews pre-configuration
