# GoHighLevel Sub-Account Migration - Development TODO

## Overview
Complete migration tool to transfer all data, settings, and configurations from one GoHighLevel sub-account to another. This enables seamless business transitions, account consolidation, or backup/restore operations.

---

## Phase 1: Foundation & Architecture

### 1.1 Migration Service Core
- [ ] Create `src/services/ghl-migration.ts` - Core migration service class
- [ ] Define migration data types and interfaces
- [ ] Implement source/destination account connection handlers
- [ ] Create migration job queue system
- [ ] Implement progress tracking mechanism
- [ ] Add error handling and retry logic
- [ ] Create migration log storage (Firestore collection: `ghl-migrations`)

### 1.2 API Endpoints
- [ ] `POST /api/crm/migration/validate` - Validate source/destination credentials
- [ ] `POST /api/crm/migration/analyze` - Analyze source account data volume
- [ ] `POST /api/crm/migration/export` - Export data from source account
- [ ] `POST /api/crm/migration/import` - Import data to destination account
- [ ] `GET /api/crm/migration/status/:jobId` - Get migration job status
- [ ] `POST /api/crm/migration/rollback/:jobId` - Rollback failed migration
- [ ] `GET /api/crm/migration/history` - Get migration history

### 1.3 UI Component Structure
- [ ] Create `src/components/admin/GHLMigration.tsx` - Main migration wizard component
- [ ] Add migration tab to GoHighLevelManager or create separate tab in dashboard
- [ ] Design step-by-step wizard UI (connection → analysis → selection → migration → verification)

---

## Phase 2: Data Export (Source Account)

### 2.1 Contacts & Contact Data
- [ ] Export all contacts with pagination (handle large datasets)
- [ ] Export contact custom field values
- [ ] Export contact tags
- [ ] Export contact notes
- [ ] Export contact tasks
- [ ] Export contact DND (Do Not Disturb) settings
- [ ] Map contact IDs for reference during import

### 2.2 Pipelines & Opportunities
- [ ] Export all pipelines with stages
- [ ] Export pipeline stage configurations
- [ ] Export all opportunities
- [ ] Export opportunity custom fields
- [ ] Map pipeline/stage IDs for reference

### 2.3 Calendars & Appointments
- [ ] Export calendar configurations
- [ ] Export calendar groups
- [ ] Export calendar resources (team members)
- [ ] Export appointment types/services
- [ ] Export existing appointments (optional - historical data)
- [ ] Export calendar availability settings

### 2.4 Workflows & Automations
- [ ] Export workflow definitions
- [ ] Export workflow triggers
- [ ] Export workflow actions
- [ ] Export workflow conditions
- [ ] Note: Some workflows may need manual recreation due to API limitations

### 2.5 Forms & Surveys
- [ ] Export form definitions
- [ ] Export form fields and configurations
- [ ] Export form submissions (optional)
- [ ] Export survey definitions
- [ ] Export survey questions
- [ ] Export survey submissions (optional)

### 2.6 Campaigns
- [ ] Export email campaigns
- [ ] Export SMS campaigns
- [ ] Export campaign templates
- [ ] Export campaign sequences
- [ ] Export campaign triggers

### 2.7 Tags & Custom Fields
- [ ] Export all tags
- [ ] Export custom field definitions
- [ ] Export custom field options (dropdowns, etc.)

### 2.8 AI & Conversation Settings
- [ ] Export Conversation AI prompts
- [ ] Export AI bot configurations
- [ ] Export AI training data
- [ ] Export conversation templates
- [ ] Export SMS templates
- [ ] Export email templates
- [ ] Export snippet/canned responses

### 2.9 Business Settings
- [ ] Export location/business settings
- [ ] Export business hours
- [ ] Export timezone settings
- [ ] Export notification preferences
- [ ] Export integration settings (where applicable)

### 2.10 Media & Assets
- [ ] Export media library files (images, documents)
- [ ] Export file URLs for re-upload
- [ ] Handle large file transfers

### 2.11 Users & Permissions
- [ ] Export user list
- [ ] Export user roles and permissions
- [ ] Note: Users may need to be re-invited manually

---

## Phase 3: Data Import (Destination Account)

### 3.1 Pre-Import Validation
- [ ] Validate destination account has required permissions
- [ ] Check for naming conflicts (tags, custom fields, etc.)
- [ ] Estimate import duration
- [ ] Create import preview/dry-run mode

### 3.2 Import Order (Dependencies)
1. [ ] Custom Fields (needed for contacts)
2. [ ] Tags (needed for contacts)
3. [ ] Pipelines & Stages (needed for opportunities)
4. [ ] Calendars (needed for appointments)
5. [ ] Users (if applicable)
6. [ ] Contacts (with custom values and tags)
7. [ ] Opportunities (linked to contacts and pipelines)
8. [ ] Appointments (linked to contacts and calendars)
9. [ ] Forms & Surveys
10. [ ] Campaigns
11. [ ] Workflows (may require manual steps)
12. [ ] AI Prompts & Templates
13. [ ] Media Files

### 3.3 ID Mapping System
- [ ] Create mapping table: source ID → destination ID
- [ ] Handle references between entities
- [ ] Update internal links and references

### 3.4 Conflict Resolution
- [ ] Detect duplicate contacts (by email/phone)
- [ ] Merge vs. skip vs. overwrite options
- [ ] Handle tag name conflicts
- [ ] Handle custom field conflicts

---

## Phase 4: Migration UI/UX

### 4.1 Step 1: Account Connection
- [ ] Source account API key input
- [ ] Source location ID input
- [ ] Destination account API key input
- [ ] Destination location ID input
- [ ] Connection test for both accounts
- [ ] Display account names/info for verification

