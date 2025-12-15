# Master LC Module - Technical Specification v2.0

**Project:** LC Management System  
**Module:** Master LC Management with Complete Banking Workflow  
**Version:** 2.0.0  
**Date:** December 11, 2025  
**Status:** 📋 Ready for Implementation

---

## Executive Summary

This specification extends the Master LC module to include the complete Letter of Credit banking process: **Importer (Buyer) → Issuing Bank → Advising/Confirming Bank → Exporter (Beneficiary)**. All existing UI elements remain unchanged while adding comprehensive banking workflow tracking, status management, and document flow monitoring.

---

## Table of Contents

1. [Banking Workflow Overview](#banking-workflow-overview)
2. [UI Requirements (Unchanged)](#ui-requirements)
3. [New Banking Fields](#new-banking-fields)
4. [API Endpoints](#api-endpoints)
5. [Status Workflow](#status-workflow)
6. [Validation Rules](#validation-rules)
7. [Implementation Guide](#implementation-guide)

---

## Banking Workflow Overview

### Real-World LC Process Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Importer │────▶│ Issuing Bank │────▶│Advising Bank │────▶│ Exporter │
│ (Buyer)  │     │ (Opening)    │     │(Confirming)  │     │(Benefici)│
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
     │                   │                     │                   │
     │ 1. Apply         │ 2. Issue LC        │ 3. Advise/       │ 4. Ship &
     │    for LC         │    & Send          │    Confirm LC     │    Prepare
     │                   │                     │                   │    Documents
     │                   │                     │                   │
     └───────────────────┴─────────────────────┴───────────────────┘
                              │
                         5. Document
                            Verification
                              │
                         6. Payment
```

### Process Steps in System

| Step | Actor         | System Status     | Required Fields                               | Action                  |
| ---- | ------------- | ----------------- | --------------------------------------------- | ----------------------- |
| 1    | User          | draft             | Basic LC info                                 | Create Master LC        |
| 2    | Issuing Bank  | issued            | issuing*bank*\*, reference_no, issue_date     | Issue LC                |
| 3    | Advising Bank | verified/rejected | advising*bank*\*, confirmation_status         | Advise/Verify LC        |
| 4    | Exporter      | active            | documents_received_at                         | Ship goods, submit docs |
| 5    | Banks         | active            | documents_forwarded_at, documents_verified_at | Process docs            |
| 6    | System        | expired/completed | Auto after expiry_date                        | Close LC                |

---

## UI Requirements (Unchanged)

### All Existing UI Elements Remain Identical

The following UI sections and fields remain exactly as originally specified:

#### A. Basic Information Section

- Contract (dropdown) - remains
- LC Number Mode (Auto/Manual) - remains
- LC Number (auto-generated or manual) - remains
- Issue Date - remains
- Expiry Date - remains

#### B. Buyer Information Section

- Select Buyer - remains
- Buyer Name (auto-filled) - remains
- Country (auto-filled) - remains
- Contact Person (auto-filled) - remains
- Address (auto-filled) - remains

#### C. Beneficiary Details Section

- Beneficiary Bank (dropdown) - remains
- Bank Name (auto-filled) - remains
- Account Number - remains
- SWIFT Code (auto-filled) - remains
- Branch (auto-filled) - remains

#### D. LC Amount & Currency Section

- Amount - remains
- Currency (USD/EUR/GBP) - remains
- Exchange Rate (optional) - remains

#### E. Required Documents Section

- Checkbox list (Commercial Invoice, Packing List, etc.) - remains

#### F. Terms & Conditions Section

- Textarea for terms - remains

### New UI Sections (Added to Detail/Edit Views Only)

#### G. Banking Workflow Section (NEW)

**Location:** Master LC Detail page, appears as expandable section

**Issuing Bank Panel** (visible when status >= issued):

```
┌─────────────────────────────────────────────────┐
│ 🏦 Issuing Bank Information                     │
├─────────────────────────────────────────────────┤
│ Bank Name:          [Auto-filled from bank]     │
│ Reference No:       [BOA-LC-12345]              │
│ Issue Date:         [Dec 11, 2025]              │
│ Status:             ✓ Issued                     │
└─────────────────────────────────────────────────┘
```

**Advising Bank Panel** (visible when status >= verified):

```
┌─────────────────────────────────────────────────┐
│ 🏦 Advising/Confirming Bank                     │
├─────────────────────────────────────────────────┤
│ Bank Name:          [Auto-filled from bank]     │
│ Confirmation:       ● Verified ○ Rejected        │
│ Verified Date:      [Dec 12, 2025]              │
│ Status:             ✓ Confirmed                  │
└─────────────────────────────────────────────────┘
```

**Document Tracking Panel** (visible when status >= active):

```
┌─────────────────────────────────────────────────┐
│ 📄 Document Flow Timeline                       │
├─────────────────────────────────────────────────┤
│ Documents Received:       [Dec 15, 2025 09:00] │
│ Forwarded to Bank:        [Dec 16, 2025 14:30] │
│ Documents Verified:       [Dec 18, 2025 11:00] │
└─────────────────────────────────────────────────┘
```

**Workflow Timeline Visual** (always visible):

```
Draft → Issued → Verified → Active → Completed
 ✓       ✓         ✓        ⏳         ⏸
```

---

## New Banking Fields

### Database Schema Extensions

#### Table: master_lcs (Extended)

**New Columns Added:**

```sql
-- Issuing Bank Fields
issuing_bank_id BIGINT UNSIGNED NULL,
issuing_bank_reference_no VARCHAR(100) NULL,
issuing_bank_issue_date DATE NULL,

-- Advising Bank Fields
advising_bank_id BIGINT UNSIGNED NULL,
advising_bank_confirmation_status ENUM('pending', 'verified', 'rejected') NULL,
advising_bank_verified_at TIMESTAMP NULL,

-- Document Tracking Fields
documents_received_at TIMESTAMP NULL,
documents_forwarded_to_bank_at TIMESTAMP NULL,
documents_verified_at TIMESTAMP NULL,

-- Status Field (Modified)
lc_status ENUM('draft', 'issued', 'verified', 'active', 'rejected', 'expired') DEFAULT 'draft',

-- Foreign Keys
FOREIGN KEY (issuing_bank_id) REFERENCES banks(id) ON DELETE SET NULL,
FOREIGN KEY (advising_bank_id) REFERENCES banks(id) ON DELETE SET NULL
```

### Field Definitions

| Field Name                        | Type        | Nullable | Default | Description                                  |
| --------------------------------- | ----------- | -------- | ------- | -------------------------------------------- |
| issuing_bank_id                   | FK          | Yes      | NULL    | Bank that issues the LC                      |
| issuing_bank_reference_no         | String(100) | Yes      | NULL    | Bank's internal LC reference                 |
| issuing_bank_issue_date           | Date        | Yes      | NULL    | Date bank actually issued LC                 |
| advising_bank_id                  | FK          | Yes      | NULL    | Bank that advises/confirms LC to beneficiary |
| advising_bank_confirmation_status | Enum        | Yes      | NULL    | pending/verified/rejected                    |
| advising_bank_verified_at         | Timestamp   | Yes      | NULL    | Auto-set when status changes                 |
| documents_received_at             | Timestamp   | Yes      | NULL    | When docs received from exporter             |
| documents_forwarded_to_bank_at    | Timestamp   | Yes      | NULL    | When docs sent to issuing bank               |
| documents_verified_at             | Timestamp   | Yes      | NULL    | When bank approves documents                 |
| lc_status                         | Enum        | No       | draft   | Current workflow status                      |

---

## API Endpoints

### Core CRUD Endpoints (Existing - No Changes)

#### 1. GET /api/master-lcs

**Description:** List Master LCs with pagination  
**No changes to request/response structure**

#### 2. POST /api/master-lcs

**Description:** Create new Master LC  
**New fields optional in request body** (will be NULL initially)

#### 3. GET /api/master-lcs/{id}

**Description:** Get single Master LC  
**Response includes new banking fields**

```json
{
  "id": 1,
  "lc_number": "MLC-20250001",
  // ... existing fields ...
  "issuing_bank": {
    "id": 2,
    "name": "Bank of America",
    "reference_no": "BOA-LC-12345",
    "issue_date": "2025-12-02"
  },
  "advising_bank": {
    "id": 3,
    "name": "HSBC Bank",
    "confirmation_status": "verified",
    "verified_at": "2025-12-05T14:30:00Z"
  },
  "document_tracking": {
    "received_at": "2025-12-10T09:00:00Z",
    "forwarded_to_bank_at": "2025-12-11T10:00:00Z",
    "verified_at": "2025-12-12T15:00:00Z"
  },
  "lc_status": "active"
}
```

#### 4. PUT /api/master-lcs/{id}

**Description:** Update Master LC  
**Can include new banking fields if status allows**

#### 5. DELETE /api/master-lcs/{id}

**Description:** Delete Master LC  
**Only allowed if lc_status = 'draft'**

---

### New Banking Workflow Endpoints

#### 6. PUT /api/master-lcs/{id}/issue-bank

**Description:** Record LC issuance by Issuing Bank

**Authorization:** User must have permission  
**Status Requirement:** lc_status must be 'draft'

**Request Body:**

```json
{
  "issuing_bank_id": 2,
  "issuing_bank_reference_no": "BOA-LC-12345",
  "issuing_bank_issue_date": "2025-12-02"
}
```

**Validation Rules:**

```php
[
    'issuing_bank_id' => 'required|exists:banks,id',
    'issuing_bank_reference_no' => 'required|string|max:100',
    'issuing_bank_issue_date' => 'required|date|after_or_equal:issue_date',
]
```

**Business Logic:**

1. Validate current lc_status = 'draft'
2. Validate all three fields are provided
3. Validate issuing_bank_issue_date >= lc issue_date
4. Update issuing bank fields
5. Change lc_status to 'issued'
6. Log status transition
7. Send notification (optional)

**Success Response:** 200 OK

```json
{
  "success": true,
  "message": "LC has been issued by bank successfully",
  "data": {
    "id": 1,
    "lc_status": "issued",
    "issuing_bank": {
      "id": 2,
      "name": "Bank of America",
      "reference_no": "BOA-LC-12345",
      "issue_date": "2025-12-02"
    },
    "status_changed_at": "2025-12-02T10:30:00Z"
  }
}
```

**Error Responses:**

**403 Forbidden** (Invalid status):

```json
{
  "success": false,
  "message": "Cannot issue LC. Current status must be 'draft'",
  "current_status": "issued"
}
```

**422 Unprocessable Entity** (Validation error):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "issuing_bank_id": ["The issuing bank field is required"],
    "issuing_bank_issue_date": ["Issue date must be on or after LC issue date"]
  }
}
```

---

#### 7. PUT /api/master-lcs/{id}/advise-bank

**Description:** Record LC advising/confirmation by Advising Bank

**Authorization:** User must have permission  
**Status Requirement:** lc_status must be 'issued'

**Request Body:**

```json
{
  "advising_bank_id": 3,
  "advising_bank_confirmation_status": "verified"
}
```

**Validation Rules:**

```php
[
    'advising_bank_id' => 'required|exists:banks,id',
    'advising_bank_confirmation_status' => 'required|in:pending,verified,rejected',
]
```

**Business Logic:**

1. Validate current lc_status = 'issued'
2. Validate fields
3. Update advising bank fields
4. Set advising_bank_verified_at to current timestamp
5. Change lc_status based on confirmation_status:
   - If 'verified' → lc_status = 'verified'
   - If 'rejected' → lc_status = 'rejected' (terminal)
   - If 'pending' → lc_status remains 'issued'
6. Log status transition
7. Send notification

**Success Response:** 200 OK (Verified)

```json
{
  "success": true,
  "message": "LC has been verified by advising bank",
  "data": {
    "id": 1,
    "lc_status": "verified",
    "advising_bank": {
      "id": 3,
      "name": "HSBC Bank",
      "confirmation_status": "verified",
      "verified_at": "2025-12-05T14:30:00Z"
    }
  }
}
```

**Success Response:** 200 OK (Rejected)

```json
{
  "success": true,
  "message": "LC has been rejected by advising bank",
  "data": {
    "id": 1,
    "lc_status": "rejected",
    "advising_bank": {
      "id": 3,
      "name": "HSBC Bank",
      "confirmation_status": "rejected",
      "verified_at": "2025-12-05T14:30:00Z"
    }
  }
}
```

**Error Response:** 403 Forbidden

```json
{
  "success": false,
  "message": "Cannot advise LC. LC must be issued first",
  "current_status": "draft"
}
```

---

#### 8. PUT /api/master-lcs/{id}/documents

**Description:** Update document tracking timestamps

**Authorization:** User must have permission  
**Status Requirement:** lc_status must be 'verified' or 'active'

**Request Body:**

```json
{
  "documents_received_at": "2025-12-10T09:00:00Z",
  "documents_forwarded_to_bank_at": "2025-12-11T10:00:00Z",
  "documents_verified_at": "2025-12-12T15:00:00Z"
}
```

**Validation Rules:**

```php
[
    'documents_received_at' => 'nullable|date',
    'documents_forwarded_to_bank_at' => 'nullable|date|after_or_equal:documents_received_at',
    'documents_verified_at' => 'nullable|date|after_or_equal:documents_forwarded_to_bank_at',
]
```

**Business Logic:**

1. Validate current lc_status is 'verified' or 'active'
2. Validate sequential dates
3. Update document timestamps
4. If documents_verified_at is set and status is 'verified', change to 'active'
5. Log updates

**Success Response:** 200 OK

```json
{
  "success": true,
  "message": "Document tracking updated successfully",
  "data": {
    "id": 1,
    "lc_status": "active",
    "document_tracking": {
      "received_at": "2025-12-10T09:00:00Z",
      "forwarded_to_bank_at": "2025-12-11T10:00:00Z",
      "verified_at": "2025-12-12T15:00:00Z"
    }
  }
}
```

**Error Response:** 422 Unprocessable Entity

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "documents_forwarded_to_bank_at": [
      "Forwarded date must be on or after received date"
    ]
  }
}
```

---

## Status Workflow

### Status Enumeration

```php
enum LCStatus: string {
    case DRAFT = 'draft';
    case ISSUED = 'issued';
    case VERIFIED = 'verified';
    case ACTIVE = 'active';
    case REJECTED = 'rejected';
    case EXPIRED = 'expired';
}
```

### Status Transition Matrix

| From Status | Allowed Transitions | Trigger       | Required Action                    |
| ----------- | ------------------- | ------------- | ---------------------------------- |
| draft       | issued              | User action   | PUT /issue-bank                    |
| issued      | verified            | User action   | PUT /advise-bank (status=verified) |
| issued      | rejected            | User action   | PUT /advise-bank (status=rejected) |
| verified    | active              | User action   | PUT /documents (with verified_at)  |
| active      | expired             | System (cron) | Auto after expiry_date             |
| rejected    | (none)              | Terminal      | No transitions allowed             |
| expired     | (none)              | Terminal      | No transitions allowed             |

### Status Rules & Permissions

#### Draft Status

- **Can:** Edit all fields, Delete, Issue LC
- **Cannot:** Advise LC, Update documents
- **UI:** Show "Issue LC" button
- **API:** All endpoints except /advise-bank, /documents

#### Issued Status

- **Can:** Advise LC only
- **Cannot:** Edit basic fields, Delete, Re-issue
- **UI:** Show "Advise LC" section
- **API:** Only /advise-bank endpoint active

#### Verified Status

- **Can:** Update document tracking
- **Cannot:** Edit basic/banking fields
- **UI:** Show "Document Tracking" section
- **API:** Only /documents endpoint active

#### Active Status

- **Can:** Update document timestamps (if not all set)
- **Cannot:** Edit any other fields
- **UI:** Show complete timeline, monitoring
- **API:** /documents endpoint (limited updates)

#### Rejected Status (Terminal)

- **Can:** View only
- **Cannot:** Any updates
- **UI:** Show rejection reason, no edit buttons
- **API:** All write endpoints return 403

#### Expired Status (Terminal)

- **Can:** View only, Archive
- **Cannot:** Any updates
- **UI:** Show "Expired" badge, archive option
- **API:** All write endpoints return 403

---

## Validation Rules

### Field-Level Validation

#### Issuing Bank Fields (when issuing)

```php
'issuing_bank_id' => [
    'required',
    'exists:banks,id',
    'different:advising_bank_id' // Optional business rule
],
'issuing_bank_reference_no' => [
    'required',
    'string',
    'max:100',
    Rule::unique('master_lcs')->where(function ($query) {
        return $query->where('issuing_bank_id', request('issuing_bank_id'));
    })
],
'issuing_bank_issue_date' => [
    'required',
    'date',
    'after_or_equal:issue_date',
    'before_or_equal:today'
]
```

#### Advising Bank Fields (when advising)

```php
'advising_bank_id' => [
    'required',
    'exists:banks,id'
],
'advising_bank_confirmation_status' => [
    'required',
    'in:pending,verified,rejected'
]
```

#### Document Tracking Fields

```php
'documents_received_at' => [
    'nullable',
    'date',
    'after_or_equal:advising_bank_verified_at'
],
'documents_forwarded_to_bank_at' => [
    'nullable',
    'date',
    'after_or_equal:documents_received_at'
],
'documents_verified_at' => [
    'nullable',
    'date',
    'after_or_equal:documents_forwarded_to_bank_at',
    'before_or_equal:expiry_date'
]
```

### Business Logic Validation

#### Status Transition Validation

```php
class StatusTransitionValidator {
    public function canTransitionTo(LCStatus $from, LCStatus $to): bool {
        return match($from) {
            LCStatus::DRAFT => $to === LCStatus::ISSUED,
            LCStatus::ISSUED => in_array($to, [LCStatus::VERIFIED, LCStatus::REJECTED]),
            LCStatus::VERIFIED => $to === LCStatus::ACTIVE,
            LCStatus::ACTIVE => $to === LCStatus::EXPIRED,
            LCStatus::REJECTED, LCStatus::EXPIRED => false,
        };
    }
}
```

#### Banking Workflow Validation

```php
class BankingWorkflowValidator {
    public function canIssueLC(MasterLC $lc): bool {
        return $lc->lc_status === LCStatus::DRAFT
            && $lc->issuing_bank_id === null;
    }

    public function canAdviseLC(MasterLC $lc): bool {
        return $lc->lc_status === LCStatus::ISSUED
            && $lc->issuing_bank_id !== null
            && $lc->advising_bank_id === null;
    }

    public function canUpdateDocuments(MasterLC $lc): bool {
        return in_array($lc->lc_status, [LCStatus::VERIFIED, LCStatus::ACTIVE]);
    }
}
```

---

## Implementation Guide

### Phase 1: Database Migration

**File:** `database/migrations/2025_12_11_add_banking_workflow_to_master_lcs.php`

```php
Schema::table('master_lcs', function (Blueprint $table) {
    // Issuing Bank
    $table->foreignId('issuing_bank_id')->nullable()->constrained('banks')->onDelete('set null');
    $table->string('issuing_bank_reference_no', 100)->nullable();
    $table->date('issuing_bank_issue_date')->nullable();

    // Advising Bank
    $table->foreignId('advising_bank_id')->nullable()->constrained('banks')->onDelete('set null');
    $table->enum('advising_bank_confirmation_status', ['pending', 'verified', 'rejected'])->nullable();
    $table->timestamp('advising_bank_verified_at')->nullable();

    // Document Tracking
    $table->timestamp('documents_received_at')->nullable();
    $table->timestamp('documents_forwarded_to_bank_at')->nullable();
    $table->timestamp('documents_verified_at')->nullable();

    // Modify existing status column
    $table->enum('lc_status', ['draft', 'issued', 'verified', 'active', 'rejected', 'expired'])
          ->default('draft')->change();

    // Indexes
    $table->index('lc_status');
    $table->index('issuing_bank_id');
    $table->index('advising_bank_id');
});
```

### Phase 2: Model Updates

**File:** `app/Models/MasterLC.php`

Add to fillable:

```php
protected $fillable = [
    // ... existing fields ...
    'issuing_bank_id',
    'issuing_bank_reference_no',
    'issuing_bank_issue_date',
    'advising_bank_id',
    'advising_bank_confirmation_status',
    'advising_bank_verified_at',
    'documents_received_at',
    'documents_forwarded_to_bank_at',
    'documents_verified_at',
    'lc_status',
];

protected $casts = [
    // ... existing casts ...
    'issuing_bank_issue_date' => 'date',
    'advising_bank_verified_at' => 'datetime',
    'documents_received_at' => 'datetime',
    'documents_forwarded_to_bank_at' => 'datetime',
    'documents_verified_at' => 'datetime',
    'lc_status' => LCStatus::class,
];

// Relationships
public function issuingBank(): BelongsTo {
    return $this->belongsTo(Bank::class, 'issuing_bank_id');
}

public function advisingBank(): BelongsTo {
    return $this->belongsTo(Bank::class, 'advising_bank_id');
}

// Scopes
public function scopeByStatus($query, string $status) {
    return $query->where('lc_status', $status);
}

// Helper Methods
public function canBeIssued(): bool {
    return $this->lc_status === LCStatus::DRAFT;
}

public function canBeAdvised(): bool {
    return $this->lc_status === LCStatus::ISSUED;
}

public function isTerminal(): bool {
    return in_array($this->lc_status, [LCStatus::REJECTED, LCStatus::EXPIRED]);
}
```

### Phase 3: Form Requests

**Create:** `app/Http/Requests/IssueMasterLCRequest.php`
**Create:** `app/Http/Requests/AdviseMasterLCRequest.php`
**Create:** `app/Http/Requests/UpdateDocumentsRequest.php`

### Phase 4: Controller Methods

**File:** `app/Http/Controllers/MasterLCController.php`

Add new methods:

```php
public function issueBank(IssueMasterLCRequest $request, MasterLC $masterLc)
public function adviseBank(AdviseMasterLCRequest $request, MasterLC $masterLc)
public function updateDocuments(UpdateDocumentsRequest $request, MasterLC $masterLc)
```

### Phase 5: Routes

**File:** `routes/api.php`

```php
Route::put('master-lcs/{masterLc}/issue-bank', [MasterLCController::class, 'issueBank']);
Route::put('master-lcs/{masterLc}/advise-bank', [MasterLCController::class, 'adviseBank']);
Route::put('master-lcs/{masterLc}/documents', [MasterLCController::class, 'updateDocuments']);
```

### Phase 6: Frontend Components

**New Components Needed:**

- `IssuingBankPanel.jsx` - For issuing bank form
- `AdvisingBankPanel.jsx` - For advising bank form
- `DocumentTrackingPanel.jsx` - For document timestamps
- `WorkflowTimeline.jsx` - Visual timeline component

**Updated Components:**

- `MasterLCDetail.jsx` - Add banking workflow sections
- `MasterLCList.jsx` - Update status badges

### Phase 7: Testing

**Unit Tests:**

- Status transition validation
- Business logic validators
- Model relationships

**Feature Tests:**

- Issue LC workflow
- Advise LC workflow (verified/rejected)
- Document tracking updates
- Status-based permissions

**Integration Tests:**

- Complete banking workflow end-to-end
- Auto-expiry cron job
- Notification triggers

---

## Summary of Changes

### ✅ Preserved (No Changes)

- All existing UI fields and layouts
- All existing basic LC information
- Buyer and beneficiary sections
- Amount and currency fields
- Required documents checkboxes
- Terms and conditions
- Original CRUD endpoints structure

### ✨ Added (New Features)

- 9 new database fields for banking workflow
- 3 new API endpoints for banking operations
- 6-state status workflow system
- Banking workflow UI panels
- Document tracking timeline
- Status transition validation
- Workflow permission system
- Auto-expiry functionality

### 📝 Next Steps

1. Review and approve this specification
2. Proceed to DATA_MODEL document
3. Generate TASKS breakdown
4. Create IMPLEMENTATION_CHECKLIST
5. Update SWAGGER documentation
6. Begin implementation in phases

---

**End of Specification v2.0.0**
