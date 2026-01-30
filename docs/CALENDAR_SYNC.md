# Calendar Sync Documentation

This document explains how to set up and use the calendar synchronization between the website, Google Calendar, and GoHighLevel.

## Features

- **Bidirectional Sync**: Changes in any system (website, Google Calendar, GoHighLevel) are reflected in the others
- **Full CRUD Support**: Create, Read, Update, and Delete operations are synchronized
- **Conflict Resolution**: Last update wins for conflicting changes
- **Error Handling**: Failed syncs are logged and can be retried
- **Status Monitoring**: View sync history and current status

## Setup

### Google Calendar Integration

1. Navigate to Admin Dashboard → Artist Availability
2. Click "Connect to Google Calendar"
3. Authorize the application with your Google account
4. Select the calendar you want to sync with

### GoHighLevel Integration

1. Ensure GHL API key is configured in Admin Dashboard → Integrations
2. Set the correct GHL location ID and calendar ID

## Usage

### Manual Sync

1. Navigate to Admin Dashboard → Artist Availability
2. Select an artist from the dropdown
3. Click "Sync Now" to manually trigger a sync

### Automatic Sync

Automatic sync occurs when:
- An appointment is created, updated, or deleted on the website
- A status change occurs (pending → confirmed → completed/cancelled)
- A webhook notification is received from Google Calendar

## Troubleshooting

### Common Issues

- **Sync Not Working**: Check sync logs in Admin Dashboard → Sync Status
- **Permissions Errors**: Reconnect Google Calendar/GHL
- **Missing Events**: Manually trigger a sync

## API Endpoints

- `POST /api/auth/google-calendar` - Initiate Google OAuth
- `GET /api/auth/google-calendar/callback` - Google OAuth callback
- `POST /api/webhooks/google-calendar` - Google Calendar webhook
- `POST /api/calendar/sync` - Manual sync trigger