### 4.2 Step 2: Data Analysis
- [ ] Scan source account
- [ ] Display data counts:
  - Contacts count
  - Opportunities count
  - Pipelines count
  - Calendars count
  - Forms count
  - Workflows count
  - Tags count
  - Custom fields count
  - AI prompts count
  - Media files count
- [ ] Estimate migration time
- [ ] Show storage/API limit warnings

### 4.3 Step 3: Selection & Options
- [ ] Checkboxes for each data category
- [ ] Select all / deselect all
- [ ] Advanced options:
  - Include historical appointments
  - Include form submissions
  - Include conversation history
  - Merge duplicate contacts
  - Overwrite existing data
- [ ] Date range filters (for historical data)

### 4.4 Step 4: Migration Execution
- [ ] Start migration button
- [ ] Real-time progress bar
- [ ] Current operation display
- [ ] Items processed counter
- [ ] Error log display
- [ ] Pause/Resume capability
- [ ] Cancel with rollback option

### 4.5 Step 5: Verification & Report
- [ ] Migration summary
- [ ] Success/failure counts per category
- [ ] List of items that failed
- [ ] Retry failed items button
- [ ] Download migration report (JSON/CSV)
- [ ] ID mapping export (for reference)

---

## Phase 5: Advanced Features

### 5.1 Incremental/Delta Migration
- [ ] Track last migration timestamp
- [ ] Only migrate new/changed items
- [ ] Sync mode for ongoing synchronization

### 5.2 Scheduled Migration
- [ ] Schedule migration for off-peak hours
- [ ] Email notification on completion

### 5.3 Backup/Export Only Mode
- [ ] Export to JSON file
- [ ] Download complete backup
- [ ] Restore from backup file

### 5.4 Migration Templates
- [ ] Save migration configurations
- [ ] Reuse for similar migrations

### 5.5 Rollback System
- [ ] Track all created items
- [ ] One-click rollback
- [ ] Selective rollback by category

---

## Phase 6: Testing & Documentation

### 6.1 Testing
- [ ] Unit tests for migration service
- [ ] Integration tests with GHL API
- [ ] Test with small dataset
- [ ] Test with large dataset (1000+ contacts)
- [ ] Test error handling and recovery
- [ ] Test rollback functionality
- [ ] Test conflict resolution

### 6.2 Documentation
- [ ] User guide for migration process
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Known limitations document
- [ ] Required GHL API scopes list

---

## Technical Considerations

### API Rate Limits
- GHL API has rate limits (varies by endpoint)
- Implement exponential backoff
- Batch operations where possible
- Queue system for large migrations

### Required GHL API Scopes
```
contacts.readonly, contacts.write
calendars.readonly, calendars.write
opportunities.readonly, opportunities.write
workflows.readonly
forms.readonly
surveys.readonly
campaigns.readonly
locations.readonly
conversations.readonly, conversations.write
invoices.readonly
businesses.readonly
```

### Data Size Limits
- Handle contacts > 10,000
- Handle large media files
- Implement chunked transfers

### Security
- Never store API keys in plain text
- Encrypt sensitive data in transit
- Clear credentials after migration
- Audit logging for compliance

---

## File Structure

```
src/
├── services/
│   └── ghl-migration.ts          # Core migration service
├── components/admin/
│   └── GHLMigration.tsx          # Migration wizard UI
├── app/api/crm/migration/
│   ├── validate/route.ts         # Validate credentials
│   ├── analyze/route.ts          # Analyze source data
│   ├── export/route.ts           # Export from source
│   ├── import/route.ts           # Import to destination
│   ├── status/[jobId]/route.ts   # Job status
│   ├── rollback/[jobId]/route.ts # Rollback migration
│   └── history/route.ts          # Migration history
└── types/
    └── ghl-migration.ts          # TypeScript interfaces
```

---

## Priority Order for Implementation

### MVP (Minimum Viable Product)
1. Account connection & validation
2. Contacts migration (with tags & custom fields)
3. Pipelines & opportunities migration
4. Basic progress tracking
5. Error handling

### Phase 2 Additions
6. Calendars & appointments
7. Forms & surveys
8. AI prompts & templates

### Phase 3 Additions
9. Workflows (with limitations noted)
10. Campaigns
11. Media files
12. Advanced features (incremental, scheduled, rollback)

---

## Estimated Development Time

| Component | Estimated Hours |
|-----------|-----------------|
| Migration Service Core | 8-12 |
| API Endpoints | 6-8 |
| UI Wizard Component | 12-16 |
| Contacts Migration | 6-8 |
| Pipelines/Opportunities | 4-6 |
| Calendars/Appointments | 4-6 |
| Forms/Surveys | 3-4 |
| AI Prompts/Templates | 3-4 |
| Workflows | 4-6 |
| Campaigns | 3-4 |
| Tags/Custom Fields | 2-3 |
| Media Files | 4-6 |
| Testing | 8-12 |
| Documentation | 4-6 |
| **Total** | **70-100 hours** |

---

## Notes & Limitations

1. **Workflows**: GHL API has limited workflow write capabilities. Some workflows may need manual recreation.

2. **Triggers**: Custom triggers may not transfer perfectly due to webhook URL differences.

3. **Integrations**: Third-party integrations (Stripe, Twilio, etc.) will need reconfiguration.

4. **Phone Numbers**: Twilio phone numbers cannot be transferred - need new numbers.

5. **Domain Settings**: Custom domains need manual reconfiguration.

6. **Users**: Team members may need to be re-invited to the new account.

7. **Conversation History**: Full conversation history may be large and time-consuming to transfer.

8. **Media Storage**: Large media libraries may hit storage limits on destination.

---

*Last Updated: December 31, 2024*
*Version: 1.0*
