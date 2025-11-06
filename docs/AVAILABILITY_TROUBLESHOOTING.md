# Artist Availability Troubleshooting Guide

This guide provides solutions for common issues with the Artist Availability Manager component.

## Common Issues and Fixes

### 1. Availability Form Won't Save

Several potential causes and solutions:

#### Firestore Permissions

**Issue**: The user doesn't have proper permissions to write to the `artist-availability` collection.

**Solutions**:
- Ensure the user is logged in with an admin account
- Check Firestore security rules to confirm write access to the `artist-availability` collection
- Use the Firestore Permission Test tool (added to the component) to diagnose specific permission issues

#### Circular References in Data

**Issue**: The availability data structure contains circular references that can't be serialized.

**Solutions**:
- We've added data cleaning and validation to remove any circular references
- If the issue persists, try refreshing the page and re-entering availability data

#### Invalid Data Structure

**Issue**: The availability data structure might be corrupted or invalid.

**Solutions**:
- We've added validation to ensure only valid data is saved
- If you see error messages about invalid data, try clearing all availability and adding it fresh

### 2. Data Appears But Doesn't Save

**Issue**: The form shows existing data but changes don't persist when saved.

**Solutions**:
- Check browser console for any specific error messages
- Ensure you're clicking the "Save Changes" button at the bottom of the form
- Check that the selected artist is the one you intend to update

### 3. No Artists Showing in Dropdown

**Issue**: The artist dropdown is empty or doesn't show the expected artists.

**Solutions**:
- Ensure users have the role "artist" set in their user documents
- Check for any console errors related to fetching users
- Try refreshing the page

## Debug Steps

If you're still experiencing issues, follow these steps:

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Look for any error messages, especially those containing:
   - "Error saving availability"
   - "Permission denied"
   - "Failed to fetch artists"

4. Run the Firestore Permission Test on the page to check specific permissions
5. If possible, capture screenshots of any error messages and share them with the development team

## Technical Details for Developers

### Data Structure

The availability data for each artist is stored in Firestore with this structure:

```javascript
{
  availability: {
    // For each day of the week (when enabled)
    "Monday": {
      enabled: true,
      slots: [
        { start: "09:00", end: "12:00", service: "service-id-or-empty" },
        // Additional time slots...
      ]
    },
    // Other days...
  },
  breakTime: 15, // Break time in minutes
  updatedAt: Timestamp // When the availability was last updated
}
```

### Firestore Collection

- Collection: `artist-availability`
- Document ID: The user ID of the artist
- Required permissions: Read and write access to this collection

### Debugging Code Additions

The following improvements have been made to facilitate debugging:

1. Enhanced error logging with detailed information
2. Data validation and cleaning before save
3. Firestore permission test tool
4. Fixed potential issues with day toggling
5. Improved display name extraction from user documents
