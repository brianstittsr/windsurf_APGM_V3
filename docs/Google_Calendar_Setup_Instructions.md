# Google Calendar OAuth Setup Instructions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (or Internal if using Google Workspace)
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events`
4. Create OAuth client ID:
   - Application type: Web application
   - Name: "PMU Website Calendar Integration"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google-calendar/callback` (for development)
     - `https://yourdomain.com/api/auth/google-calendar/callback` (for production)

## Step 3: Add Credentials to .env.local

Add these three variables to your `.env.local` file:

```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google-calendar/callback
```

Replace:
- `your_client_id` with the Client ID from Google Cloud Console
- `your_client_secret` with the Client Secret from Google Cloud Console
- Update the redirect URI for production deployment

## Step 4: Test the Integration

1. Restart your development server: `npm run dev`
2. Go to Admin Dashboard > Artist Availability
3. Click "Connect to Google Calendar"
4. Authorize the application
5. You should be redirected back to the dashboard

## Troubleshooting

**500 Error:**
- Verify all three environment variables are set in `.env.local`
- Restart the development server after adding variables

**Redirect URI Mismatch:**
- Ensure the redirect URI in `.env.local` matches exactly what's configured in Google Cloud Console
- Include the protocol (http:// or https://)

**Authorization Failed:**
- Check that Google Calendar API is enabled
- Verify OAuth consent screen is configured
- Ensure the scopes are added to the consent screen
