# Master LC Data Model Specification

## Database Schema

### 1. master_lcs Table

Complete schema for Master Letter of Credit table supporting full 8-step workflow.

```sql
CREATE TABLE master_lcs (
    -- =====================================
    -- PRIMARY KEY
    -- =====================================
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    -- =====================================
    -- FOREIGN KEYS (Relationships)
    -- =====================================
    contract_id BIGINT UNSIGNED NULL COMMENT 'Link to parent contract',
    order_id BIGINT UNSIGNED NULL COMMENT 'Link to order',

    -- =====================================
    -- BASIC LC INFORMATION (UI Visible)
    -- =====================================
    lc_number VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique LC identifier',
    lc_number_mode ENUM('auto', 'manual') DEFAULT 'auto' COMMENT 'How LC number is generated',
    issue_date DATE NOT NULL COMMENT 'LC issue date',
    expiry_date DATE NOT NULL COMMENT 'LC expiry date',

    -- =====================================
    -- BUYER INFORMATION (UI Visible - JSON)
    -- =====================================
    buyer_info JSON NOT NULL COMMENT 'Buyer/Applicant information
    Structure:
    {
        "name": "ABC Trading Ltd",
        "country": "USA",
        "contact_person": "John Smith",
        "address": "123 Main St, New York, NY 10001",
        "phone": "+1-555-0100",
        "email": "john@abctrading.com"
    }',

    -- =====================================
    -- BENEFICIARY BANK (UI Visible - JSON)
    -- Single bank field in UI, stored here
    -- =====================================
    beneficiary_info JSON NOT NULL COMMENT 'Beneficiary bank information
    Structure:
    {
        "bank_name": "HSBC Hong Kong",
        "bank_address": "1 Queens Road Central, Hong Kong",
        "swift_code": "HSBCHKHHHKH",
        "account_number": "123-456789-001",
        "account_name": "XYZ Manufacturing Co Ltd",
        "contact_person": "Jane Doe",
        "phone": "+852-2822-1111",
        "email": "trade@hsbc.com.hk"
    }',

    -- =====================================
    -- LC AMOUNT (UI Visible)
    -- =====================================
    amount DECIMAL(15,2) NOT NULL COMMENT 'LC amount',
    currency VARCHAR(3) DEFAULT 'USD' COMMENT 'Currency code (ISO 4217)',
    exchange_rate DECIMAL(10,4) NULL COMMENT 'Exchange rate if conversion needed',
    converted_amount DECIMAL(15,2) NULL COMMENT 'Converted amount in base currency',

    -- =====================================
    -- REQUIRED DOCUMENTS (UI Visible - JSON)
    -- =====================================
    required_documents JSON NULL COMMENT 'List of required documents
    Example:
    [
        "commercial_invoice",
        "packing_list",
        "bill_of_lading",
        "certificate_of_origin",
        "insurance_certificate",
        "inspection_certificate"
    ]',

    -- =====================================
    -- TERMS & CONDITIONS (UI Visible)
    -- =====================================
    terms_and_conditions TEXT NULL COMMENT 'LC terms and conditions',

    -- =====================================
    -- ATTACHMENTS (UI Visible - JSON)
    -- =====================================
    attachments JSON NULL COMMENT 'Attached files
    Structure:
    [
        {
            "id": 1,
            "original_name": "contract.pdf",
            "stored_name": "lc_1_20250115_abc123.pdf",
            "size": 524288,
            "mime_type": "application/pdf",
            "uploaded_at": "2025-01-15T10:30:00Z",
            "uploaded_by": "user@example.com"
        }
    ]',

    -- =====================================
    -- ISSUING BANK INFORMATION (Backend Only)
    -- Buyer's bank that issues the LC
    -- =====================================
    issuing_bank_id BIGINT UNSIGNED NULL COMMENT 'Foreign key to banks table',
    issuing_bank_reference_no VARCHAR(100) NULL COMMENT 'Bank internal reference',
    issuing_bank_issue_date DATE NULL COMMENT 'Date when bank issued LC',

    -- =====================================
    -- ADVISING BANK INFORMATION (Backend Only)
    -- Seller's bank that advises/confirms LC
    -- =====================================
    advising_bank_id BIGINT UNSIGNED NULL COMMENT 'Foreign key to banks table',
    advising_bank_verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending' COMMENT 'Verification status by advising bank',
    advising_bank_verified_at TIMESTAMP NULL COMMENT 'When advising bank verified LC',

    -- =====================================
    -- WORKFLOW TIMESTAMPS (Backend Only)
    -- Track when each step occurred
    -- =====================================
    applied_at TIMESTAMP NULL COMMENT 'When importer applied for LC (Step 2)',
    issued_at TIMESTAMP NULL COMMENT 'When issuing bank issued LC (Step 3)',
    goods_shipped_at TIMESTAMP NULL COMMENT 'When goods were shipped (Step 5)',
    documents_received_at TIMESTAMP NULL COMMENT 'When documents received (Step 6)',
    documents_forwarded_at TIMESTAMP NULL COMMENT 'When documents forwarded to bank (Step 7)',
    documents_verified_at TIMESTAMP NULL COMMENT 'When bank verified documents (Step 8)',
    activated_at TIMESTAMP NULL COMMENT 'When LC was activated/settled',

    -- =====================================
    -- WORKFLOW STATUS (Backend Only)
    -- Current state in LC lifecycle
    -- =====================================
    lc_status ENUM(
        'draft',                        -- Step 1: LC created but not submitted
        'applied',                      -- Step 2: Application submitted by importer
        'issued_by_issuing_bank',      -- Step 3: LC issued by issuing bank
        'verified_by_advising_bank',   -- Step 4: LC verified by advising bank
        'goods_shipped',               -- Step 5: Goods shipped by exporter
        'documents_received',          -- Step 6: Documents received from exporter
        'documents_forwarded',         -- Step 7: Documents forwarded to issuing bank
        'documents_verified',          -- Step 8: Documents verified by issuing bank
        'active',                      -- Final: LC settlement complete
        'expired',                     -- Terminal: LC expired
        'rejected'                     -- Terminal: LC rejected
    ) DEFAULT 'draft' COMMENT 'Current workflow status',

    -- =====================================
    -- REJECTION INFORMATION (Backend Only)
    -- =====================================
    rejection_reason TEXT NULL COMMENT 'Reason for rejection if LC rejected',
    rejected_at TIMESTAMP NULL COMMENT 'When LC was rejected',
    rejected_by VARCHAR(255) NULL COMMENT 'Who rejected the LC',

    -- =====================================
    -- SHIPMENT INFORMATION (Backend Only)
    -- =====================================
    shipment_data JSON NULL COMMENT 'Shipment details when goods shipped
    Structure:
    {
        "shipment_id": 123,
        "shipping_date": "2025-02-01",
        "carrier": "Maersk Line",
        "vessel_name": "MSC Preziosa",
        "voyage_number": "V123",
        "bill_of_lading_no": "BL-2025-001",
        "port_of_loading": "Shanghai",
        "port_of_discharge": "Los Angeles",
        "estimated_arrival": "2025-02-15"
    }',

    -- =====================================
    -- DOCUMENT TRACKING (Backend Only)
    -- =====================================
    submitted_documents JSON NULL COMMENT 'Documents submitted by exporter
    Structure:
    [
        {
            "document_type": "commercial_invoice",
            "document_number": "INV-2025-001",
            "issue_date": "2025-02-01",
            "status": "verified",
            "notes": "In order"
        },
        {
            "document_type": "bill_of_lading",
            "document_number": "BL-2025-001",
            "issue_date": "2025-02-01",
            "status": "discrepancy",
            "notes": "Date mismatch"
        }
    ]',

    -- =====================================
    -- AUDIT FIELDS
    -- =====================================
    created_by VARCHAR(255) NULL COMMENT 'User who created the LC',
    updated_by VARCHAR(255) NULL COMMENT 'User who last updated the LC',
    approved_by VARCHAR(255) NULL COMMENT 'User who approved the LC',

    -- =====================================
    -- TIMESTAMPS
    -- =====================================
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

    -- =====================================
    -- FOREIGN KEY CONSTRAINTS
    -- =====================================
    CONSTRAINT fk_master_lc_contract FOREIGN KEY (contract_id)
        REFERENCES contracts(id) ON DELETE SET NULL,
    CONSTRAINT fk_master_lc_order FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_master_lc_issuing_bank FOREIGN KEY (issuing_bank_id)
        REFERENCES banks(id) ON DELETE SET NULL,
    CONSTRAINT fk_master_lc_advising_bank FOREIGN KEY (advising_bank_id)
        REFERENCES banks(id) ON DELETE SET NULL,

    -- =====================================
    -- INDEXES FOR PERFORMANCE
    -- =====================================
    INDEX idx_lc_number (lc_number),
    INDEX idx_lc_status (lc_status),
    INDEX idx_issue_date (issue_date),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_issuing_bank (issuing_bank_id),
    INDEX idx_advising_bank (advising_bank_id),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    FULLTEXT INDEX ft_buyer_info (buyer_info)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. banks Table

```sql
CREATE TABLE banks (
    -- =====================================
    -- PRIMARY KEY
    -- =====================================
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    -- =====================================
    -- BANK INFORMATION
    -- =====================================
    name VARCHAR(255) NOT NULL COMMENT 'Bank name',
    swift_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'SWIFT/BIC code',
    address TEXT NULL COMMENT 'Bank address',
    country VARCHAR(100) NULL COMMENT 'Country',
    branch VARCHAR(255) NULL COMMENT 'Branch name',

    -- =====================================
    -- CONTACT INFORMATION
    -- =====================================
    contact_person VARCHAR(255) NULL COMMENT 'Contact person name',
    phone VARCHAR(50) NULL COMMENT 'Phone number',
    email VARCHAR(255) NULL COMMENT 'Email address',

    -- =====================================
    -- STATUS
    -- =====================================
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Bank status',

    -- =====================================
    -- TIMESTAMPS
    -- =====================================
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- =====================================
    -- INDEXES
    -- =====================================
    INDEX idx_swift_code (swift_code),
    INDEX idx_status (status),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. lc_timelines Table

```sql
CREATE TABLE lc_timelines (
    -- =====================================
    -- PRIMARY KEY
    -- =====================================
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    -- =====================================
    -- FOREIGN KEY
    -- =====================================
    master_lc_id BIGINT UNSIGNED NOT NULL COMMENT 'Link to master_lcs table',

    -- =====================================
    -- TIMELINE ENTRY
    -- =====================================
    action VARCHAR(100) NOT NULL COMMENT 'Action performed (e.g., lc_issued, lc_applied)',
    description TEXT NULL COMMENT 'Human-readable description of action',

    -- =====================================
    -- ACTOR INFORMATION
    -- =====================================
    performed_by VARCHAR(255) NULL COMMENT 'User who performed the action',
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When action was performed',

    -- =====================================
    -- STATE TRANSITION
    -- =====================================
    previous_status VARCHAR(50) NULL COMMENT 'LC status before this action',
    new_status VARCHAR(50) NOT NULL COMMENT 'LC status after this action',

    -- =====================================
    -- ADDITIONAL DATA
    -- =====================================
    metadata JSON NULL COMMENT 'Additional data related to this action
    Example:
    {
        "issuing_bank_id": 1,
        "issuing_bank_reference_no": "HSBC-LC-2025-001",
        "remarks": "LC issued as per application",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0..."
    }',

    -- =====================================
    -- TIMESTAMPS
    -- =====================================
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- =====================================
    -- FOREIGN KEY CONSTRAINTS
    -- =====================================
    CONSTRAINT fk_timeline_master_lc FOREIGN KEY (master_lc_id)
        REFERENCES master_lcs(id) ON DELETE CASCADE,

    -- =====================================
    -- INDEXES
    -- =====================================
    INDEX idx_master_lc (master_lc_id),
    INDEX idx_action (action),
    INDEX idx_performed_at (performed_at),
    INDEX idx_performed_by (performed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Laravel Model Definitions

### MasterLC Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\LCStatus;

class MasterLC extends Model
{
    use SoftDeletes;

    protected $table = 'master_lcs';

    protected $fillable = [
        // Basic Info
        'contract_id',
        'order_id',
        'lc_number',
        'lc_number_mode',
        'issue_date',
        'expiry_date',

        // Buyer & Beneficiary
        'buyer_info',
        'beneficiary_info',

        // Amount
        'amount',
        'currency',
        'exchange_rate',
        'converted_amount',

        // Documents & Terms
        'required_documents',
        'terms_and_conditions',
        'attachments',

        // Issuing Bank
        'issuing_bank_id',
        'issuing_bank_reference_no',
        'issuing_bank_issue_date',

        // Advising Bank
        'advising_bank_id',
        'advising_bank_verification_status',
        'advising_bank_verified_at',

        // Workflow Timestamps
        'applied_at',
        'issued_at',
        'goods_shipped_at',
        'documents_received_at',
        'documents_forwarded_at',
        'documents_verified_at',
        'activated_at',

        // Status & Rejection
        'lc_status',
        'rejection_reason',
        'rejected_at',
        'rejected_by',

        // Shipment & Documents
        'shipment_data',
        'submitted_documents',

        // Audit
        'created_by',
        'updated_by',
        'approved_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'buyer_info' => 'array',
        'beneficiary_info' => 'array',
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'converted_amount' => 'decimal:2',
        'required_documents' => 'array',
        'attachments' => 'array',
        'issuing_bank_issue_date' => 'date',
        'advising_bank_verified_at' => 'datetime',
        'applied_at' => 'datetime',
        'issued_at' => 'datetime',
        'goods_shipped_at' => 'datetime',
        'documents_received_at' => 'datetime',
        'documents_forwarded_at' => 'datetime',
        'documents_verified_at' => 'datetime',
        'activated_at' => 'datetime',
        'rejected_at' => 'datetime',
        'lc_status' => LCStatus::class,
        'shipment_data' => 'array',
        'submitted_documents' => 'array',
    ];

    // =====================================
    // RELATIONSHIPS
    // =====================================

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function issuingBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'issuing_bank_id');
    }

    public function advisingBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'advising_bank_id');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(LCTimeline::class, 'master_lc_id');
    }

    // =====================================
    // WORKFLOW PERMISSION CHECKS
    // =====================================

    public function canApply(): bool
    {
        return $this->lc_status === LCStatus::DRAFT;
    }

    public function canIssue(): bool
    {
        return $this->lc_status === LCStatus::APPLIED;
    }

    public function canAdvise(): bool
    {
        return $this->lc_status === LCStatus::ISSUED_BY_ISSUING_BANK;
    }

    public function canShipGoods(): bool
    {
        return $this->lc_status === LCStatus::VERIFIED_BY_ADVISING_BANK;
    }

    public function canReceiveDocuments(): bool
    {
        return $this->lc_status === LCStatus::GOODS_SHIPPED;
    }

    public function canForwardDocuments(): bool
    {
        return $this->lc_status === LCStatus::DOCUMENTS_RECEIVED;
    }

    public function canVerifyDocuments(): bool
    {
        return $this->lc_status === LCStatus::DOCUMENTS_FORWARDED;
    }

    public function canActivate(): bool
    {
        return $this->lc_status === LCStatus::DOCUMENTS_VERIFIED;
    }

    public function canReject(): bool
    {
        return !$this->isTerminal();
    }

    // =====================================
    // STATUS CHECKS
    // =====================================

    public function isDraft(): bool
    {
        return $this->lc_status === LCStatus::DRAFT;
    }

    public function isApplied(): bool
    {
        return $this->lc_status === LCStatus::APPLIED;
    }

    public function isIssued(): bool
    {
        return $this->lc_status === LCStatus::ISSUED_BY_ISSUING_BANK;
    }

    public function isVerified(): bool
    {
        return $this->lc_status === LCStatus::VERIFIED_BY_ADVISING_BANK;
    }

    public function isActive(): bool
    {
        return $this->lc_status === LCStatus::ACTIVE;
    }

    public function isExpired(): bool
    {
        return $this->lc_status === LCStatus::EXPIRED
            || ($this->expiry_date && $this->expiry_date->isPast());
    }

    public function isRejected(): bool
    {
        return $this->lc_status === LCStatus::REJECTED;
    }

    public function isTerminal(): bool
    {
        return $this->lc_status->isTerminal();
    }

    // =====================================
    // HELPER METHODS
    // =====================================

    public function getStatusLabel(): string
    {
        return $this->lc_status->label();
    }

    public function getStatusColor(): string
    {
        return $this->lc_status->color();
    }

    public function getAllowedTransitions(): array
    {
        return $this->lc_status->allowedTransitions();
    }

    public function getNextAction(): ?string
    {
        return match($this->lc_status) {
            LCStatus::DRAFT => 'apply_for_lc',
            LCStatus::APPLIED => 'issue_lc',
            LCStatus::ISSUED_BY_ISSUING_BANK => 'advise_lc',
            LCStatus::VERIFIED_BY_ADVISING_BANK => 'ship_goods',
            LCStatus::GOODS_SHIPPED => 'receive_documents',
            LCStatus::DOCUMENTS_RECEIVED => 'forward_documents',
            LCStatus::DOCUMENTS_FORWARDED => 'verify_documents',
            LCStatus::DOCUMENTS_VERIFIED => 'activate_lc',
            default => null,
        };
    }

    // =====================================
    // SCOPES
    // =====================================

    public function scopeByStatus($query, $status)
    {
        return $query->where('lc_status', $status);
    }

    public function scopeActive($query)
    {
        return $query->where('lc_status', LCStatus::ACTIVE);
    }

    public function scopeExpired($query)
    {
        return $query->where(function($q) {
            $q->where('lc_status', LCStatus::EXPIRED)
              ->orWhere('expiry_date', '<', now());
        });
    }

    public function scopeRejected($query)
    {
        return $query->where('lc_status', LCStatus::REJECTED);
    }
}
```

### Bank Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bank extends Model
{
    protected $table = 'banks';

    protected $fillable = [
        'name',
        'swift_code',
        'address',
        'country',
        'branch',
        'contact_person',
        'phone',
        'email',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // =====================================
    // RELATIONSHIPS
    // =====================================

    public function issuingMasterLCs(): HasMany
    {
        return $this->hasMany(MasterLC::class, 'issuing_bank_id');
    }

    public function advisingMasterLCs(): HasMany
    {
        return $this->hasMany(MasterLC::class, 'advising_bank_id');
    }

    // =====================================
    // SCOPES
    // =====================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // =====================================
    // HELPER METHODS
    // =====================================

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
```

### LCTimeline Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LCTimeline extends Model
{
    protected $table = 'lc_timelines';

    public $timestamps = false; // Only created_at

    protected $fillable = [
        'master_lc_id',
        'action',
        'description',
        'performed_by',
        'performed_at',
        'previous_status',
        'new_status',
        'metadata',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // =====================================
    // RELATIONSHIPS
    // =====================================

    public function masterLC(): BelongsTo
    {
        return $this->belongsTo(MasterLC::class, 'master_lc_id');
    }

    // =====================================
    // HELPER METHODS
    // =====================================

    public function getActionLabel(): string
    {
        return match($this->action) {
            'lc_created' => 'LC Created',
            'lc_updated' => 'LC Updated',
            'lc_applied' => 'Application Submitted',
            'lc_issued' => 'LC Issued',
            'lc_advised' => 'LC Advised/Verified',
            'goods_shipped' => 'Goods Shipped',
            'documents_received' => 'Documents Received',
            'documents_forwarded' => 'Documents Forwarded',
            'documents_verified' => 'Documents Verified',
            'lc_activated' => 'LC Activated',
            'lc_rejected' => 'LC Rejected',
            'lc_expired' => 'LC Expired',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }
}
```

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   contracts     │
│                 │
│ - id            │
│ - contract_no   │
│ - ...           │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐          ┌─────────────────┐
│   master_lcs    │  N:1     │     banks       │
│                 ├──────────┤                 │
│ - id            │ issuing  │ - id            │
│ - lc_number     │          │ - name          │
│ - lc_status     │          │ - swift_code    │
│ - issue_date    │          │ - address       │
│ - expiry_date   │          │ - status        │
│ - amount        │  N:1     └─────────────────┘
│ - currency      ├──────────┐
│ - buyer_info    │ advising │
│ - beneficiary_  │          │
│   info          │          │
│ - issuing_      │          │
│   bank_id       │          │
│ - advising_     │          │
│   bank_id       │          │
│ - ...           │          │
└────────┬────────┘          │
         │                   │
         │ 1:N               │
         │                   │
┌────────▼────────┐          │
│  lc_timelines   │          │
│                 │          │
│ - id            │          │
│ - master_lc_id  │          │
│ - action        │          │
│ - performed_by  │          │
│ - previous_     │          │
│   status        │          │
│ - new_status    │          │
│ - performed_at  │          │
│ - metadata      │          │
└─────────────────┘          │
                             │
┌────────────────┐           │
│    orders      │           │
│                │           │
│ - id           │           │
│ - order_no     │           │
│ - ...          │           │
└────────┬───────┘           │
         │                   │
         │ 1:N               │
         └───────────────────┘
```

---

## Migration Files

### Create master_lcs Table

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_lcs', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('set null');
            $table->foreignId('order_id')->nullable()->constrained('orders')->onDelete('set null');

            // Basic Info
            $table->string('lc_number', 100)->unique();
            $table->enum('lc_number_mode', ['auto', 'manual'])->default('auto');
            $table->date('issue_date');
            $table->date('expiry_date');

            // Buyer & Beneficiary (JSON)
            $table->json('buyer_info');
            $table->json('beneficiary_info');

            // Amount
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('exchange_rate', 10, 4)->nullable();
            $table->decimal('converted_amount', 15, 2)->nullable();

            // Documents & Terms
            $table->json('required_documents')->nullable();
            $table->text('terms_and_conditions')->nullable();
            $table->json('attachments')->nullable();

            // Issuing Bank
            $table->foreignId('issuing_bank_id')->nullable()->constrained('banks')->onDelete('set null');
            $table->string('issuing_bank_reference_no', 100)->nullable();
            $table->date('issuing_bank_issue_date')->nullable();

            // Advising Bank
            $table->foreignId('advising_bank_id')->nullable()->constrained('banks')->onDelete('set null');
            $table->enum('advising_bank_verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('advising_bank_verified_at')->nullable();

            // Workflow Timestamps
            $table->timestamp('applied_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('goods_shipped_at')->nullable();
            $table->timestamp('documents_received_at')->nullable();
            $table->timestamp('documents_forwarded_at')->nullable();
            $table->timestamp('documents_verified_at')->nullable();
            $table->timestamp('activated_at')->nullable();

            // Status
            $table->enum('lc_status', [
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
            ])->default('draft');

            // Rejection
            $table->text('rejection_reason')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->string('rejected_by')->nullable();

            // Shipment & Documents
            $table->json('shipment_data')->nullable();
            $table->json('submitted_documents')->nullable();

            // Audit
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('approved_by')->nullable();

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('lc_number');
            $table->index('lc_status');
            $table->index('issue_date');
            $table->index('expiry_date');
            $table->index('issuing_bank_id');
            $table->index('advising_bank_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_lcs');
    }
};
```

---

**End of Data Model Specification**
