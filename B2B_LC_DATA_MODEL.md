# B2B LC Module - Data Model Specification

**Project:** LC Management System  
**Module:** B2B LC Management  
**Version:** 1.0.0  
**Date:** December 10, 2025  
**Database:** MySQL/SQLite

---

## 📊 Database Schema

### Table: `b2b_lcs`

**Purpose:** Stores Back-to-Back Letter of Credit records with calculations and relationships to contracts, orders, and costing details.

---

## 🗂️ Table Structure

```sql
CREATE TABLE `b2b_lcs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `costing_detail_id` bigint(20) NOT NULL COMMENT 'ID from orders.cost_details JSON array',
  `pi_number` varchar(255) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `order_qty` int(11) NOT NULL,
  `fob_value` decimal(15,2) NOT NULL,
  `order_value` decimal(15,2) NOT NULL,
  `post_pi_value` decimal(15,2) NOT NULL,
  `b2b_percent` decimal(5,2) NOT NULL,
  `director_command` text NULL COMMENT 'Director/management comments or commands',
  `status` enum('draft','active','completed','cancelled') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `b2b_lcs_pi_number_unique` (`pi_number`),
  KEY `b2b_lcs_contract_id_foreign` (`contract_id`),
  KEY `b2b_lcs_order_id_foreign` (`order_id`),
  KEY `b2b_lcs_supplier_index` (`supplier`),
  KEY `b2b_lcs_status_index` (`status`),
  KEY `b2b_lcs_contract_id_order_id_index` (`contract_id`,`order_id`),
  CONSTRAINT `b2b_lcs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `b2b_lcs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 Column Specifications

### Primary Key

| Column | Type            | Attributes                  | Description       |
| ------ | --------------- | --------------------------- | ----------------- |
| `id`   | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |

### Foreign Keys

| Column        | Type            | Attributes            | Description              | References     |
| ------------- | --------------- | --------------------- | ------------------------ | -------------- |
| `contract_id` | BIGINT UNSIGNED | NOT NULL, INDEXED, FK | Links to parent contract | `contracts.id` |
| `order_id`    | BIGINT UNSIGNED | NOT NULL, INDEXED, FK | Links to parent order    | `orders.id`    |

### Business Data

| Column              | Type         | Attributes                | Description                                        | Example            |
| ------------------- | ------------ | ------------------------- | -------------------------------------------------- | ------------------ |
| `costing_detail_id` | BIGINT       | NOT NULL                  | References item ID from `orders.cost_details` JSON | 1                  |
| `pi_number`         | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED | Proforma Invoice number                            | "PI-001"           |
| `supplier`          | VARCHAR(255) | NOT NULL, INDEXED         | Supplier/vendor name                               | "ABC Textiles Ltd" |

### Quantity & Value Fields

| Column          | Type          | Attributes | Description              | Example  | Formula                       |
| --------------- | ------------- | ---------- | ------------------------ | -------- | ----------------------------- |
| `order_qty`     | INTEGER       | NOT NULL   | Order quantity in pieces | 5000     | From order                    |
| `fob_value`     | DECIMAL(15,2) | NOT NULL   | FOB price per piece      | 2.50     | User input                    |
| `order_value`   | DECIMAL(15,2) | NOT NULL   | Total order value        | 12500.00 | qty × FOB                     |
| `post_pi_value` | DECIMAL(15,2) | NOT NULL   | Post-costing/PI value    | 5625.00  | From costing                  |
| `b2b_percent`   | DECIMAL(5,2)  | NOT NULL   | B2B percentage           | 45.00    | (post_pi / order_value) × 100 |

### Status & Metadata

| Column       | Type      | Attributes                         | Description          | Values                              |
| ------------ | --------- | ---------------------------------- | -------------------- | ----------------------------------- |
| `status`     | ENUM      | NOT NULL, DEFAULT 'draft', INDEXED | Current status       | draft, active, completed, cancelled |
| `created_at` | TIMESTAMP | NULLABLE                           | Record creation time | 2025-12-10 10:30:00                 |
| `updated_at` | TIMESTAMP | NULLABLE                           | Last update time     | 2025-12-10 14:45:00                 |

---

## 🔗 Relationships

### Parent Relationships (belongsTo)

```php
// B2BLC belongs to Contract
public function contract(): BelongsTo
{
    return $this->belongsTo(Contract::class);
}

// B2BLC belongs to Order
public function order(): BelongsTo
{
    return $this->belongsTo(Order::class);
}
```

### Relationship Diagram

```
┌─────────────┐
│  contracts  │
│  (parent)   │
└──────┬──────┘
       │ 1
       │
       │ n
┌──────▼──────┐
│   orders    │
│  (parent)   │
└──────┬──────┘
       │ 1
       │
       │ n
┌──────▼──────┐
│  b2b_lcs    │
│   (child)   │
└─────────────┘
```

