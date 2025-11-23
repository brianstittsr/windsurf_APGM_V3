# QR Code System - Quick Recreation Prompt

## SHORT VERSION PROMPT

```
Implement a QR Code Management System on my admin dashboard with these features:

1. ADMIN COMPONENT (QRCodeManager):
   - Statistics cards: Total QR Codes, Active, Total Scans, Inactive
   - Grid of QR code cards showing: image, name, URL, scans, dates
   - CRUD operations: Create, Edit, Delete, Download PNG
   - Form fields: name (required), URL (required), description, active status
   - Auto-generate 400x400px QR codes using the 'qrcode' npm package

2. DATABASE (qr-codes collection):
   {
     id, name, url, description, qrCodeDataUrl (base64), 
     scans (number), isActive (boolean), 
     createdAt, lastScannedAt, updatedAt
   }

3. API ENDPOINTS:
   - POST /api/qr-codes/scan - Track scans, increment counter, return URL
   - GET /api/qr-codes/analytics - Return statistics and top performers

4. PUBLIC PAGE (/qr/[id]):
   - Track scan via API
   - Show loading screen
   - Redirect to target URL
   - Error page for invalid IDs

5. DASHBOARD INTEGRATION:
   - Add "QR Codes" tab with qrcode icon
   - Add overview card linking to QR Codes tab

6. INITIAL DATA:
   Create first QR code for: [YOUR_REVIEW_URL]
   Name: "Customer Reviews"

Install: npm install qrcode @types/qrcode

Use my existing admin styling and database setup.
```

## USAGE

1. Copy the prompt above
2. Replace [YOUR_REVIEW_URL] with your actual review page URL
3. Paste to AI assistant
4. Specify your tech stack if needed
5. Review and test implementation

## TECH STACK VARIATIONS

### For Next.js + Firestore:
"Use Next.js App Router, React components, Firestore for database, and Bootstrap/Tailwind for styling."

### For React + MongoDB:
"Use React with React Router, MongoDB for database, Express API endpoints, and Material-UI for styling."

### For Vue + Supabase:
"Use Vue 3 with Vue Router, Supabase for database and API, and Vuetify for styling."

## EXPECTED DELIVERABLES

- QRCodeManager component
- 2 API endpoints (scan, analytics)
- Public redirect page
- Database schema
- Initial data script
- Documentation

## TESTING

After implementation:
1. Create a QR code
2. Download the PNG
3. Scan with phone camera
4. Verify redirect works
5. Check scan counter incremented
6. View analytics

## CUSTOMIZATION

Add to prompt if needed:
- "Include search/filter functionality"
- "Add bulk operations"
- "Export to CSV"
- "Custom QR code colors"
- "Logo embedding"
- "Geolocation tracking"
- "Email notifications on scans"
