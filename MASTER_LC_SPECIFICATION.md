# Master LC Management System - Complete Specification v3.0

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [UI Requirements](#ui-requirements)
4. [Backend Workflow Logic](#backend-workflow-logic)
5. [Data Model](#data-model)
6. [API Endpoints](#api-endpoints)
7. [State Machine](#state-machine)
8. [Timeline Tracking](#timeline-tracking)
9. [Validation Rules](#validation-rules)
10. [Security & Authorization](#security--authorization)
11. [Error Handling](#error-handling)

---

## 1. Overview

### Purpose

The Master LC Management System implements the complete Letter of Credit lifecycle as per international banking standards, supporting the full 8-step LC workflow from contract agreement to final settlement.

### Key Principles

- **UI Simplicity**: Frontend maintains single bank field (Beneficiary Bank) for ease of use
- **Backend Completeness**: Backend implements full dual-bank architecture (Issuing + Advising)
- **Workflow Automation**: State machine enforces correct LC lifecycle progression
- **Audit Trail**: Complete timeline tracking for compliance and transparency

### 8-Step LC Lifecycle

1. **Contract Agreement**: Buyer and Seller agree on terms
2. **LC Application**: Importer applies for LC at their bank
3. **LC Issuance**: Issuing Bank issues the LC
4. **LC Advising**: Advising Bank verifies and forwards LC to exporter
5. **Goods Shipment**: Exporter ships goods as per LC terms
6. **Document Submission**: Exporter provides shipping documents
7. **Document Forwarding**: Documents forwarded through banking chain
8. **Document Verification & Settlement**: Banks verify and settle LC

---

## 2. System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Simple UI (single bank field)                        │
│  - Master LC CRUD                                        │
│  - Timeline visualization                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  API Layer (Laravel)                     │
│  - RESTful endpoints                                     │
│  - State machine validation                             │
│  - Timeline logging                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic (Services)                   │
│  - LCWorkflowService (state transitions)                │
│  - LCTimelineService (audit logging)                    │
│  - LCValidationService (rules enforcement)              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Layer (Models)                      │
│  - MasterLC                                             │
│  - Bank                                                 │
│  - LCTimeline                                           │
│  - Contract, Order, Shipment                            │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: SQLite (dev), MySQL (production)
- **API**: RESTful JSON
- **Documentation**: OpenAPI 3.0 (Swagger)

---

## 3. UI Requirements

### Master LC Create/Edit Form

#### Visible Fields (UNCHANGED from current implementation)

**Section A: Basic Information**

- Contract (dropdown - optional)
- LC Number Mode (radio: Auto/Manual)
- LC Number (text input, auto-generated if Auto mode)
- Issue Date (date picker, required)
- Expiry Date (date picker, required)

**Section B: Buyer Information**

- Buyer Name (text, required)
- Country (text, required)
- Contact Person (text, required)
- Address (textarea, required)

**Section C: Beneficiary Bank** _(Single bank UI field)_

- Bank Name (text, required)
- Bank Address (textarea, required)
- SWIFT Code (text, required)
- Account Number (text, required)
- Account Name (text, required)

**Section D: LC Amount & Currency**

- LC Amount (number, required)
- Currency (dropdown: USD, EUR, GBP, etc., required)
- Exchange Rate (number, optional)
- Converted Amount (calculated, optional)

**Section E: Required Documents**

- Commercial Invoice (checkbox)
- Packing List (checkbox)
- Bill of Lading (checkbox)
- Certificate of Origin (checkbox)
- Insurance Certificate (checkbox)
- Other Documents (textarea)

**Section F: Terms & Conditions**

- Terms & Conditions (rich text editor)

**Section G: Attachments**

- File upload area
- List of uploaded files with download/delete

#### Backend-Only Fields (NOT visible in UI)

These fields are managed programmatically:

- `issuing_bank_id` (defaults to beneficiary bank, can be overridden)
- `issuing_bank_reference_no`
- `issuing_bank_issue_date`
- `advising_bank_id` (defaults to beneficiary bank, can be overridden)
- `advising_bank_verification_status`
- `advising_bank_verified_at`
- `goods_shipped_at`
- `documents_received_at`
- `documents_forwarded_at`
- `documents_verified_at`
- `lc_status` (workflow state)

### Master LC List Page

**Table Columns:**

- # (row number)
- LC Number
- Contract Number (if linked)
- Buyer Name
- Beneficiary Bank
- Amount & Currency
- Issue Date
- Expiry Date
- Status (badge with color coding)
- Actions (View, Edit, Delete)

**Filters:**

- LC Number (text search)
- Buyer (text search)
- Status (dropdown with all 11 statuses)
- Date Range (from/to date pickers)

**Status Badge Colors:**

- `draft` - Gray
- `applied` - Yellow
- `issued_by_issuing_bank` - Blue
- `verified_by_advising_bank` - Cyan
- `goods_shipped` - Purple
- `documents_received` - Indigo
- `documents_forwarded` - Teal
- `documents_verified` - Green
- `active` - Emerald
- `expired` - Orange
- `rejected` - Red

### Master LC Detail Page

**Sections:**

1. Basic Information (read-only display)
2. Buyer Information
3. Beneficiary Bank Information
4. LC Amount & Currency
5. Required Documents (checkmark list)
6. Terms & Conditions
7. Attachments (download links)
8. **LC Lifecycle Timeline** (NEW - visual workflow tracker)
9. Audit Information (created by, approved by, etc.)
10. **Workflow Actions** (NEW - state transition buttons)

#### LC Lifecycle Timeline Component

Visual representation showing:

- All 11 workflow states
- Current state highlighted
- Completed states checked
- Pending states grayed out
- Timestamp for each completed state
- User who performed each action

#### Workflow Action Buttons (conditionally shown)

Based on current `lc_status`, show appropriate action:

- **draft** → "Apply for LC" button
- **applied** → "Issue LC" button (admin only)
- **issued_by_issuing_bank** → "Verify LC" button (admin only)
- **verified_by_advising_bank** → "Mark Goods Shipped" button
- **goods_shipped** → "Submit Documents" button
- **documents_received** → "Forward Documents" button (admin only)
- **documents_forwarded** → "Verify Documents" button (admin only)
- **documents_verified** → "Activate LC" button (admin only)

Each button opens a modal with relevant fields for that transition.

---

## 4. Backend Workflow Logic

### Dual-Bank Architecture

Even though UI shows single "Beneficiary Bank", backend maintains two distinct bank relationships:

#### Issuing Bank (Importer's Bank)

- Issues the Letter of Credit
- Guarantees payment to exporter
- Verifies and processes documents
- Settles payment upon document verification

**Default Behavior**: When user enters Beneficiary Bank in UI, system can:

- Auto-assign same bank as both issuing and advising (for simple cases)
- Allow admin to override and assign different issuing bank (for complex cases)

#### Advising Bank (Exporter's Bank)

- Receives LC from issuing bank
- Verifies LC authenticity
- Forwards LC to exporter (beneficiary)
- Collects and forwards documents to issuing bank

**Default Behavior**: Beneficiary Bank from UI is stored as advising bank.

### Workflow Service Architecture

#### LCWorkflowService

Manages state transitions and orchestrates the LC lifecycle.

**Responsibilities:**

- Validate state transition requests
- Execute state changes
- Update timestamps
- Create timeline entries
- Send notifications
- Trigger dependent actions

**Key Methods:**

```php
class LCWorkflowService
{
    public function applyForLC(MasterLC $lc, array $data): MasterLC;
    public function issueLC(MasterLC $lc, array $data): MasterLC;
    public function adviseLC(MasterLC $lc, array $data): MasterLC;
    public function shipGoods(MasterLC $lc, array $data): MasterLC;
    public function receiveDocuments(MasterLC $lc, array $data): MasterLC;
    public function forwardDocuments(MasterLC $lc, array $data): MasterLC;
    public function verifyDocuments(MasterLC $lc, array $data): MasterLC;
    public function activateLC(MasterLC $lc): MasterLC;
    public function rejectLC(MasterLC $lc, string $reason): MasterLC;
    public function canTransitionTo(MasterLC $lc, string $toStatus): bool;
}
```

#### LCTimelineService

Logs all workflow events for audit trail.

**Key Methods:**

```php
class LCTimelineService
{
    public function logTransition(
        MasterLC $lc,
        string $action,
        string $previousStatus,
        string $newStatus,
        ?string $performedBy,
        ?array $metadata
    ): LCTimeline;

    public function getTimeline(MasterLC $lc): Collection;
}
```

#### LCValidationService

Validates business rules and state transitions.

**Key Methods:**

```php
class LCValidationService
{
    public function validateApplyForLC(MasterLC $lc): array;
    public function validateIssueLC(MasterLC $lc, array $data): array;
    public function validateAdviseLC(MasterLC $lc, array $data): array;
    public function validateShipGoods(MasterLC $lc, array $data): array;
    public function validateReceiveDocuments(MasterLC $lc, array $data): array;
    public function validateForwardDocuments(MasterLC $lc): array;
    public function validateVerifyDocuments(MasterLC $lc, array $data): array;
}
```

---

## 5. Data Model

### Master LC Table Schema

```sql
CREATE TABLE master_lcs (
    -- Primary Key
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    -- Foreign Keys
    contract_id BIGINT UNSIGNED NULL,
    order_id BIGINT UNSIGNED NULL,

    -- Basic Information
    lc_number VARCHAR(100) UNIQUE NOT NULL,
    lc_number_mode ENUM('auto', 'manual') DEFAULT 'auto',
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,

    -- Buyer Information (JSON)
    buyer_info JSON NOT NULL,
    -- {name, country, contact_person, address}

    -- Beneficiary Bank (UI field - stored as JSON)
    beneficiary_info JSON NOT NULL,
    -- {bank_name, bank_address, swift_code, account_number, account_name}

    -- LC Amount
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4) NULL,
    converted_amount DECIMAL(15,2) NULL,

    -- Required Documents (JSON array)
    required_documents JSON NULL,

    -- Terms & Conditions
    terms_and_conditions TEXT NULL,

    -- Attachments (JSON array)
    attachments JSON NULL,

    -- === BACKEND WORKFLOW FIELDS (not in UI) ===

    -- Issuing Bank
    issuing_bank_id BIGINT UNSIGNED NULL,
    issuing_bank_reference_no VARCHAR(100) NULL,
    issuing_bank_issue_date DATE NULL,

    -- Advising Bank
    advising_bank_id BIGINT UNSIGNED NULL,
    advising_bank_verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    advising_bank_verified_at TIMESTAMP NULL,

    -- Workflow Timestamps
    applied_at TIMESTAMP NULL,
    issued_at TIMESTAMP NULL,
    goods_shipped_at TIMESTAMP NULL,
    documents_received_at TIMESTAMP NULL,
    documents_forwarded_at TIMESTAMP NULL,
    documents_verified_at TIMESTAMP NULL,
    activated_at TIMESTAMP NULL,

    -- Workflow Status
    lc_status ENUM(
        'draft',
        'applied',
        'issued_by_issuing_bank',
        'verified_by_advising_bank',
        'goods_shipped',
        'documents_received',
        'documents_forwarded',
        'documents_verified',
        'active',
        'expired',
        'rejected'
    ) DEFAULT 'draft',

    -- Rejection
    rejection_reason TEXT NULL,
    rejected_at TIMESTAMP NULL,
    rejected_by VARCHAR(255) NULL,

    -- Audit Fields
    created_by VARCHAR(255) NULL,
    approved_by VARCHAR(255) NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign Key Constraints
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (issuing_bank_id) REFERENCES banks(id) ON DELETE SET NULL,
    FOREIGN KEY (advising_bank_id) REFERENCES banks(id) ON DELETE SET NULL,

    -- Indexes
    INDEX idx_lc_number (lc_number),
    INDEX idx_lc_status (lc_status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_issuing_bank (issuing_bank_id),
    INDEX idx_advising_bank (advising_bank_id)
);
```

### Banks Table Schema

```sql
CREATE TABLE banks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    swift_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NULL,
    country VARCHAR(100) NULL,
    branch VARCHAR(255) NULL,
    contact_person VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_swift_code (swift_code),
    INDEX idx_status (status)
);
```

### LC Timeline Table Schema

```sql
CREATE TABLE lc_timelines (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    master_lc_id BIGINT UNSIGNED NOT NULL,

    -- Timeline Entry
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    performed_by VARCHAR(255) NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- State Transition
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,

    -- Additional Data
    metadata JSON NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (master_lc_id) REFERENCES master_lcs(id) ON DELETE CASCADE,
    INDEX idx_master_lc (master_lc_id),
    INDEX idx_action (action),
    INDEX idx_performed_at (performed_at)
);
```

### Model Relationships

#### MasterLC Model

```php
class MasterLC extends Model
{
    // Relationships
    public function contract(): BelongsTo;
    public function order(): BelongsTo;
    public function issuingBank(): BelongsTo;
    public function advisingBank(): BelongsTo;
    public function timeline(): HasMany;

    // Workflow Methods
    public function canApply(): bool;
    public function canIssue(): bool;
    public function canAdvise(): bool;
    public function canShipGoods(): bool;
    public function canReceiveDocuments(): bool;
    public function canForwardDocuments(): bool;
    public function canVerifyDocuments(): bool;
    public function canActivate(): bool;
    public function canReject(): bool;

    // Status Checks
    public function isDraft(): bool;
    public function isApplied(): bool;
    public function isIssued(): bool;
    public function isVerified(): bool;
    public function isActive(): bool;
    public function isExpired(): bool;
    public function isRejected(): bool;
    public function isTerminal(): bool;

    // Helper Methods
    public function getStatusLabel(): string;
    public function getStatusColor(): string;
    public function getAllowedTransitions(): array;
    public function getNextAction(): ?string;
}
```

---

## 6. API Endpoints

### Base URL

```
http://api.example.com/api/v1
```

### Authentication

All endpoints require authentication via Sanctum token:

```
Authorization: Bearer {token}
```

### Endpoints Overview

#### 6.1 Master LC CRUD

**Create Master LC**

```http
POST /master-lc
Content-Type: application/json

{
    "contract_id": 1,
    "lc_number_mode": "auto",
    "lc_number": "",
    "issue_date": "2025-01-15",
    "expiry_date": "2025-07-15",
    "buyer_info": {
        "name": "ABC Trading Ltd",
        "country": "USA",
        "contact_person": "John Smith",
        "address": "123 Main St, New York, NY 10001"
    },
    "beneficiary_info": {
        "bank_name": "HSBC Hong Kong",
        "bank_address": "1 Queen's Road Central, Hong Kong",
        "swift_code": "HSBCHKHHHKH",
        "account_number": "123-456789-001",
        "account_name": "XYZ Manufacturing Co Ltd"
    },
    "amount": 50000.00,
    "currency": "USD",
    "required_documents": [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "certificate_of_origin"
    ],
    "terms_and_conditions": "..."
}

Response 201:
{
    "success": true,
    "message": "Master LC created successfully",
    "data": {
        "id": 1,
        "lc_number": "LC-2025-0001",
        "lc_status": "draft",
        ...
    }
}
```

**Get Master LC**

```http
GET /master-lc/{id}

Response 200:
{
    "success": true,
    "data": {
        "id": 1,
        "lc_number": "LC-2025-0001",
        "lc_status": "draft",
        "issue_date": "2025-01-15",
        "expiry_date": "2025-07-15",
        "buyer_info": {...},
        "beneficiary_info": {...},
        "amount": 50000.00,
        "currency": "USD",
        "issuing_bank": {...},
        "advising_bank": {...},
        "timeline": [...],
        "allowed_transitions": ["applied"],
        "next_action": "apply_for_lc",
        ...
    }
}
```

**List Master LCs**

```http
GET /master-lc?page=1&per_page=20&status=draft&search=LC-2025

Response 200:
{
    "success": true,
    "data": [...]
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 100,
        "last_page": 5
    }
}
```

**Update Master LC**

```http
PUT /master-lc/{id}
Content-Type: application/json

{
    "expiry_date": "2025-08-15",
    "amount": 55000.00,
    ...
}

Response 200:
{
    "success": true,
    "message": "Master LC updated successfully",
    "data": {...}
}
```

**Delete Master LC**

```http
DELETE /master-lc/{id}

Response 200:
{
    "success": true,
    "message": "Master LC deleted successfully"
}
```

#### 6.2 Workflow Transitions

**Apply for LC (Step 2)**

```http
PUT /master-lc/{id}/apply
Content-Type: application/json

{
    "applicant_remarks": "Urgent shipment required"
}

Response 200:
{
    "success": true,
    "message": "LC application submitted successfully",
    "data": {
        "id": 1,
        "lc_status": "applied",
        "applied_at": "2025-01-15T10:30:00Z",
        ...
    }
}

Error 422:
{
    "success": false,
    "message": "Invalid transition",
    "errors": {
        "lc_status": ["LC must be in draft status to apply"]
    }
}
```

**Issue LC (Step 3)**

```http
PUT /master-lc/{id}/issue
Content-Type: application/json

{
    "issuing_bank_id": 1,
    "issuing_bank_reference_no": "HSBC-LC-2025-001",
    "issuing_bank_issue_date": "2025-01-16",
    "issuer_remarks": "LC issued as per application"
}

Response 200:
{
    "success": true,
    "message": "LC issued successfully",
    "data": {
        "id": 1,
        "lc_status": "issued_by_issuing_bank",
        "issuing_bank_id": 1,
        "issuing_bank_reference_no": "HSBC-LC-2025-001",
        "issuing_bank_issue_date": "2025-01-16",
        "issued_at": "2025-01-16T09:00:00Z",
        ...
    }
}
```

**Advise/Verify LC (Step 4)**

```http
PUT /master-lc/{id}/advise
Content-Type: application/json

{
    "advising_bank_id": 2,
    "advising_bank_verification_status": "verified",
    "advisor_remarks": "LC verified and forwarded to beneficiary"
}

Response 200:
{
    "success": true,
    "message": "LC verified by advising bank",
    "data": {
        "id": 1,
        "lc_status": "verified_by_advising_bank",
        "advising_bank_id": 2,
        "advising_bank_verification_status": "verified",
        "advising_bank_verified_at": "2025-01-17T10:00:00Z",
        ...
    }
}
```

**Ship Goods (Step 5)**

```http
PUT /master-lc/{id}/ship-goods
Content-Type: application/json

{
    "shipment_id": 123,
    "shipping_date": "2025-02-01",
    "carrier": "Maersk Line",
    "vessel_name": "MSC Preziosa",
    "bill_of_lading_no": "BL-2025-001",
    "shipper_remarks": "Goods shipped as per LC terms"
}

Response 200:
{
    "success": true,
    "message": "Goods shipment recorded",
    "data": {
        "id": 1,
        "lc_status": "goods_shipped",
        "goods_shipped_at": "2025-02-01T08:00:00Z",
        ...
    }
}
```

**Receive Documents (Step 6)**

```http
PUT /master-lc/{id}/documents/receive
Content-Type: application/json

{
    "received_documents": [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "certificate_of_origin",
        "insurance_certificate"
    ],
    "receiver_remarks": "All documents received in order"
}

Response 200:
{
    "success": true,
    "message": "Documents received successfully",
    "data": {
        "id": 1,
        "lc_status": "documents_received",
        "documents_received_at": "2025-02-05T14:30:00Z",
        ...
    }
}
```

**Forward Documents (Step 7)**

```http
PUT /master-lc/{id}/documents/forward
Content-Type: application/json

{
    "forwarded_to": "issuing_bank",
    "forwarder_remarks": "Documents forwarded to issuing bank for verification"
}

Response 200:
{
    "success": true,
    "message": "Documents forwarded successfully",
    "data": {
        "id": 1,
        "lc_status": "documents_forwarded",
        "documents_forwarded_at": "2025-02-06T09:00:00Z",
        ...
    }
}
```

**Verify Documents (Step 8)**

```http
PUT /master-lc/{id}/documents/verify
Content-Type: application/json

{
    "verification_status": "approved",
    "discrepancies": [],
    "verifier_remarks": "All documents are in order, payment authorized"
}

Response 200:
{
    "success": true,
    "message": "Documents verified successfully",
    "data": {
        "id": 1,
        "lc_status": "documents_verified",
        "documents_verified_at": "2025-02-07T11:00:00Z",
        ...
    }
}
```

**Activate LC (Final Step)**

```http
PUT /master-lc/{id}/activate
Content-Type: application/json

{}

Response 200:
{
    "success": true,
    "message": "LC activated successfully",
    "data": {
        "id": 1,
        "lc_status": "active",
        "activated_at": "2025-02-07T11:30:00Z",
        ...
    }
}
```

**Reject LC (Any Step)**

```http
PUT /master-lc/{id}/reject
Content-Type: application/json

{
    "rejection_reason": "Discrepancies found in documents: Bill of Lading date mismatch"
}

Response 200:
{
    "success": true,
    "message": "LC rejected",
    "data": {
        "id": 1,
        "lc_status": "rejected",
        "rejection_reason": "...",
        "rejected_at": "2025-02-07T11:00:00Z",
        ...
    }
}
```

#### 6.3 Timeline & History

**Get LC Timeline**

```http
GET /master-lc/{id}/timeline

Response 200:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "action": "lc_created",
            "description": "Master LC created",
            "performed_by": "John Doe",
            "performed_at": "2025-01-15T09:00:00Z",
            "previous_status": null,
            "new_status": "draft"
        },
        {
            "id": 2,
            "action": "lc_applied",
            "description": "LC application submitted",
            "performed_by": "John Doe",
            "performed_at": "2025-01-15T10:30:00Z",
            "previous_status": "draft",
            "new_status": "applied"
        },
        {
            "id": 3,
            "action": "lc_issued",
            "description": "LC issued by issuing bank",
            "performed_by": "Bank Officer",
            "performed_at": "2025-01-16T09:00:00Z",
            "previous_status": "applied",
            "new_status": "issued_by_issuing_bank",
            "metadata": {
                "issuing_bank_reference_no": "HSBC-LC-2025-001"
            }
        },
        ...
    ]
}
```

#### 6.4 Utility Endpoints

**Generate LC Number**

```http
GET /master-lc-generate-number

Response 200:
{
    "success": true,
    "data": {
        "lc_number": "LC-2025-0042"
    }
}
```

**Get Dropdown Data**

```http
GET /master-lc-dropdown-data

Response 200:
{
    "success": true,
    "data": {
        "contracts": [...],
        "banks": [...],
        "currencies": ["USD", "EUR", "GBP", "JPY", "CNY", "HKD"],
        "document_types": [
            "commercial_invoice",
            "packing_list",
            "bill_of_lading",
            "certificate_of_origin",
            "insurance_certificate",
            "inspection_certificate"
        ]
    }
}
```

**Get LC Statistics**

```http
GET /master-lc-statistics

Response 200:
{
    "success": true,
    "data": {
        "total_lcs": 150,
        "by_status": {
            "draft": 10,
            "applied": 5,
            "issued_by_issuing_bank": 8,
            "verified_by_advising_bank": 12,
            "goods_shipped": 15,
            "documents_received": 10,
            "documents_forwarded": 8,
            "documents_verified": 5,
            "active": 60,
            "expired": 12,
            "rejected": 5
        },
        "total_amount": 5000000.00,
        "by_currency": {
            "USD": 3000000.00,
            "EUR": 1500000.00,
            "GBP": 500000.00
        }
    }
}
```

---

## 7. State Machine

### Status Flow Diagram

```
┌──────────┐
│  draft   │ (LC created)
└────┬─────┘
     │ apply
     ▼
┌──────────┐
│ applied  │ (Application submitted)
└────┬─────┘
     │ issue
     ▼
┌──────────────────────────┐
│ issued_by_issuing_bank   │ (Bank issued LC)
└────┬─────────────────────┘
     │ advise
     ▼
┌──────────────────────────┐
│ verified_by_advising_bank│ (Bank verified LC)
└────┬─────────────────────┘
     │ ship-goods
     ▼
┌──────────────────┐
│ goods_shipped    │ (Goods shipped)
└────┬─────────────┘
     │ receive-documents
     ▼
┌──────────────────────┐
│ documents_received   │ (Docs received)
└────┬─────────────────┘
     │ forward-documents
     ▼
┌──────────────────────┐
│ documents_forwarded  │ (Docs forwarded)
└────┬─────────────────┘
     │ verify-documents
     ▼
┌──────────────────────┐
│ documents_verified   │ (Docs verified)
└────┬─────────────────┘
     │ activate
     ▼
┌──────────┐
│  active  │ (LC settlement complete)
└──────────┘

Note: Any status can transition to "rejected" or "expired"
```

### State Transition Matrix

| Current Status              | Allowed Next Status(es)                 | Action            | Validation                     |
| --------------------------- | --------------------------------------- | ----------------- | ------------------------------ |
| `draft`                     | `applied`                               | Apply for LC      | Basic LC details complete      |
| `applied`                   | `issued_by_issuing_bank`, `rejected`    | Issue LC          | Issuing bank review complete   |
| `issued_by_issuing_bank`    | `verified_by_advising_bank`, `rejected` | Advise LC         | Advising bank verification     |
| `verified_by_advising_bank` | `goods_shipped`, `rejected`             | Ship Goods        | Beneficiary ships goods        |
| `goods_shipped`             | `documents_received`, `rejected`        | Receive Documents | Documents submitted            |
| `documents_received`        | `documents_forwarded`, `rejected`       | Forward Documents | Documents sent to issuing bank |
| `documents_forwarded`       | `documents_verified`, `rejected`        | Verify Documents  | Issuing bank verifies          |
| `documents_verified`        | `active`, `rejected`                    | Activate LC       | Final settlement               |
| `active`                    | `expired`                               | (Auto)            | Past expiry date               |
| `rejected`                  | (terminal)                              | -                 | No further transitions         |
| `expired`                   | (terminal)                              | -                 | No further transitions         |

### LCStatus Enum

```php
namespace App\Enums;

enum LCStatus: string
{
    case DRAFT = 'draft';
    case APPLIED = 'applied';
    case ISSUED_BY_ISSUING_BANK = 'issued_by_issuing_bank';
    case VERIFIED_BY_ADVISING_BANK = 'verified_by_advising_bank';
    case GOODS_SHIPPED = 'goods_shipped';
    case DOCUMENTS_RECEIVED = 'documents_received';
    case DOCUMENTS_FORWARDED = 'documents_forwarded';
    case DOCUMENTS_VERIFIED = 'documents_verified';
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::APPLIED => 'Applied',
            self::ISSUED_BY_ISSUING_BANK => 'Issued by Bank',
            self::VERIFIED_BY_ADVISING_BANK => 'Verified by Advising Bank',
            self::GOODS_SHIPPED => 'Goods Shipped',
            self::DOCUMENTS_RECEIVED => 'Documents Received',
            self::DOCUMENTS_FORWARDED => 'Documents Forwarded',
            self::DOCUMENTS_VERIFIED => 'Documents Verified',
            self::ACTIVE => 'Active',
            self::EXPIRED => 'Expired',
            self::REJECTED => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::APPLIED => 'yellow',
            self::ISSUED_BY_ISSUING_BANK => 'blue',
            self::VERIFIED_BY_ADVISING_BANK => 'cyan',
            self::GOODS_SHIPPED => 'purple',
            self::DOCUMENTS_RECEIVED => 'indigo',
            self::DOCUMENTS_FORWARDED => 'teal',
            self::DOCUMENTS_VERIFIED => 'green',
            self::ACTIVE => 'emerald',
            self::EXPIRED => 'orange',
            self::REJECTED => 'red',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::EXPIRED, self::REJECTED]);
    }

    public function allowedTransitions(): array
    {
        return match($this) {
            self::DRAFT => [self::APPLIED],
            self::APPLIED => [self::ISSUED_BY_ISSUING_BANK, self::REJECTED],
            self::ISSUED_BY_ISSUING_BANK => [self::VERIFIED_BY_ADVISING_BANK, self::REJECTED],
            self::VERIFIED_BY_ADVISING_BANK => [self::GOODS_SHIPPED, self::REJECTED],
            self::GOODS_SHIPPED => [self::DOCUMENTS_RECEIVED, self::REJECTED],
            self::DOCUMENTS_RECEIVED => [self::DOCUMENTS_FORWARDED, self::REJECTED],
            self::DOCUMENTS_FORWARDED => [self::DOCUMENTS_VERIFIED, self::REJECTED],
            self::DOCUMENTS_VERIFIED => [self::ACTIVE, self::REJECTED],
            self::ACTIVE => [self::EXPIRED],
            self::EXPIRED => [],
            self::REJECTED => [],
        };
    }

    public function canTransitionTo(LCStatus $toStatus): bool
    {
        return in_array($toStatus, $this->allowedTransitions());
    }
}
```

---

## 8. Timeline Tracking

### Timeline Entry Structure

Every workflow action creates a timeline entry:

```php
[
    'id' => 1,
    'master_lc_id' => 1,
    'action' => 'lc_issued',
    'description' => 'LC issued by issuing bank',
    'performed_by' => 'admin@example.com',
    'performed_at' => '2025-01-16 09:00:00',
    'previous_status' => 'applied',
    'new_status' => 'issued_by_issuing_bank',
    'metadata' => [
        'issuing_bank_id' => 1,
        'issuing_bank_reference_no' => 'HSBC-LC-2025-001',
        'issuer_remarks' => 'LC issued as per application'
    ]
]
```

### Timeline Actions

| Action                | Description                  | Metadata                     |
| --------------------- | ---------------------------- | ---------------------------- |
| `lc_created`          | Master LC created            | Initial LC data              |
| `lc_updated`          | Master LC updated            | Changed fields               |
| `lc_applied`          | LC application submitted     | Applicant remarks            |
| `lc_issued`           | LC issued by issuing bank    | Bank details, reference no   |
| `lc_advised`          | LC verified by advising bank | Verification status, remarks |
| `goods_shipped`       | Goods shipped                | Shipment details, B/L no     |
| `documents_received`  | Documents received           | Document list                |
| `documents_forwarded` | Documents forwarded to bank  | Forwarding details           |
| `documents_verified`  | Documents verified by bank   | Verification result          |
| `lc_activated`        | LC activated (settlement)    | -                            |
| `lc_rejected`         | LC rejected                  | Rejection reason             |
| `lc_expired`          | LC expired                   | -                            |

### Timeline Display (Frontend)

Visual timeline component showing:

- Icon for each action
- Timestamp
- User who performed action
- Status change (from → to)
- Description
- Expandable metadata

---

## 9. Validation Rules

### Create/Update Master LC

```php
[
    'contract_id' => 'nullable|exists:contracts,id',
    'lc_number_mode' => 'required|in:auto,manual',
    'lc_number' => 'required_if:lc_number_mode,manual|unique:master_lcs,lc_number',
    'issue_date' => 'required|date|after_or_equal:today',
    'expiry_date' => 'required|date|after:issue_date',
    'buyer_info' => 'required|array',
    'buyer_info.name' => 'required|string|max:255',
    'buyer_info.country' => 'required|string|max:100',
    'buyer_info.contact_person' => 'required|string|max:255',
    'buyer_info.address' => 'required|string',
    'beneficiary_info' => 'required|array',
    'beneficiary_info.bank_name' => 'required|string|max:255',
    'beneficiary_info.bank_address' => 'required|string',
    'beneficiary_info.swift_code' => 'required|string|max:50',
    'beneficiary_info.account_number' => 'required|string|max:100',
    'beneficiary_info.account_name' => 'required|string|max:255',
    'amount' => 'required|numeric|min:0.01',
    'currency' => 'required|string|size:3',
    'exchange_rate' => 'nullable|numeric|min:0',
    'required_documents' => 'nullable|array',
    'terms_and_conditions' => 'nullable|string',
]
```

### Apply for LC

```php
[
    'applicant_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'draft'
- All required fields must be filled
- Issue date must be >= today
- Expiry date must be > issue date
```

### Issue LC

```php
[
    'issuing_bank_id' => 'required|exists:banks,id',
    'issuing_bank_reference_no' => 'required|string|max:100|unique:master_lcs',
    'issuing_bank_issue_date' => 'required|date|after_or_equal:issue_date|before_or_equal:today',
    'issuer_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'applied'
- Issuing bank must be active
- Issue date must be between LC issue_date and today
```

### Advise/Verify LC

```php
[
    'advising_bank_id' => 'required|exists:banks,id',
    'advising_bank_verification_status' => 'required|in:verified,rejected',
    'advisor_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'issued_by_issuing_bank'
- Advising bank must be active
- If verification_status = 'rejected', advisor_remarks required
```

### Ship Goods

```php
[
    'shipment_id' => 'nullable|exists:shipments,id',
    'shipping_date' => 'required|date|before_or_equal:today',
    'carrier' => 'required|string|max:255',
    'vessel_name' => 'nullable|string|max:255',
    'bill_of_lading_no' => 'required|string|max:100',
    'shipper_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'verified_by_advising_bank'
- Shipping date must be <= today
- Shipping date must be <= expiry_date
```

### Receive Documents

```php
[
    'received_documents' => 'required|array|min:1',
    'received_documents.*' => 'string|in:commercial_invoice,packing_list,bill_of_lading,...',
    'receiver_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'goods_shipped'
- All required documents must be in received_documents array
```

### Forward Documents

```php
[
    'forwarded_to' => 'required|in:issuing_bank,advising_bank',
    'forwarder_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'documents_received'
- Documents must be complete
```

### Verify Documents

```php
[
    'verification_status' => 'required|in:approved,rejected',
    'discrepancies' => 'nullable|array',
    'discrepancies.*' => 'string',
    'verifier_remarks' => 'nullable|string|max:1000',
]

Business Rules:
- LC status must be 'documents_forwarded'
- If verification_status = 'rejected', discrepancies required
```

### Activate LC

```php
[]

Business Rules:
- LC status must be 'documents_verified'
- No pending discrepancies
```

### Reject LC

```php
[
    'rejection_reason' => 'required|string|min:10|max:1000',
]

Business Rules:
- LC status must NOT be terminal (active, expired, rejected)
- Rejection reason must be descriptive
```

---

## 10. Security & Authorization

### User Roles

**Admin**

- Full access to all LC operations
- Can issue, advise, verify, activate LCs
- Can override workflow restrictions
- Can view all LCs

**Bank Officer**

- Can issue LCs (issuing bank actions)
- Can advise/verify LCs (advising bank actions)
- Can verify documents
- Can view LCs related to their bank

**Importer**

- Can create draft LCs
- Can apply for LCs
- Can view own LCs
- Cannot modify after application

**Exporter**

- Can view LCs where they are beneficiary
- Can mark goods as shipped
- Can submit documents
- Cannot modify LC terms

**Viewer**

- Read-only access to LCs
- Cannot perform any workflow actions

### Authorization Matrix

| Action            | Admin | Bank Officer | Importer | Exporter | Viewer |
| ----------------- | ----- | ------------ | -------- | -------- | ------ |
| Create LC         | ✓     | ✗            | ✓        | ✗        | ✗      |
| Update LC (draft) | ✓     | ✗            | ✓        | ✗        | ✗      |
| Apply for LC      | ✓     | ✗            | ✓        | ✗        | ✗      |
| Issue LC          | ✓     | ✓            | ✗        | ✗        | ✗      |
| Advise LC         | ✓     | ✓            | ✗        | ✗        | ✗      |
| Ship Goods        | ✓     | ✗            | ✗        | ✓        | ✗      |
| Receive Documents | ✓     | ✓            | ✗        | ✓        | ✗      |
| Forward Documents | ✓     | ✓            | ✗        | ✗        | ✗      |
| Verify Documents  | ✓     | ✓            | ✗        | ✗        | ✗      |
| Activate LC       | ✓     | ✓            | ✗        | ✗        | ✗      |
| Reject LC         | ✓     | ✓            | ✗        | ✗        | ✗      |
| View LC           | ✓     | ✓            | ✓        | ✓        | ✓      |
| Delete LC (draft) | ✓     | ✗            | ✓        | ✗        | ✗      |

### Permission Checks

```php
// In Controllers
public function issue(IssueLCRequest $request, MasterLC $lc)
{
    $this->authorize('issue', $lc);
    // ...
}

// In Policies
class MasterLCPolicy
{
    public function issue(User $user, MasterLC $lc): bool
    {
        return $user->hasRole(['admin', 'bank_officer'])
            && $lc->lc_status === LCStatus::APPLIED->value;
    }

    public function shipGoods(User $user, MasterLC $lc): bool
    {
        return ($user->hasRole(['admin', 'exporter'])
            || $user->id === $lc->beneficiary_user_id)
            && $lc->lc_status === LCStatus::VERIFIED_BY_ADVISING_BANK->value;
    }
}
```

---

## 11. Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "issuing_bank_id": ["The issuing bank id field is required."],
    "issue_date": ["The issue date must be after or equal to today."]
  }
}
```

### HTTP Status Codes

| Code | Description           | Usage                       |
| ---- | --------------------- | --------------------------- |
| 200  | OK                    | Successful GET, PUT, DELETE |
| 201  | Created               | Successful POST             |
| 400  | Bad Request           | Invalid request format      |
| 401  | Unauthorized          | Authentication required     |
| 403  | Forbidden             | Insufficient permissions    |
| 404  | Not Found             | Resource not found          |
| 422  | Unprocessable Entity  | Validation failed           |
| 500  | Internal Server Error | Server error                |

### Common Error Scenarios

**Invalid State Transition**

```json
{
  "success": false,
  "message": "Invalid state transition",
  "errors": {
    "lc_status": [
      "Cannot transition from 'draft' to 'issued_by_issuing_bank'. Must apply first."
    ]
  }
}
```

**Expired LC**

```json
{
  "success": false,
  "message": "LC has expired",
  "errors": {
    "expiry_date": ["LC expired on 2025-07-15. No further actions allowed."]
  }
}
```

**Missing Required Documents**

```json
{
  "success": false,
  "message": "Missing required documents",
  "errors": {
    "received_documents": [
      "Missing required document: certificate_of_origin",
      "Missing required document: insurance_certificate"
    ]
  }
}
```

**Unauthorized Action**

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "authorization": ["You do not have permission to issue LCs."]
  }
}
```

### Exception Handling

```php
try {
    $lc = $this->workflowService->issueLC($lc, $request->validated());
    return response()->json([
        'success' => true,
        'message' => 'LC issued successfully',
        'data' => new MasterLCResource($lc)
    ]);
} catch (InvalidTransitionException $e) {
    return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'errors' => ['lc_status' => [$e->getMessage()]]
    ], 422);
} catch (ValidationException $e) {
    return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors()
    ], 422);
} catch (\Exception $e) {
    Log::error('LC Issue Failed', [
        'lc_id' => $lc->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);

    return response()->json([
        'success' => false,
        'message' => 'An unexpected error occurred',
        'errors' => ['system' => ['Please contact support']]
    ], 500);
}
```

---

## Appendices

### A. Glossary

- **LC**: Letter of Credit
- **Issuing Bank**: Buyer's bank that issues the LC
- **Advising Bank**: Seller's bank that advises the LC
- **Beneficiary**: Seller/Exporter who receives payment
- **Applicant**: Buyer/Importer who applies for LC
- **B/L**: Bill of Lading
- **SWIFT**: Society for Worldwide Interbank Financial Telecommunication

### B. References

- UCP 600 (Uniform Customs and Practice for Documentary Credits)
- ISO 20022 (Financial Services Messaging Standard)
- SWIFT MT700 (Issue of a Documentary Credit)

### C. Version History

| Version | Date       | Changes                                    |
| ------- | ---------- | ------------------------------------------ |
| 3.0     | 2025-01-15 | Complete 8-step LC workflow implementation |
| 2.0     | 2025-01-10 | Added banking workflow (6 states)          |
| 1.0     | 2025-01-01 | Initial Master LC CRUD                     |

---

**End of Specification**