### Cascade Behavior

- **ON DELETE CASCADE**: When contract deleted → All related B2B LCs deleted
- **ON DELETE CASCADE**: When order deleted → All related B2B LCs deleted

---

## 🔍 Indexes

### Primary Index

- `PRIMARY KEY (id)` - Unique identifier

### Unique Indexes

- `UNIQUE (pi_number)` - Ensures PI numbers are unique across system

### Foreign Key Indexes

- `INDEX (contract_id)` - Fast lookups by contract
- `INDEX (order_id)` - Fast lookups by order

### Search Indexes

- `INDEX (supplier)` - Optimizes supplier searches
- `INDEX (status)` - Optimizes status filtering

### Composite Indexes

- `INDEX (contract_id, order_id)` - Optimizes contract-order queries

---

## 📐 Data Constraints

### NOT NULL Constraints

All fields except `created_at` and `updated_at` are required.

### UNIQUE Constraints

- `pi_number` must be unique system-wide

### ENUM Constraints

- `status` must be one of: draft, active, completed, cancelled

### FOREIGN KEY Constraints

- `contract_id` must exist in `contracts` table
- `order_id` must exist in `orders` table

### Decimal Precision

- Currency fields: 15 digits total, 2 after decimal (max: 9,999,999,999,999.99)
- Percentage field: 5 digits total, 2 after decimal (max: 999.99%)

---

## 🧮 Calculated Fields

### Order Value Calculation

**Formula:**

```
order_value = order_qty × fob_value
```

**Example:**

```
order_qty: 5000
fob_value: 2.50
order_value: 5000 × 2.50 = 12500.00
```

**Implementation:**

```php
$validated['order_value'] = $validated['order_qty'] * $validated['fob_value'];
```

---

### B2B Percentage Calculation

**Formula:**

```
b2b_percent = (post_pi_value ÷ order_value) × 100
```

**Example:**

```
post_pi_value: 5625.00
order_value: 12500.00
b2b_percent: (5625 ÷ 12500) × 100 = 45.00%
```

**Implementation:**

```php
if ($validated['order_value'] > 0) {
    $validated['b2b_percent'] = ($validated['post_pi_value'] / $validated['order_value']) * 100;
} else {
    $validated['b2b_percent'] = 0.00;
}
```

---

## 📊 Sample Data

### Example Record 1

```json
{
  "id": 1,
  "contract_id": 10,
  "order_id": 25,
  "costing_detail_id": 3,
  "pi_number": "PI-2025-001",
  "supplier": "ABC Textiles Ltd",
  "order_qty": 5000,
  "fob_value": "2.50",
  "order_value": "12500.00",
  "post_pi_value": "5625.00",
  "b2b_percent": "45.00",
  "status": "active",
  "created_at": "2025-12-10 10:30:00",
  "updated_at": "2025-12-10 10:30:00"
}
```

**Calculations:**

- Order Value: 5000 × $2.50 = $12,500.00
- B2B%: ($5,625 / $12,500) × 100 = 45.00%

---

### Example Record 2

```json
{
  "id": 2,
  "contract_id": 11,
  "order_id": 28,
  "costing_detail_id": 5,
  "pi_number": "PI-2025-002",
  "supplier": "XYZ Manufacturing Co.",
  "order_qty": 10000,
  "fob_value": "1.75",
  "order_value": "17500.00",
  "post_pi_value": "7000.00",
  "b2b_percent": "40.00",
  "status": "draft",
  "created_at": "2025-12-10 14:15:00",
  "updated_at": "2025-12-10 14:15:00"
}
```

**Calculations:**

- Order Value: 10000 × $1.75 = $17,500.00
- B2B%: ($7,000 / $17,500) × 100 = 40.00%

---

## 🔐 Data Validation Rules

### Validation Rules (Laravel)

```php
[
    'contract_id' => 'required|exists:contracts,id',
    'order_id' => 'required|exists:orders,id',
    'costing_detail_id' => 'required|integer',
    'pi_number' => 'required|string|unique:b2b_lcs,pi_number|max:255',
    'supplier' => 'required|string|min:2|max:255',
    'order_qty' => 'required|integer|min:1',
    'fob_value' => 'required|numeric|min:0',
    'order_value' => 'nullable|numeric|min:0',
    'post_pi_value' => 'required|numeric|min:0',
    'b2b_percent' => 'nullable|numeric|min:0|max:100',
    'status' => 'nullable|in:draft,active,completed,cancelled',
]
```

### Business Logic Validations

