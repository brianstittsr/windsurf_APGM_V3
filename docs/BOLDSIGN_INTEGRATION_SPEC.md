# BoldSign Integration Specification for PMU Forms

## Overview

This document outlines the recommended integration of BoldSign eSignature platform with the A Pretty Girl Lash & Makeup (APGM) website for managing PMU (Permanent Makeup) consent forms, health questionnaires, and other required documents.

## Business Requirements

### Core Requirements
1. **Dynamic Form Sending**: Automatically send appropriate forms based on the procedure(s) booked
2. **Multi-Procedure Support**: Handle scenarios where clients book multiple procedures (e.g., Microblading + Lip Blush)
3. **Signature Tracking**: Capture and display when forms are signed successfully
4. **Reminder System**: Send email and SMS reminders via GHL for unsigned forms
5. **Admin Notifications**: Notify Victoria (Victoria@aprettygirllatter.com / 919-441-0932) when forms are signed
6. **Configuration Screen**: Admin interface to manage form-to-procedure mappings

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APGM Admin Dashboard                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Form Config     │  │ Booking System  │  │ Client Profile  │     │
│  │ Manager         │  │                 │  │                 │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                    ┌───────────▼───────────┐                       │
│                    │   Form Automation     │                       │
│                    │   Service             │                       │
│                    └───────────┬───────────┘                       │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BoldSign API  │    │   GHL API       │    │   Firebase      │
│   (eSignatures) │    │   (Reminders)   │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## BoldSign API Integration

### Authentication
- **Method**: API Key authentication
- **Endpoint**: `https://api.boldsign.com/v1/` (US region)
- **Headers**: `X-API-KEY: {your_api_key}`

### Key API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/template/list` | Fetch available templates from BoldSign |
| `GET /v1/template/{templateId}` | Get template details |
| `POST /v1/template/send` | Send document from template |
| `POST /v1/template/sendUsingMultipleTemplates` | Send multiple forms at once |
| `GET /v1/document/{documentId}` | Check document status |
| `POST /v1/document/{documentId}/remind` | Send reminder for unsigned document |
| `GET /v1/document/{documentId}/download` | Download signed document |

### Webhook Events to Listen For

| Event | Action |
|-------|--------|
| `document.Completed` | Mark forms as signed, notify Victoria via GHL |
| `document.Signed` | Update individual signer status |
| `document.Declined` | Alert admin, trigger follow-up |
| `document.Expired` | Trigger reminder workflow |
| `document.Viewed` | Track engagement |

---

## Database Schema

### New Firestore Collections

