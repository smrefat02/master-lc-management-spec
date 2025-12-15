# Master LC v2.0 - Complete Banking Workflow Extension

**Status:** ✅ Specification Complete - Ready for Implementation  
**Date:** December 11, 2025

---

## 📦 Deliverables Created

✅ **MASTER_LC_SPECIFICATION_V2.md** - Complete technical specification with banking workflow

**Remaining files to be generated on request:**

- MASTER_LC_DATA_MODEL_V2.md
- MASTER_LC_PLAN_V2.md
- MASTER_LC_TASKS_V2.md
- MASTER_LC_IMPLEMENTATION_CHECKLIST_V2.md
- MASTER_LC_SWAGGER_SPEC_V2.md

---

## 🎯 Quick Implementation Summary

### Database Changes Required

**Add to `master_lcs` table:**

```sql
-- 9 new columns
issuing_bank_id
issuing_bank_reference_no
issuing_bank_issue_date
advising_bank_id
advising_bank_confirmation_status
advising_bank_verified_at
documents_received_at
documents_forwarded_to_bank_at
documents_verified_at

-- Modify existing
lc_status ENUM('draft', 'issued', 'verified', 'active', 'rejected', 'expired')
```

### API Changes Required

**3 new endpoints:**

1. `PUT /api/master-lcs/{id}/issue-bank` - Issue LC by bank
2. `PUT /api/master-lcs/{id}/advise-bank` - Advise/verify LC
3. `PUT /api/master-lcs/{id}/documents` - Update document tracking

### Backend Files to Create/Update

**New Files:**

- `app/Http/Requests/IssueMasterLCRequest.php`
- `app/Http/Requests/AdviseMasterLCRequest.php`
- `app/Http/Requests/UpdateDocumentsRequest.php`
- `app/Enums/LCStatus.php`
- `app/Services/BankingWorkflowService.php`

**Update Files:**

- `app/Models/MasterLC.php` - Add relationships, scopes, methods
- `app/Http/Controllers/MasterLCController.php` - Add 3 new methods
- `routes/api.php` - Add 3 new routes
- Migration file

### Frontend Files to Create/Update

**New Components:**

- `components/masterLc/IssuingBankPanel.jsx`
- `components/masterLc/AdvisingBankPanel.jsx`
- `components/masterLc/DocumentTrackingPanel.jsx`
- `components/masterLc/WorkflowTimeline.jsx`

**Update Components:**

- `pages/MasterLCDetail.jsx` - Add banking workflow sections
- `pages/MasterLCList.jsx` - Update status badges (6 statuses)

---

## 🏦 Banking Workflow Process

```
Step 1: User Creates LC
Status: draft → Basic LC information entered

Step 2: Issuing Bank Issues LC
Status: draft → issued
Required: issuing_bank_id, reference_no, issue_date
Endpoint: PUT /issue-bank

Step 3: Advising Bank Verifies LC
Status: issued → verified (or rejected)
Required: advising_bank_id, confirmation_status
Endpoint: PUT /advise-bank

Step 4: Document Processing
Status: verified → active
Required: documents_received_at, forwarded_at, verified_at
Endpoint: PUT /documents

Step 5: Auto-Expiry
Status: active → expired
Trigger: Cron job (after expiry_date)
```

---

## 📋 Implementation Tasks Overview

### Phase 1: Database (5 tasks)

1. Create migration file
2. Add 9 new columns
3. Modify lc_status enum
4. Add foreign keys
5. Run migration

### Phase 2: Backend Models (8 tasks)

6. Create LCStatus enum
7. Update MasterLC model fillable
8. Add bank relationships
9. Add status scopes
10. Add helper methods
11. Update casts
12. Create BankingWorkflowService
13. Unit tests

### Phase 3: Form Requests (6 tasks)

14. Create IssueMasterLCRequest
15. Add validation rules
16. Create AdviseMasterLCRequest
17. Add validation rules
18. Create UpdateDocumentsRequest
19. Add validation rules

### Phase 4: Controllers (6 tasks)

20. Add issueBank() method
21. Add adviseBank() method
22. Add updateDocuments() method
23. Add status validation
24. Add error handling
25. Add response formatting

### Phase 5: Routes (3 tasks)

26. Add PUT /issue-bank route
27. Add PUT /advise-bank route
28. Add PUT /documents route

### Phase 6: Frontend Banking Workflow (15 tasks)