- **PI Number**: Must be unique across all B2B LCs
- **Supplier**: Minimum 2 characters
- **Order Qty**: Must be at least 1
- **FOB Value**: Cannot be negative
- **Post PI Value**: Cannot be negative
- **B2B Percent**: Must be between 0 and 100

---

## 🗄️ Migration Code

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('b2b_lcs', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->foreignId('contract_id')
                  ->constrained('contracts')
                  ->onDelete('cascade');

            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->onDelete('cascade');

            $table->bigInteger('costing_detail_id')
                  ->comment('ID from orders.cost_details JSON array');

            // PI Information
            $table->string('pi_number')->unique();
            $table->string('supplier');

            // Order Information
            $table->integer('order_qty');
            $table->decimal('fob_value', 15, 2);
            $table->decimal('order_value', 15, 2);

            // Costing Information
            $table->decimal('post_pi_value', 15, 2);
            $table->decimal('b2b_percent', 5, 2);

            // Status
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])
                  ->default('draft');

            // Timestamps
            $table->timestamps();

            // Additional Indexes
            $table->index('pi_number');
            $table->index('supplier');
            $table->index('status');
            $table->index(['contract_id', 'order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2b_lcs');
    }
};
```

---

## 📈 Query Optimization

### Indexed Queries (Fast)

```sql
-- Search by PI Number (uses unique index)
SELECT * FROM b2b_lcs WHERE pi_number = 'PI-2025-001';

-- Search by Supplier (uses index)
SELECT * FROM b2b_lcs WHERE supplier LIKE 'ABC%';

-- Filter by Status (uses index)
SELECT * FROM b2b_lcs WHERE status = 'active';

-- Get by Contract and Order (uses composite index)
SELECT * FROM b2b_lcs WHERE contract_id = 10 AND order_id = 25;
```

### Eager Loading (Prevents N+1)

```php
// Load relationships in single query
$b2bLCs = B2BLC::with(['contract', 'order'])->get();

// Load specific relationship fields
$b2bLCs = B2BLC::with([
    'contract:id,contract_no',
    'order:id,order_number'
])->get();
```

---

## 🔄 Data Lifecycle

### Create Flow

1. User selects Contract → loads Orders
2. User selects Order → loads Costing Details + auto-fills Order Qty
3. User selects Costing Detail → auto-fills Post PI Value
4. User enters FOB Value → calculates Order Value
5. System calculates B2B%
6. User enters PI Number and Supplier
7. System validates and creates record

### Update Flow

1. User modifies FOB Value or Order Qty
2. System recalculates Order Value
3. System recalculates B2B%
4. User saves changes
5. System validates and updates record

### Delete Flow

1. User clicks Delete button
2. System shows confirmation dialog
3. User confirms deletion
4. System deletes record
5. Cascade deletes maintain referential integrity

---

## 📊 Status Transitions

```
┌───────┐
│ draft │ ← Initial status on create
└───┬───┘
    │
    ▼
┌────────┐
│ active │ ← When approved/confirmed
└───┬────┘
    │
    ├──→ ┌───────────┐
    │    │ completed │ ← When fully processed
    │    └───────────┘
    │
    └──→ ┌───────────┐
         │ cancelled │ ← If cancelled at any stage
         └───────────┘
```

---

## 🎯 Data Integrity

### Foreign Key Integrity

- Cannot create B2B LC with non-existent contract_id
- Cannot create B2B LC with non-existent order_id
- Deleting contract/order cascades to B2B LCs

### Unique Constraints

- PI Number must be unique
- Prevents duplicate proforma invoices

### Calculated Field Consistency

- Order Value always matches: qty × FOB
- B2B% always matches: (post_pi / order_value) × 100

---

## 📝 Notes

### Costing Detail ID

The `costing_detail_id` field references an item's ID from the `orders.cost_details` JSON array. This is not a traditional foreign key because cost_details is stored as JSON, not in a separate table.

**Example cost_details JSON structure:**

```json
[
  {
    "id": 1,
    "name": "YARN",
    "preCosting": "0.50",
    "budget": "0.55",
    "postCosting": "0.60",
    "budgetPercent": "4.40",
    "b2bPercent": "4.80",
    "status": "active"
  },
  {
    "id": 2,
    "name": "Knitting",
    "preCosting": "0.30",
    "budget": "0.32",
    "postCosting": "0.35",
    "budgetPercent": "2.56",
    "b2bPercent": "2.80",
    "status": "active"
  }
]
```

The `costing_detail_id` (e.g., 1 or 2) refers to the `id` within this JSON array.

---

**Document Status:** ✅ Complete Data Model Specification  
**Database Type:** MySQL/MariaDB/SQLite compatible  
**Next Step:** Proceed to B2B_LC_SWAGGER_SPEC.md for API documentation