#### `boldsign_config` (Configuration)
```typescript
interface BoldSignConfig {
  id: string;
  apiKey: string;           // Encrypted
  webhookSecret: string;    // For verifying webhooks
  defaultBrandId?: string;
  notificationEmail: string;  // Victoria@aprettygirllatter.com
  notificationPhone: string;  // 919-441-0932
  reminderSchedule: {
    firstReminder: number;   // Hours after sending (e.g., 24)
    secondReminder: number;  // Hours after first (e.g., 48)
    finalReminder: number;   // Hours before appointment (e.g., 24)
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `boldsign_templates` (Template Mappings)
```typescript
interface BoldSignTemplate {
  id: string;
  templateId: string;        // BoldSign template ID
  templateName: string;      // Display name
  description: string;
  category: 'consent' | 'health' | 'aftercare' | 'policy' | 'other';
  procedures: string[];      // Array of procedure names this applies to
  isRequired: boolean;       // Must be signed before appointment
  order: number;             // Display/send order
  isActive: boolean;
  lastSyncedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `boldsign_documents` (Sent Documents Tracking)
```typescript
interface BoldSignDocument {
  id: string;
  documentId: string;        // BoldSign document ID
  bookingId: string;         // Reference to booking
  clientId: string;          // Reference to user
  clientEmail: string;
  clientName: string;
  templateIds: string[];     // Templates used
  procedures: string[];      // Procedures this covers
  status: 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | 'revoked';
  sentAt: Timestamp;
  viewedAt?: Timestamp;
  signedAt?: Timestamp;
  downloadUrl?: string;      // Signed document URL
  reminders: {
    sentAt: Timestamp;
    method: 'email' | 'sms' | 'both';
  }[];
  ghlRemindersSent: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Form-to-Procedure Mapping

### Default PMU Form Requirements

| Procedure | Required Forms |
|-----------|---------------|
| Microblading | Consent Form, Health Questionnaire, Aftercare Agreement |
| Powder Brows | Consent Form, Health Questionnaire, Aftercare Agreement |
| Combo Brows | Consent Form, Health Questionnaire, Aftercare Agreement |
| Lip Blush | Lip Consent Form, Health Questionnaire, Lip Aftercare |
| Eyeliner | Eyeliner Consent Form, Health Questionnaire, Eyeliner Aftercare |
| Touch Up | Touch Up Consent, Health Update Form |
| Consultation | Consultation Agreement |

### Multi-Procedure Logic

When a client books multiple procedures:
1. Identify all unique required forms across procedures
2. Deduplicate common forms (e.g., one Health Questionnaire for all)
3. Send procedure-specific forms for each service
4. Use BoldSign's "Send using multiple templates" API

**Example**: Client books Microblading + Lip Blush
- Health Questionnaire (shared)
- Microblading Consent Form
- Microblading Aftercare Agreement
- Lip Blush Consent Form
- Lip Blush Aftercare Agreement

---

## API Endpoints to Create

### Form Configuration API

#### `GET /api/admin/boldsign/templates`
Fetch all templates from BoldSign and local mappings.

#### `POST /api/admin/boldsign/templates/sync`
Sync templates from BoldSign account.

#### `PUT /api/admin/boldsign/templates/{id}`
Update template-to-procedure mapping.

#### `GET /api/admin/boldsign/config`
Get BoldSign configuration.

#### `PUT /api/admin/boldsign/config`
Update BoldSign configuration.

### Document Sending API

#### `POST /api/admin/boldsign/send`
```typescript
// Request body
{
  bookingId: string;
  clientEmail: string;
  clientName: string;
  procedures: string[];  // e.g., ["Microblading", "Lip Blush"]
}

// Response
{
  success: boolean;
  documentId: string;
  templatesUsed: string[];
  message: string;
}
```

#### `GET /api/admin/boldsign/documents/{bookingId}`
Get document status for a booking.

#### `POST /api/admin/boldsign/remind/{documentId}`
Manually trigger a reminder.

### Webhook Endpoint

#### `POST /api/webhooks/boldsign`
Handle BoldSign webhook events.

```typescript
// Webhook payload structure
{
  event: {
    eventType: 'document.Completed' | 'document.Signed' | 'document.Declined' | etc.
  },
  document: {
    documentId: string;
    status: string;
    signerDetails: [{
      signerEmail: string;
      status: string;
      signedDate?: string;
    }];
  }
}
```

---

## GHL Integration for Reminders

### Reminder Workflow

```
Booking Created
      │
      ▼
Forms Sent via BoldSign
      │
      ▼
┌─────────────────────────────────────┐
│  Wait 24 hours                      │
│  If not signed → GHL Email Reminder │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  Wait 48 hours                      │
│  If not signed → GHL SMS Reminder   │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  24 hours before appointment        │
│  If not signed → Final Reminder     │
│  (Email + SMS)                      │
└─────────────────────────────────────┘
```

### GHL API Calls

#### Send Email Reminder
```typescript
POST /api/ghl/send-email
{
  contactId: string;
  subject: "Action Required: Please Sign Your PMU Forms",
  body: "Hi {firstName}, please sign your consent forms before your appointment..."
}
```

#### Send SMS Reminder
```typescript
POST /api/ghl/send-sms
{
  contactId: string;
  message: "Hi {firstName}! Please sign your PMU forms: {signingLink}"
}
```

### Admin Notification (When Forms Signed)

```typescript
// Notify Victoria via GHL
POST /api/ghl/notify-admin
{
  email: "Victoria@aprettygirllatter.com",
  phone: "919-441-0932",
  subject: "Forms Signed: {clientName}",
  message: "{clientName} has signed all forms for their {procedure} appointment on {date}."
}
```

---

## Admin UI Components

### 1. BoldSign Configuration Screen

**Location**: Admin Dashboard → Settings → Form Signatures

**Features**:
- API Key management (masked input)
- Webhook URL display (for BoldSign setup)
- Default reminder schedule configuration
- Notification settings (Victoria's contact info)
- Test connection button

### 2. Form Template Manager

**Location**: Admin Dashboard → Settings → Form Templates

**Features**:
- List all BoldSign templates
- Sync button to refresh from BoldSign
- Edit mapping: assign procedures to each template
- Set required/optional status
- Set display order
- Enable/disable templates

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Form Templates                                    [Sync from BoldSign]
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Microblading Consent Form                    [Edit] [⋮]  │ │
│ │   Category: Consent | Required: Yes                         │ │
│ │   Procedures: Microblading, Combo Brows                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Health Questionnaire                         [Edit] [⋮]  │ │
│ │   Category: Health | Required: Yes                          │ │
│ │   Procedures: All Procedures                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Lip Blush Consent Form                       [Edit] [⋮]  │ │
│ │   Category: Consent | Required: Yes                         │ │
│ │   Procedures: Lip Blush                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Document Status in Booking Details

**Location**: Booking Details Modal → Forms Tab

**Features**:
- List of forms sent for this booking
- Status indicator (Sent, Viewed, Signed, Expired)
- Timestamps for each status change
- Manual resend button
- Manual reminder button
- Download signed document button

### 4. Client Profile Forms Tab

**Location**: Client Profile → Forms Tab

**Features**:
- History of all forms sent to client
- Current pending forms
- Signed forms with download links
- Quick send forms button

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create BoldSign developer account
- [ ] Set up API key and webhook
- [ ] Create Firestore collections
- [ ] Build configuration API endpoints
- [ ] Build BoldSign Configuration screen

### Phase 2: Template Management (Week 2-3)
- [ ] Build template sync functionality
- [ ] Create Form Template Manager UI
- [ ] Implement procedure-to-form mapping
- [ ] Test with sample templates

### Phase 3: Document Sending (Week 3-4)
- [ ] Build document sending API
- [ ] Implement multi-procedure logic
- [ ] Integrate with booking flow
- [ ] Add manual send from admin

### Phase 4: Webhooks & Tracking (Week 4-5)
- [ ] Set up webhook endpoint
- [ ] Handle all document events
- [ ] Update document status in Firestore
- [ ] Build status display in booking details

### Phase 5: GHL Reminders (Week 5-6)
- [ ] Build reminder scheduling system
- [ ] Integrate with GHL email API
- [ ] Integrate with GHL SMS API
- [ ] Implement admin notifications
- [ ] Test full reminder workflow

### Phase 6: Testing & Polish (Week 6-7)
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] UI polish
- [ ] Documentation
- [ ] Training materials

---

## Environment Variables Required

```env
# BoldSign
BOLDSIGN_API_KEY=your_api_key_here
BOLDSIGN_WEBHOOK_SECRET=your_webhook_secret
BOLDSIGN_API_URL=https://api.boldsign.com/v1

# GHL (existing)
GHL_API_KEY=existing_key
GHL_LOCATION_ID=existing_location

# Notifications
ADMIN_NOTIFICATION_EMAIL=Victoria@aprettygirllatter.com
ADMIN_NOTIFICATION_PHONE=9194410932
```

---

## Security Considerations

1. **API Key Storage**: Store BoldSign API key encrypted in Firestore or environment variables
2. **Webhook Verification**: Verify webhook signatures using BoldSign's secret
3. **Document Access**: Only allow authenticated admins to download signed documents
4. **PII Protection**: Client health information in forms is sensitive - ensure proper access controls
5. **Audit Logging**: Log all form sends, views, and signatures for compliance

---

## Error Handling

| Scenario | Action |
|----------|--------|
| BoldSign API unavailable | Queue request, retry with exponential backoff |
| Template not found | Alert admin, skip form, log error |
| Client email invalid | Alert admin, prevent booking completion |
| Webhook delivery failure | BoldSign retries for 8 hours |
| GHL reminder failure | Log error, retry next scheduled time |

---

## Success Metrics

- **Form Completion Rate**: % of forms signed before appointment
- **Average Time to Sign**: Time from send to signature
- **Reminder Effectiveness**: % signed after each reminder
- **Admin Response Time**: Time from signature to admin notification

---

## References

- [BoldSign API Documentation](https://developers.boldsign.com/api-overview/getting-started/?region=us)
- [BoldSign Webhooks](https://developers.boldsign.com/webhooks/introduction/)
- [BoldSign Templates](https://developers.boldsign.com/template/create-template/)
- [GHL API Documentation](https://highlevel.stoplight.io/docs/integrations/)
