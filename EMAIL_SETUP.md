# Email Notification Setup

The enhanced appointments management system includes automatic email notifications for appointment changes. Here's how to set up email functionality:

## Email Service Integration

The system is designed to work with popular email services. To enable email notifications:

### 1. Choose an Email Service Provider

**Recommended options:**
- **SendGrid** (recommended for production)
- **Mailgun** 
- **AWS SES**
- **Nodemailer with SMTP**

### 2. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Email Service Configuration
NEXT_PUBLIC_EMAIL_API_KEY=your_email_service_api_key
NEXT_PUBLIC_EMAIL_API_URL=your_email_service_endpoint

# Business Information (used in email templates)
NEXT_PUBLIC_BUSINESS_NAME="A Pretty Girl Matter"
NEXT_PUBLIC_BUSINESS_PHONE="(919) 441-0932"
NEXT_PUBLIC_BUSINESS_EMAIL="info@aprettygirl.com"
```

### 3. SendGrid Setup Example

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key in your SendGrid dashboard
3. Add to `.env.local`:
```bash
NEXT_PUBLIC_EMAIL_API_KEY=SG.your_sendgrid_api_key
NEXT_PUBLIC_EMAIL_API_URL=https://api.sendgrid.com/v3/mail/send
```

### 4. Development Mode

Without email configuration, the system will:
- Log email content to the console
- Show success messages as if emails were sent
- Continue to function normally

## Email Templates

The system includes professional email templates for:

### Appointment Confirmation
- Sent when status changes to "confirmed"
- Includes appointment details and reminders
- Professional business branding

### Appointment Reschedule
- Sent when date/time changes
- Shows old vs new appointment details
- Includes reason for reschedule (if provided)

### Appointment Cancellation
- Sent when status changes to "cancelled"
- Includes cancellation reason
- Offers rebooking assistance

### Status Updates
- Sent for other status changes
- General appointment update format

## Features

### Enhanced Appointment Management
- **Full Edit Capability**: Change date, time, service, status, and notes
- **Automatic Email Notifications**: Sent on all appointment changes
- **Reason Collection**: Required for cancellations and reschedules
- **Loading Indicators**: Shows email sending progress
- **Error Handling**: Graceful fallback if email fails

### Admin Interface Improvements
- **Edit Button**: Quick access to appointment editing
- **Modal Forms**: User-friendly editing interface
- **Real-time Updates**: Immediate UI feedback
- **Email Status**: Shows when emails are being sent

## Usage

1. **Quick Status Change**: Use the dropdown in the Actions column
2. **Full Edit**: Click the edit button (pencil icon) to open the edit modal
3. **Cancellation/Reschedule**: System prompts for reason when needed
4. **Email Notifications**: Automatically sent to clients on changes

## Testing

To test email functionality:

1. Set up email service credentials
2. Create a test appointment with your email address
3. Make changes through the admin interface
4. Check your email for notifications

## Troubleshooting

### Emails Not Sending
- Check environment variables are set correctly
- Verify API key permissions
- Check console for error messages
- Ensure email service account is active

### Email Content Issues
- Templates are in `/src/services/emailService.ts`
- Customize business information in environment variables
- Modify templates as needed for your brand

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider using server-side API routes for production
- Implement rate limiting for email sending

## Future Enhancements

Potential improvements:
- Email template customization UI
- Bulk email operations
- Email delivery tracking
- Client email preferences
- SMS notifications integration
