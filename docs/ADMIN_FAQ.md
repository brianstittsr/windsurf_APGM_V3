# Admin Dashboard FAQ & Instructions

This guide provides step-by-step instructions for common administrative tasks in the A Pretty Girl Matter admin dashboard.

---

## Table of Contents

1. [Admin Dashboard Overview](#admin-dashboard-overview)
2. [Creating a New Client](#creating-a-new-client)
3. [Client Profile Management](#client-profile-management)
4. [Adding a New Booking](#adding-a-new-booking)
5. [Adding Historical Bookings](#adding-historical-bookings)
6. [Adding Procedure Notes](#adding-procedure-notes)
7. [Managing Bookings](#managing-bookings)
8. [Artist Availability Management](#artist-availability-management)
9. [Time Slot System](#time-slot-system)
10. [Site Configuration Options](#site-configuration-options)
11. [GoHighLevel Integration](#gohighlevel-integration)
12. [BoldSign Form Integration](#boldsign-form-integration)
13. [AI Features](#ai-features)
14. [Troubleshooting](#troubleshooting)

---

## Admin Dashboard Overview

The admin dashboard is accessible at `/dashboard` and provides comprehensive control over all aspects of the website.

### Dashboard Tabs

| Tab | Description |
|-----|-------------|
| **Overview** | Dashboard home with statistics and quick actions |
| **Users** | Manage user accounts and roles |
| **Clients** | View and manage client profiles |
| **Calendar** | Visual booking calendar with GHL sync |
| **Bookings** | List view of all bookings with filters |
| **Reviews** | Manage client reviews and testimonials |
| **Services** | Configure service catalog and pricing |
| **Coupons & Gifts** | Manage discount codes and gift cards |
| **Business Settings** | Configure business information |
| **Artists** | Manage artist profiles |
| **Availability** | Configure artist weekly schedules |
| **Forms** | Manage registration forms |
| **FAQs** | Manage website FAQ content |
| **GoHighLevel** | CRM integration settings |
| **GoHighLevel MCP** | MCP protocol integration |
| **BMAD Orchestrator** | AI workflow automation |
| **AI Workflow Builder** | Create GHL workflows with AI chat |

### User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full access to all dashboard features |
| **Artist** | Access to own bookings, availability, and client notes |
| **Client** | Access to own profile and booking history |

---

## Creating a New Client

### Method 1: From the Clients Tab

1. **Navigate to Clients**
   - Log in to the admin dashboard at `/dashboard`
   - Click on **"Clients & Bookings"** in the sidebar
   - Select **"Clients"**

2. **Click "Add New Client"**
   - Click the pink **"+ Add New Client"** button in the top right corner

3. **Fill in Client Information**
   - **First Name** (required): Enter the client's first name
   - **Last Name** (required): Enter the client's last name
   - **Email Address** (required): Enter a valid email address
   - **Phone Number** (required): Enter the client's phone number
   - **Password** (required): Create a password (minimum 6 characters)
   - **Confirm Password** (required): Re-enter the password

4. **Save the Client**
   - Click **"Create Client"** to save
   - The client will now appear in the Clients list

### Method 2: During Booking Creation

1. When creating a new booking, if the client doesn't exist:
   - Click **"Create New Client"** in the booking wizard
   - Fill in the required information
   - The client will be created and automatically selected for the booking

---

## Client Profile Management

The enhanced Client Profile provides a comprehensive view of each client's history, including appointments, payments, and progress notes.

### Accessing Client Profiles

1. **Navigate to Clients**
   - Go to **"Clients & Bookings"** → **"Clients"** in the sidebar

2. **Open a Client Profile**
   - Find the client in the list
   - Click the **pink person icon** (👤) in the Actions column
   - This opens the Client Profile modal

### Profile Tabs

The Client Profile has four tabs:

| Tab | Description |
|-----|-------------|
| **Client Info** | View/edit client details and see quick stats |
| **Appointments** | Full appointment history from all bookings |
| **Payments** | Payment history with totals |
| **Progress Notes** | Timestamped notes about the client |

### Client Info Tab

**Viewing Information:**
- Client name, email, phone, and account status
- Quick stats showing total appointments, payments, and notes

**Editing Information:**
1. Click the **"Edit"** button in the top right
2. Update First Name, Last Name, or Phone
3. Click **"Save"** to apply changes
4. Note: Email cannot be changed after account creation

### Appointments Tab

Shows all appointments for the client, including:
- Service name and date/time
- Artist who performed the service
- Appointment status (Confirmed, Completed, Cancelled, etc.)
- Price
- Any procedure notes attached to the booking

Appointments are sorted by date (newest first) and pull from both the `bookings` and `appointments` collections.

### Payments Tab

Displays a table of all payments:
- Date processed
- Amount
- Payment type (deposit, full payment, refund)
- Payment method (card, cash, etc.)
- Status (completed, pending, failed, refunded)

A summary at the bottom shows the **Total Paid** amount.

### Progress Notes Tab

Progress notes are client-level notes (separate from procedure notes on individual bookings). Use these for:
- General client preferences
- Skin type observations
- Allergies or sensitivities
- Communication preferences
- Long-term treatment plans

**Adding a Progress Note:**
1. Go to the **Progress Notes** tab
2. Type your note in the text area
3. Click the **"+"** button
4. The note is automatically timestamped

**Deleting a Progress Note:**
1. Click the red trash icon next to the note
2. Confirm the deletion

### Adding Bookings from Client Profile

You can add appointments directly from a client's profile:

1. Open the client's profile
2. Go to the **Appointments** tab
3. Click **"Add Historical Booking"** button
4. Fill in the appointment details:
   - Service (dropdown with prices)
   - Date and Time
   - Price and Status
   - Deposit paid checkbox
   - Procedure notes (optional)
5. Click **"Add Booking"**

The booking is automatically linked to the client and appears in their appointment history.

### Editing Appointments from Client Profile

You can edit existing appointments directly from a client's profile:

1. Open the client's profile
2. Go to the **Appointments** tab
3. Click the **edit icon** (pencil) on the appointment you want to edit
4. Modify the appointment details:
   - **Service**: Change the service type
   - **Date and Time**: Reschedule the appointment
   - **Price**: Update the price
   - **Status**: Change status (Completed, Confirmed, Pending, Cancelled)
   - **Procedure Notes**: Add or remove notes with timestamps
5. Click **"Save Changes"**

The appointment is updated in the database and the list refreshes automatically.

### Deleting Appointments from Client Profile

You can delete appointments directly from a client's profile:

1. Open the client's profile
2. Go to the **Appointments** tab
3. Click the **delete icon** (trash) on the appointment you want to remove
4. Confirm the deletion in the dialog

**Warning**: This action cannot be undone. The appointment will be permanently removed from the database.

### Historical Bookings CRUD Summary

| Operation | How to Access | Description |
|-----------|---------------|-------------|
| **Create** | Click "Add Historical Booking" button | Add past appointments with full details and procedure notes |
| **Read** | View Appointments tab | See all appointments sorted by date (newest first) |
| **Update** | Click edit icon (pencil) | Modify service, date, time, price, status, and notes |
| **Delete** | Click delete icon (trash) | Permanently remove the appointment |

### Adding Payments from Client Profile

You can record payments directly from a client's profile:

1. Open the client's profile
2. Go to the **Payments** tab
3. Click **"Add Payment"** button
4. Fill in the payment details:
   - **Amount**: Payment amount in dollars
   - **Type**: Deposit, Full Payment, or Refund
   - **Method**: Cash, Card, Zelle, Venmo, PayPal, Cherry, or Klarna
   - **Date**: When the payment was made
   - **Status**: Completed, Pending, Failed, or Refunded
   - **Notes**: Optional payment notes
5. Click **"Add Payment"**

The payment is automatically linked to the client and appears in their payment history.

### Data Storage

| Data Type | Storage Location |
|-----------|------------------|
| Client Info | `users` collection (`displayName`, `phone`, `email`) |
| Appointments | `bookings` and `appointments` collections (by `clientEmail`) |
| Payments | `payments` collection (by `clientId`) |
| Progress Notes | `users` collection (`progressNotes` array) |

---

## Adding a New Booking

### Step-by-Step Instructions

1. **Navigate to Bookings**
   - Go to **"Clients & Bookings"** → **"Bookings"** in the sidebar
   - Or go to **"Calendar"** for a visual view

2. **Click "Create Booking"**
   - Click the pink **"+ Create Booking"** button

3. **Select or Create a Client**
   - **Existing Client**: Search by name or email and select from the list
   - **New Client**: Click "Create New Client" and fill in their details

4. **Choose a Service**
   - Select the service type (e.g., Microblading, Lip Blush, etc.)

5. **Select Date and Time**
   - Choose an available date from the calendar
   - Select an available time slot
   - If no slots are available, use "Calendar Override" to manually set a time

6. **Handle Deposit (Optional)**
   - Choose payment method:
     - **Square**: Process payment through Square
     - **External Payment**: Record cash, Zelle, or other payment
   - Enter deposit amount if applicable

7. **Add Notes (Optional)**
   - Enter any special notes about the appointment
   - These notes will be saved with the booking

8. **Confirm Booking**
   - Review all details
   - Click **"Create Booking"**
   - Confirmation emails will be sent automatically

---

## Adding Historical Bookings

Historical bookings allow you to add past appointments to your records. This is useful for:
- Migrating data from a previous system
- Recording appointments that were booked outside the system
- Adding historical client data for complete records

### Important: GHL Sync Limitation

**GoHighLevel does not accept appointments with past dates.** When you add a historical booking:
- The booking is saved to Firebase and appears on your calendar
- It will **not** sync to GHL calendar (marked as "skipped")
- The client contact can still be created in GHL

### How to Add a Historical Booking

1. **Navigate to Bookings**
   - Go to **"Clients & Bookings"** → **"Bookings"** in the sidebar

2. **Click "Add Historical Booking"**
   - Click the outlined **"Add Historical Booking"** button (with clock icon)
   - This opens the Historical Booking modal

3. **Enter Client Information**
   - **Client Name** (required): Enter the client's full name
   - **Email**: Client's email address (optional but recommended)
   - **Phone**: Client's phone number (optional)

4. **Enter Appointment Details**
   - **Service**: Select from the dropdown (prices auto-fill)
   - **Date** (required): Select the appointment date
   - **Time**: Select the appointment time
   - **Price**: Adjust if different from the default
   - **Status**: Usually "Completed" for historical entries
   - **Deposit Paid**: Check if deposit was collected

5. **Add Procedure Notes**
   - Type notes about the procedure in the text area
   - Click the **"+"** button to add each note
   - Notes are timestamped automatically
   - You can add multiple notes before saving

6. **Save the Booking**
   - Click **"Add Booking"**
   - The booking will appear on your calendar and in the bookings list

### Past Date Warning

When you select a past date, a yellow warning banner appears:
> **Note:** This is a past date. The booking will be saved to your records but will not sync to GHL calendar (GHL doesn't allow past appointments).

### Data Storage

Historical bookings are stored in the `bookings` collection with:
- `isHistoricalEntry: true` - Marks it as a historical entry
- `ghlSkippedReason: 'past_date'` - Indicates why GHL sync was skipped
- `bookingNotes: []` - Array of timestamped procedure notes

### Services and Pricing

The service dropdown includes common services with default prices:

| Service | Default Price |
|---------|---------------|
| Microblading | $500 |
| Powder Brows | $550 |
| Combo Brows | $600 |
| Lip Blush | $450 |
| Eyeliner | $400 |
| Touch Up | $200 |
| Consultation | $0 |

You can adjust the price field after selecting a service.

---

## Adding Procedure Notes

Procedure notes allow you to track important information about each appointment, such as:
- Colors/pigments used
- Technique details
- Client reactions or preferences
- Follow-up recommendations
- Touch-up notes

### How to Add Notes

1. **Navigate to Bookings**
   - Go to **"Clients & Bookings"** → **"Bookings"**

2. **Find the Booking**
   - Locate the client's booking in the list
   - Use the status filters (All, Confirmed, Pending, Completed, Cancelled) to narrow down

3. **Open Booking Details**
   - Click the **green eye icon** (👁️) in the Actions column
   - This opens the "Booking Details" modal

4. **View Existing Notes**
   - **Original Note/Description** (amber box): Shows notes added when booking was created
   - **Procedure Notes**: Shows timestamped notes added after the booking

5. **Add a New Note**
   - Scroll to the "Procedure Notes" section
   - Type your note in the text area
   - Click the **"+"** button to add
   - The note is automatically timestamped with the current date and time

6. **Delete a Note**
   - Click the red trash icon next to any note to delete it
   - Confirm the deletion when prompted

### Best Practices for Procedure Notes

- **Be specific**: Include pigment colors, needle sizes, technique used
- **Document reactions**: Note any sensitivity, bleeding, or client feedback
- **Record aftercare**: Document what aftercare instructions were given
- **Track touch-ups**: Note what areas need attention at the next visit
- **Add photos reference**: Mention if photos were taken and where they're stored

### Example Notes

```
Initial Procedure - Jan 3, 2026
- Pigment: Soft Brown + Blonde mix (70/30)
- Technique: Microblading with light shading
- Client has sensitive skin, used numbing cream for 30 min
- Brow shape: Natural arch, following natural brow line
- Before/after photos taken

Touch-up Notes - Feb 15, 2026
- Some fading in the tails, added more strokes
- Client happy with shape, requested slightly darker color
- Used Soft Brown + Medium Brown mix (80/20)
```

---

## Managing Bookings

### Viewing Bookings

- **List View**: Go to Bookings tab for a detailed list
- **Calendar View**: Go to Calendar tab for a visual monthly/weekly view

### Updating Booking Status

1. Find the booking in the list
2. Use the status dropdown to change:
   - **Pending**: Awaiting confirmation
   - **Confirmed**: Appointment confirmed
   - **Completed**: Service has been performed
   - **Cancelled**: Appointment was cancelled

### Editing Appointment Time

1. Click the **blue edit icon** (✏️) in Actions
2. Select new date and time
3. Click "Save & Send Email"
4. Client will receive an email notification about the change

### Deleting a Booking

1. Click the **red trash icon** (🗑️) in Actions
2. Confirm the deletion
3. Note: This action cannot be undone

---

## Artist Availability Management

The Artist Availability page allows you to configure which days and time slots are available for booking.

### Accessing Artist Availability

1. **Navigate to Availability**
   - Go to **"Services & Artists"** → **"Availability"** in the sidebar

2. **Select an Artist**
   - Use the dropdown in the top right to select an artist
   - **Note**: Both artists and admins appear in this dropdown (admins can manage their own availability)
   - Admin users are marked with an "Admin" badge

### Configuring Weekly Schedule

1. **Enable Days**
   - Check the checkbox next to each day you want to be available for booking
   - Unchecked days will not show any available slots on the booking page

2. **Configure Time Slots**
   - When a day is enabled, three time slots appear:
     - **Morning**: 10:00 AM - 1:00 PM
     - **Afternoon**: 1:00 PM - 4:00 PM
     - **Evening**: 4:00 PM - 7:00 PM
   - Check/uncheck each slot to enable/disable it
   - Enabled slots appear with a pink border and background
   - Disabled slots appear grayed out

3. **Save Changes**
   - Click **"Save Changes"** to apply your availability settings
   - Changes take effect immediately on the booking page

### Settings

- **Break Time**: Configure the break time between appointments (in minutes)
- **Calendar Integration**: Connect to Google Calendar or Outlook Calendar for sync

---

## Time Slot System

The booking system uses a simplified time slot system with three daily slots.

### Available Time Slots

| Slot | Time Range | Duration |
|------|------------|----------|
| Morning | 10:00 AM - 1:00 PM | 3 hours |
| Afternoon | 1:00 PM - 4:00 PM | 3 hours |
| Evening | 4:00 PM - 7:00 PM | 3 hours |

### Time-Based Filtering (Public Booking Page)

The booking page automatically filters time slots based on the current time:

- **Past Slots**: If the current time has passed a slot's start time, that slot is **grayed out** and marked as "Past"
- **Example**: At 11:30 AM, the Morning slot (10:00 AM) would be grayed out for today's date
- **Future Dates**: All enabled slots are available for dates in the future

### How It Works

1. **Today's Date**: 
   - Slots that have already started are grayed out with a "Past" badge
   - Remaining slots are available for booking

2. **Future Dates**:
   - All enabled slots (based on artist availability) are available

3. **Admin Override**:
   - Admins can use "Calendar Override" in the booking wizard to book any time
   - This bypasses the time slot restrictions

### Timezone

- The system uses the user's **local timezone** (Eastern Time for most users)
- All time comparisons are done in local time to ensure accurate availability

---

## Troubleshooting

### Client Not Showing in Search
- Ensure the client was created successfully
- Check for typos in the search term
- Try searching by email instead of name

### Booking Not Appearing
- Refresh the page
- Check the status filter (make sure "All" is selected)
- Verify the booking was created successfully

### Notes Not Saving
- Ensure you clicked the "+" button after typing
- Check your internet connection
- Try refreshing the page and adding the note again

### Calendar Showing No Availability
- Check artist availability settings
- Use "Calendar Override" to manually set a time
- Verify the date is not in the past

---

## Quick Reference

| Task | Location | Button/Action |
|------|----------|---------------|
| Create Client | Clients tab | "+ Add New Client" |
| Create Booking | Bookings tab | "+ Create Booking" |
| View Booking | Bookings tab | 👁️ Eye icon |
| Edit Time | Bookings tab | ✏️ Edit icon |
| Delete Booking | Bookings tab | 🗑️ Trash icon |
| Add Note | Booking Details Modal | "+" button |
| Change Status | Bookings tab | Status dropdown |

---

## BoldSign Form Integration

### Overview

BoldSign integration enables automated electronic signature collection for PMU consent forms, health questionnaires, and aftercare agreements. The system dynamically sends appropriate forms based on the procedure(s) booked.

> **Full Technical Specification**: See [BOLDSIGN_INTEGRATION_SPEC.md](./BOLDSIGN_INTEGRATION_SPEC.md) for complete implementation details.

### Key Features

| Feature | Description |
|---------|-------------|
| **Dynamic Form Sending** | Automatically sends correct forms based on booked procedure(s) |
| **Multi-Procedure Support** | Handles clients booking multiple procedures (e.g., Microblading + Lip Blush) |
| **Signature Tracking** | Real-time status updates when forms are viewed/signed |
| **GHL Reminders** | Automated email and SMS reminders for unsigned forms |
| **Admin Notifications** | Victoria notified via email and SMS when forms are signed |
| **Configuration Screen** | Admin UI to manage form-to-procedure mappings |

### Form-to-Procedure Mapping

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
1. System identifies all unique required forms across procedures
2. Deduplicates common forms (e.g., one Health Questionnaire for all)
3. Sends procedure-specific forms for each service
4. Uses BoldSign's multi-template API for efficient delivery

**Example**: Client books Microblading + Lip Blush receives:
- Health Questionnaire (shared - sent once)
- Microblading Consent Form
- Microblading Aftercare Agreement
- Lip Blush Consent Form
- Lip Blush Aftercare Agreement

### Reminder Schedule

| Timing | Method | Action |
|--------|--------|--------|
| 24 hours after send | Email via GHL | First reminder |
| 48 hours after send | SMS via GHL | Second reminder |
| 24 hours before appointment | Email + SMS | Final reminder |

### Admin Notifications

When forms are signed, Victoria receives:
- **Email**: Victoria@aprettygirllatter.com
- **SMS**: 919-441-0932
- **Content**: Client name, procedure, appointment date

### Configuration Screen (Settings → Form Signatures)

**BoldSign Settings**:
- API Key management
- Webhook URL configuration
- Reminder schedule customization
- Notification contact settings

**Form Template Manager**:
- Sync templates from BoldSign
- Map templates to procedures
- Set required/optional status
- Enable/disable templates
- Set display order

### Document Status Indicators

| Status | Description |
|--------|-------------|
| 📤 Sent | Forms sent, awaiting client action |
| 👁️ Viewed | Client has opened the forms |
| ✅ Signed | All forms signed successfully |
| ❌ Declined | Client declined to sign |
| ⏰ Expired | Forms expired before signing |

### Viewing Form Status

**In Booking Details**:
1. Open booking details modal
2. Go to "Forms" tab
3. View status of all sent forms
4. Download signed documents
5. Manually resend or remind

**In Client Profile**:
1. Open client profile
2. Go to "Forms" tab
3. View complete form history
4. Download any signed document

---

## Need Help?

For additional support:
- **Phone**: 513.273.7789
- **Email**: support@aprettygirlmatter.com

---

*Last Updated: January 4, 2026*

---

## Recent Changes (January 2026)

### Booking Calendar Availability System

The booking calendar (`/book-now-custom`) now reflects artist availability settings from the admin dashboard:

**How It Works:**
1. **Admin configures availability** in Dashboard → Availability tab
2. **Checked time slots = Available** for booking
3. **Unchecked time slots = Unavailable** (grayed out on booking page)
4. **Days with ALL slots unchecked** are completely grayed out on the monthly calendar

**Time Slot Definitions:**
| Slot | Time Range |
|------|------------|
| Morning | 10:00 AM - 1:00 PM |
| Afternoon | 1:00 PM - 4:00 PM |
| Evening | 4:00 PM - 7:00 PM |

**Calendar Visual Indicators:**
- **White dates** - Available for booking (at least one time slot enabled)
- **Gray dates** - Unavailable (all time slots disabled or past dates)
- **Yellow dates** - Today
- **Pink/Red dates** - Selected date

**Auto-Save Feature:**
- Changes in the Availability tab are automatically saved after 500ms
- No need to click "Save Changes" (though the button still works)

### Time Slot Filtering
- Past time slots are now **grayed out** (instead of hidden) on the booking page
- A "Past" badge appears on slots that have already started
- Uses local timezone (Eastern Time) for accurate time comparisons

### Artist Availability UI Update
- Replaced detailed time pickers with simplified **Morning/Afternoon/Evening** checkboxes
- Time slots now match the public booking page exactly
- Updated styling with shadcn/ui components (Select, Card, Checkbox, Label)
- Admin users now appear in the artist dropdown with an "Admin" badge

### Technical Improvements
- Fixed timezone issues that were causing incorrect date comparisons
- All date handling now uses local timezone instead of UTC
- Added Lucide icons for better visual consistency
- Monthly calendar now fetches availability from Firestore to gray out unavailable days

---

## Site Configuration Options

### Business Settings

Access via **Dashboard → Business Settings**

| Setting | Description |
|---------|-------------|
| **Business Name** | Displayed in header and emails |
| **Contact Email** | Primary contact email |
| **Phone Number** | Displayed on website and in communications |
| **Address** | Business location for maps and directions |
| **Business Hours** | Operating hours displayed on contact page |
| **Social Media Links** | Facebook, Instagram, TikTok URLs |

### Service Configuration

Access via **Dashboard → Services**

- **Add/Edit Services** - Configure service name, description, duration, and pricing
- **Service Categories** - Group services by type (Brows, Lips, Eyes, etc.)
- **Pricing Tiers** - Set different prices for initial vs touch-up appointments
- **Service Images** - Upload before/after photos for each service
- **Active/Inactive Status** - Hide services without deleting them

### Coupon & Gift Card Management

Access via **Dashboard → Coupons & Gifts**

**Coupon Types:**
- **Percentage Off** - e.g., 20% off
- **Fixed Amount** - e.g., $50 off
- **Free Service** - Complimentary add-on

**Coupon Settings:**
- Expiration date
- Usage limits (per customer or total)
- Minimum purchase requirement
- Service restrictions

**Gift Cards:**
- Generate unique codes
- Set custom amounts
- Track balance and usage
- Email delivery to recipients

### Review Management

Access via **Dashboard → Reviews**

- **Approve/Reject** - Moderate reviews before they appear on site
- **Feature Reviews** - Highlight top reviews on homepage
- **Respond to Reviews** - Add public responses
- **Request Reviews** - Send review request emails to clients

### FAQ Management

Access via **Dashboard → FAQs**

- **Add/Edit FAQs** - Create questions and answers
- **Categories** - Organize FAQs by topic
- **Order** - Drag to reorder FAQs
- **AI Chat Integration** - FAQs are used by the chatbot to answer questions

---

## GoHighLevel Integration

### Setup

1. **Get API Credentials**
   - Log in to GoHighLevel
   - Go to **Settings → Integrations → Private Integrations**
   - Create a new Private Integration
   - Copy the **API Key** and **Location ID**

2. **Configure in Dashboard**
   - Go to **Dashboard → GoHighLevel**
   - Enter your API Key and Location ID
   - Click **Test Connection** to verify

### Features

| Feature | Description |
|---------|-------------|
| **Contact Sync** | Automatically creates/updates contacts in GHL |
| **Appointment Sync** | Syncs bookings to GHL calendar |
| **Pipeline Management** | Creates opportunities for new bookings |
| **SMS/Email** | Sends messages through GHL |
| **Workflow Triggers** | Triggers GHL workflows on events |

### Sync Options

- **Manual Sync** - Click "Sync All with GHL" in Calendar tab
- **Auto Sync** - Bookings sync automatically on creation/update
- **Webhook Sync** - GHL sends updates back to website

### Required GHL Scopes

- `contacts.readonly`, `contacts.write`
- `calendars.readonly`, `calendars.write`
- `opportunities.readonly`, `opportunities.write`
- `conversations.readonly`, `conversations.write`
- `workflows.readonly`

---

## AI Features

### PMU Chatbot

The homepage features an AI-powered chatbot that:
- Answers questions about services, pricing, and care instructions
- Collects booking information from customers
- Provides 24/7 automated customer service
- Integrates with GHL for lead capture

### AI Workflow Builder

Access via **Dashboard → Integrations → AI Workflow Builder**

Create GHL workflows using natural language:
1. Describe what you want (e.g., "Send appointment reminder 24 hours before")
2. AI generates step-by-step workflow
3. Download and implement in GHL

**Pre-built Templates:**
- Lead Nurturing Sequence
- Appointment Reminder Sequence
- No-Show Recovery
- Review Request Sequence
- Client Reactivation
- Speed to Lead
- Birthday Campaign
- Post-Service Follow-up

### BMAD Orchestrator

Access via **Dashboard → BMAD Orchestrator**

AI-powered workflow automation that:
- Executes workflows based on triggers
- Manages customer journey automation
- Integrates with GHL for CRM actions
- Provides chat interface for workflow management

**Available Workflows:**
- `booking_created` - New booking automation
- `booking_confirmed` - Confirmation and prep instructions
- `user_registered` - Welcome sequence
- `payment_received` - Receipt and confirmation
- `review_submitted` - Thank you and referral offer
- `appointment_reminder` - 24-hour reminder
- `follow_up` - Post-appointment check-in

---

## Admin API Endpoints

For developers and advanced users, the following admin API endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/debug-availability` | GET | View all artist availability documents |
| `/api/admin/reset-availability` | POST | Reset availability for an artist |
| `/api/admin/cleanup-availability` | DELETE | Remove duplicate availability documents |
| `/api/admin/clear-bookings` | DELETE | Clear all bookings (use with caution!) |

**Note:** These endpoints require admin authentication and should be used carefully in production.
