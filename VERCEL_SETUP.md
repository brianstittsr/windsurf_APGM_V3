# Vercel Environment Variables Setup

## Required Environment Variables for Production

To fix the contact form email sending on Vercel, you need to add these environment variables in your Vercel dashboard:

### Option 1: SMTP Configuration
```
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_app_password
```

### Option 2: Gmail Configuration (Alternative)
```
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_app_password
```

### Option 3: Generic Email Configuration (Alternative)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## How to Add Environment Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project (aprettygirlmatter.com)
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate values
5. Redeploy your application

## Important Notes:

- Use App Passwords for Gmail (not your regular password)
- For Gmail: Enable 2FA and generate an App Password
- Port 587 uses STARTTLS, Port 465 uses SSL
- All variables must be added to Production environment
- Redeploy after adding variables

## Testing:

After adding variables and redeploying, the contact form should work on production.
The enhanced error logging will show which variables are missing if issues persist.