29. Create IssuingBankPanel component
30. Add bank dropdown
31. Add reference number field
32. Add issue date picker
33. Add Issue LC button
34. Create AdvisingBankPanel component
35. Add bank dropdown
36. Add confirmation radio buttons
37. Add Confirm LC button
38. Create DocumentTrackingPanel component
39. Add 3 date pickers
40. Add Update button
41. Create WorkflowTimeline component
42. Add status badges
43. Add progress visualization
44. Integration with MasterLCDetail

### Phase 7: Status Management (10 tasks)

45. Update MasterLCList status badges
46. Add 6 status colors
47. Update status filter dropdown
48. Add status icons
49. Add permission checks per status
50. Hide/show buttons based on status
51. Add status transition validation
52. Add confirmation modals
53. Add success/error toasts
54. Status history logging

### Phase 8: Testing (15 tasks)

55-69. Unit tests, feature tests, integration tests

### Phase 9: Swagger Documentation (8 tasks)

70-77. Update OpenAPI schemas and endpoints

### Phase 10: Cron Jobs & Automation (5 tasks)

78-82. Auto-expiry, notifications, cleanup

**Total: 80+ tasks**

---

## 🔐 Validation Rules Summary

### Issue LC Validation

```php
'issuing_bank_id' => 'required|exists:banks,id'
'issuing_bank_reference_no' => 'required|string|max:100'
'issuing_bank_issue_date' => 'required|date|after_or_equal:issue_date'
'lc_status' => 'must be draft'
```

### Advise LC Validation

```php
'advising_bank_id' => 'required|exists:banks,id'
'advising_bank_confirmation_status' => 'required|in:pending,verified,rejected'
'lc_status' => 'must be issued'
```

### Document Tracking Validation

```php
'documents_received_at' => 'nullable|date'
'documents_forwarded_to_bank_at' => 'nullable|date|after_or_equal:documents_received_at'
'documents_verified_at' => 'nullable|date|after_or_equal:documents_forwarded_to_bank_at'
'lc_status' => 'must be verified or active'
```

---

## 🎨 UI Changes Summary

### No Changes Required (Existing UI)

- ✅ Contract selection
- ✅ LC number mode (auto/manual)
- ✅ Issue/expiry dates
- ✅ Buyer information section
- ✅ Beneficiary details section
- ✅ LC amount & currency
- ✅ Required documents checkboxes
- ✅ Terms & conditions textarea

### New UI Sections (Add to Detail Page)

- ➕ Issuing Bank Panel (collapsible)
- ➕ Advising Bank Panel (collapsible)
- ➕ Document Tracking Panel (collapsible)
- ➕ Workflow Timeline (visual progress bar)

### Updated UI Elements

- 🔄 Status badges (6 colors instead of 3)
- 🔄 Action buttons (show/hide based on status)
- 🔄 Edit permissions (disabled in terminal statuses)

---

## 📊 Status Badge Colors

| Status   | Color  | Hex     | Usage                    |
| -------- | ------ | ------- | ------------------------ |
| draft    | Gray   | #6B7280 | Initial creation         |
| issued   | Blue   | #3B82F6 | Bank issued              |
| verified | Green  | #10B981 | Bank verified            |
| active   | Teal   | #14B8A6 | Docs processed           |
| rejected | Red    | #EF4444 | Bank rejected (terminal) |
| expired  | Orange | #F59E0B | Past expiry (terminal)   |

---

## 🧪 Testing Scenarios

### Happy Path

1. Create LC (draft) ✓
2. Issue by bank (issued) ✓
3. Verify by advising bank (verified) ✓
4. Update documents (active) ✓
5. Auto-expire after date (expired) ✓

### Error Scenarios

1. Try to issue already issued LC → 403 error
2. Try to advise LC in draft status → 403 error
3. Try to update docs in draft status → 403 error
4. Try to edit rejected LC → 403 error
5. Set document dates out of order → 422 error
6. Delete issued LC → 403 error

### Edge Cases

1. Issue date before LC issue date → validation error
2. Documents verified after expiry date → validation error
3. Same bank as issuing and advising → allowed (warning)
4. Duplicate reference number per bank → validation error

---

## 🚀 Ready to Implement!

The complete specification is ready in **MASTER_LC_SPECIFICATION_V2.md**.

**Next Steps:**

1. Review the specification
2. Generate remaining SpecKit files on request:
   - DATA_MODEL
   - PLAN
   - TASKS (detailed 60-80 items)
   - IMPLEMENTATION_CHECKLIST (200+ items)
   - SWAGGER_SPEC
3. Begin Phase 1 implementation

**Would you like me to generate any specific file next, or proceed with implementation?**
