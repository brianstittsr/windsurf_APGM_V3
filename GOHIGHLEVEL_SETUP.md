# GoHighLevel CRM Integration Setup

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# GoHighLevel CRM Configuration
NEXT_PUBLIC_GOHIGHLEVEL_API_KEY=your_ghl_api_key_here
NEXT_PUBLIC_GOHIGHLEVEL_LOCATION_ID=your_location_id_here
NEXT_PUBLIC_GOHIGHLEVEL_BASE_URL=https://services.leadconnectorhq.com
```

## How to Get Your GoHighLevel Credentials

### 1. API Key
1. Log into your GoHighLevel account
2. Go to Settings → Integrations → API
3. Create a new API key with the following permissions:
   - Contacts: Read/Write
   - Workflows: Read/Write
   - Opportunities: Read/Write
   - Campaigns: Read/Write

### 2. Location ID
1. In GoHighLevel, go to Settings → Company Settings
2. Your Location ID is displayed in the URL or company details
3. It's typically a string like `location_abc123def456`

## Features Enabled

Once configured, the CRM integration provides:

- **Contact Sync**: Automatically sync booking clients to GoHighLevel
- **Workflow Management**: View and manage CRM workflows from your dashboard
- **Lead Reports**: Comprehensive reporting on client leads and conversions
- **Automation Rules**: Set up triggers to automatically add clients to workflows
- **Real-time Sync**: Keep booking system and CRM data synchronized

## Testing the Integration

1. Add the environment variables to `.env.local`
2. Restart your development server
3. Navigate to Workflows → CRM Integration tab
4. Click "Connect to GoHighLevel" to test the connection
5. Use "Full Sync" to synchronize existing booking data

## Troubleshooting

- **Connection Failed**: Verify API key and location ID are correct
- **Permission Errors**: Ensure API key has required permissions
- **Sync Issues**: Check the error log in the CRM Integration dashboard

## Security Notes

- Never commit API keys to version control
- Use different API keys for development and production
- Regularly rotate API keys for security
- Monitor API usage in GoHighLevel dashboard
