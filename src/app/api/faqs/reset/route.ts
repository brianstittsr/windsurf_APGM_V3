import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

const defaultFAQs = [
  // Creating Clients
  {
    category: 'clients',
    order: 1,
    question: 'How do I create a new client?',
    answer: `**Method 1: From the Clients Tab**
1. Navigate to **Clients & Bookings** → **Clients** in the sidebar
2. Click the **"+ Add New Client"** button
3. Fill in the required information:
   - First Name & Last Name
   - Email Address
   - Phone Number
   - Password (minimum 6 characters)
4. Click **"Create Client"** to save

**Method 2: During Booking Creation**
- When creating a booking, click **"Create New Client"** in the wizard
- The client will be created and automatically selected for the booking`
  },
  {
    category: 'clients',
    order: 2,
    question: 'What information is required for a new client?',
    answer: `All of the following fields are required:
- **First Name**: Client's first name
- **Last Name**: Client's last name
- **Email Address**: A valid email (used for confirmations)
- **Phone Number**: Contact number
- **Password**: Minimum 6 characters (for client portal access)`
  },
  {
    category: 'clients',
    order: 3,
    question: 'Can I edit a client\'s information after creation?',
    answer: `Yes! To edit a client:
1. Go to **Clients & Bookings** → **Clients**
2. Find the client in the list
3. Click the **blue edit icon** (✏️) in the Actions column
4. Update the information
5. Click **"Save Changes"**

Note: Email addresses cannot be changed after creation.`
  },
  // Managing Bookings
  {
    category: 'bookings',
    order: 1,
    question: 'How do I create a new booking?',
    answer: `Use this step-by-step script when creating a booking in the admin section:

1. **Ask:** "Is this a new client or an existing client?"
   - **Existing client:** Search by name, email, or phone and select the client from the list.
   - **New client:** Click **"Create New Client"** and enter:
     - First Name
     - Last Name
     - Email Address
     - Phone Number
     - Password
     - Confirm Password

2. **Ask:** "What service are we booking today?"
   - Select the service from the dropdown.
   - If it is a **Consultation**, no payment is required.

3. **Ask:** "What date and time would you like?"
   - Choose **Next Available**, **Weekend**, or **Calendar Override**.
   - If needed, manually pick a date and time.
   - Review the available time slots and select the best one.

4. **Ask:** "Would you like to add any notes or special instructions?"
   - Add any appointment details, client preferences, or reminders.

5. **If this is a paid appointment, ask:** "How would you like to pay today?"
   - **Credit Card**
   - **Klarna**
   - **Afterpay**
   - **Affirm**
   - **Zelle**
   - **External** (cash, check, or other)

6. **If Credit Card is selected:**
   - Ask whether to charge a **deposit** or the **full service price**.

7. **If Klarna, Afterpay, or Affirm is selected:**
   - Confirm the buy-now-pay-later option and complete the payment form.

8. **If Zelle or External is selected:**
   - Record the payment as pending or confirmed as appropriate.

9. **Review everything one last time**
   - Client
   - Service
   - Date and time
   - Notes
   - Payment method

10. Click **"Create Booking"** to save the appointment.

The client will receive a confirmation email automatically.`
  },
  {
    category: 'bookings',
    order: 2,
    question: 'How do I change an appointment time?',
    answer: `1. Go to **Bookings** tab
2. Find the appointment in the list
3. Click the **blue edit icon** (✏️)
4. Select the new date and time
5. Click **"Save & Send Email"**

The client will automatically receive an email notification about the time change.`
  },
  {
    category: 'bookings',
    order: 3,
    question: 'How do I update a booking status?',
    answer: `1. Find the booking in the Bookings list
2. Use the **Status dropdown** in the booking row
3. Select the new status:
   - **Pending**: Awaiting confirmation
   - **Confirmed**: Appointment confirmed
   - **Completed**: Service performed
   - **Cancelled**: Appointment cancelled

The status updates immediately.`
  },
  {
    category: 'bookings',
    order: 4,
    question: 'How do I view booking details?',
    answer: `1. Go to **Bookings** tab
2. Find the booking you want to view
3. Click the **green eye icon** (👁️) in the Actions column
4. The Booking Details modal will show:
   - Client information
   - Appointment details
   - Service and pricing
   - Procedure notes`
  },
  {
    category: 'bookings',
    order: 5,
    question: 'Can I delete a booking?',
    answer: `Yes, but use caution as this cannot be undone:
1. Find the booking in the list
2. Click the **red trash icon** (🗑️)
3. Confirm the deletion

**Tip**: Consider changing the status to "Cancelled" instead of deleting, to keep a record of the appointment.`
  },
  // Procedure Notes
  {
    category: 'notes',
    order: 1,
    question: 'How do I add procedure notes to a booking?',
    answer: `1. Go to **Bookings** tab
2. Click the **green eye icon** (👁️) on the booking
3. Scroll to the **"Procedure Notes"** section
4. Type your note in the text area
5. Click the **"+"** button to add

Each note is automatically timestamped with the current date and time.`
  },
  {
    category: 'notes',
    order: 2,
    question: 'What should I include in procedure notes?',
    answer: `Best practices for procedure notes:

**During the Procedure:**
- Pigment colors and mix ratios used
- Needle sizes and techniques
- Numbing cream duration
- Client comfort level

**Client Information:**
- Skin type and reactions
- Sensitivity or bleeding
- Special requests or preferences

**Aftercare:**
- Instructions given
- Products recommended
- Follow-up appointment scheduled

**For Touch-ups:**
- Areas that need attention
- Color adjustments needed
- Shape modifications`
  },
  {
    category: 'notes',
    order: 3,
    question: 'Can I delete a procedure note?',
    answer: `Yes:
1. Open the booking details (click the eye icon)
2. Find the note you want to delete
3. Click the **red trash icon** next to the note
4. Confirm the deletion

**Note**: Deleted notes cannot be recovered.`
  },
  {
    category: 'notes',
    order: 4,
    question: 'What is the difference between "Original Note" and "Procedure Notes"?',
    answer: `**Original Note/Description** (amber box):
- Notes added when the booking was first created
- May include payment notes or special requests
- Cannot be edited after booking creation

**Procedure Notes** (white cards with timestamps):
- Notes added after the booking was created
- Each note has a timestamp
- Can be added, viewed, and deleted anytime
- Ideal for documenting the actual procedure`
  },
  // General
  {
    category: 'general',
    order: 1,
    question: 'How do I access the admin dashboard?',
    answer: `1. Go to the website login page
2. Log in with an admin account
3. You will be automatically redirected to the dashboard
4. Or navigate directly to **/dashboard**

**Note**: Only users with the "Admin" role can access the dashboard.`
  },
  {
    category: 'general',
    order: 2,
    question: 'How do I view the booking calendar?',
    answer: `There are two ways to view bookings:

**Calendar View** (visual):
- Go to **Clients & Bookings** → **Calendar**
- See bookings in a monthly/weekly grid
- Click on any booking to view details

**List View** (detailed):
- Go to **Clients & Bookings** → **Bookings**
- See all bookings in a table format
- Filter by status (All, Confirmed, Pending, etc.)`
  },
];

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const faqsRef = collection(db, 'faqs');
    
    // Delete all existing FAQs
    const snapshot = await getDocs(faqsRef);
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'faqs', docSnap.id)));
    await Promise.all(deletePromises);
    
    // Add fresh FAQs
    const addPromises = defaultFAQs.map(faq => 
      addDoc(faqsRef, {
        ...faq,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );
    await Promise.all(addPromises);
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${snapshot.docs.length} FAQs and added ${defaultFAQs.length} fresh FAQs` 
    });
  } catch (error: any) {
    console.error('Error resetting FAQs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
