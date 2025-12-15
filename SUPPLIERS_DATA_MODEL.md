# Supplier Module - Data Model Specification v1.0

## 1. Database Schema

### 1.1 Suppliers Table

**Table Name:** `suppliers`

```sql
CREATE TABLE suppliers (
    -- Primary Key
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT 'Unique identifier',

    -- Core Fields
    name VARCHAR(255) NOT NULL COMMENT 'Supplier company name',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique supplier code (SUP0001, SUP0002, etc.)',

    -- Contact Information
    contact_person VARCHAR(255) NULL COMMENT 'Primary contact person name',
    email VARCHAR(255) NULL UNIQUE COMMENT 'Contact email address',
    phone VARCHAR(50) NULL COMMENT 'Contact phone number',

    -- Location
    country VARCHAR(100) NULL COMMENT 'Country of operation',
    address TEXT NULL COMMENT 'Full postal address',

    -- Status
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT 'Supplier operational status',

    -- Audit Fields
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

    -- Indexes
    INDEX idx_suppliers_code (code) COMMENT 'Fast lookup by code',
    INDEX idx_suppliers_status (status) COMMENT 'Filter by status',
    INDEX idx_suppliers_country (country) COMMENT 'Filter by country',
    INDEX idx_suppliers_email (email) COMMENT 'Fast lookup by email',
    INDEX idx_suppliers_name (name) COMMENT 'Search by name',
    FULLTEXT INDEX ft_suppliers_search (name, code, country) COMMENT 'Full-text search'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Supplier/Exporter master data';
```

**Field Specifications:**

| Field          | Type            | Null | Default           | Description   | Constraints                |
| -------------- | --------------- | ---- | ----------------- | ------------- | -------------------------- |
| id             | BIGINT UNSIGNED | NO   | AUTO_INCREMENT    | Primary key   | PRIMARY KEY                |
| name           | VARCHAR(255)    | NO   | -                 | Supplier name | NOT NULL, Length: 2-255    |
| code           | VARCHAR(50)     | NO   | -                 | Supplier code | UNIQUE, Pattern: SUP\d{4}  |
| contact_person | VARCHAR(255)    | YES  | NULL              | Contact name  | Length: 0-255              |
| email          | VARCHAR(255)    | YES  | NULL              | Email address | UNIQUE, Valid email format |
| phone          | VARCHAR(50)     | YES  | NULL              | Phone number  | Length: 0-50               |
| country        | VARCHAR(100)    | YES  | NULL              | Country name  | ISO country                |
| address        | TEXT            | YES  | NULL              | Full address  | Length: 0-1000             |
| status         | ENUM            | NO   | 'active'          | Status        | active OR inactive         |
| created_at     | TIMESTAMP       | YES  | CURRENT_TIMESTAMP | Created time  | Auto-managed               |
| updated_at     | TIMESTAMP       | YES  | CURRENT_TIMESTAMP | Updated time  | Auto-managed               |

### 1.2 B2B LCs Table Updates

**Table Name:** `b2b_lcs`

**New Column:**

```sql
ALTER TABLE b2b_lcs
ADD COLUMN supplier_id BIGINT UNSIGNED NULL
AFTER id
COMMENT 'Foreign key to suppliers table';

-- Add index for foreign key
ALTER TABLE b2b_lcs
ADD INDEX idx_b2b_lcs_supplier_id (supplier_id);
```

**Foreign Key Constraint (Applied in separate migration):**

```sql
-- Add foreign key constraint
ALTER TABLE b2b_lcs
ADD CONSTRAINT fk_b2b_lcs_supplier_id
FOREIGN KEY (supplier_id)
REFERENCES suppliers(id)
ON DELETE RESTRICT
ON UPDATE CASCADE
COMMENT 'Link B2B LC to supplier';
```

**Constraint Explanation:**

- `ON DELETE RESTRICT`: Prevents deletion of suppliers with associated B2B LCs
- `ON UPDATE CASCADE`: Automatically updates supplier_id if supplier's ID changes (rare scenario)

---

## 2. Entity Relationships

### 2.1 Entity Relationship Diagram

```
┌────────────────────┐
│     Suppliers      │
├────────────────────┤
│ PK  id             │
│     name           │
│ UK  code           │
│     contact_person │
│ UK  email          │
│     phone          │
│     country        │
│     address        │
│     status         │
│     created_at     │
│     updated_at     │
└─────────┬──────────┘
          │
          │ 1
          │
          │ has many
          │
          │ *
          │
┌─────────▼──────────┐
│      B2B LCs       │
├────────────────────┤
│ PK  id             │
│ FK  supplier_id    │◄─── New field
│ FK  buyer_id       │
│     lc_number      │
│     ...            │
└────────────────────┘
```

### 2.2 Relationships

**1. Supplier → B2B LCs (One-to-Many)**

- **Relationship Type:** One Supplier has many B2B LCs
- **Foreign Key:** `b2b_lcs.supplier_id` → `suppliers.id`
- **Cascade Behavior:**
  - Delete: RESTRICT (cannot delete supplier with associated B2B LCs)
  - Update: CASCADE (updates propagate automatically)
- **Eloquent:**
  ```php
  // In Supplier model
  public function b2bLcs()
  {
      return $this->hasMany(B2BLC::class, 'supplier_id');
  }
  ```

**2. B2B LC → Supplier (Many-to-One)**

- **Relationship Type:** Many B2B LCs belong to one Supplier
- **Foreign Key:** `b2b_lcs.supplier_id`
- **Nullable:** Yes (legacy records may not have supplier)
- **Eloquent:**
  ```php
  // In B2BLC model
  public function supplier()
  {
      return $this->belongsTo(Supplier::class, 'supplier_id');
  }
  ```

---

## 3. Data Types & Formats

### 3.1 Supplier Code Format

**Pattern:** `SUP` + 4-digit sequential number

**Examples:**

- SUP0001
- SUP0002
- SUP0099
- SUP0100
- SUP9999

**Regex Validation:**

```regex
^SUP\d{4}$
```

**Generation Logic:**

```php
public function generateCode(): string
{
    $lastSupplier = Supplier::orderBy('code', 'desc')->first();

    if (!$lastSupplier) {
        return 'SUP0001';
    }

    preg_match('/SUP(\d+)/', $lastSupplier->code, $matches);
    $nextNumber = (int)($matches[1] ?? 0) + 1;

    return 'SUP' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
}
```

### 3.2 Status Enum Values

**Allowed Values:**

- `active` - Supplier is operational and can be selected for new B2B LCs
- `inactive` - Supplier is not operational, existing B2B LCs remain valid but no new associations allowed

**Database Representation:**

```sql
status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
```

**PHP Enum (Laravel 11+):**

```php
namespace App\Enums;

enum SupplierStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
        };
    }

    public function badge(): array
    {
        return match($this) {
            self::ACTIVE => [
                'class' => 'bg-green-100 text-green-800',
                'label' => 'Active'
            ],
            self::INACTIVE => [
                'class' => 'bg-gray-100 text-gray-800',
                'label' => 'Inactive'
            ],
        };
    }
}
```

### 3.3 Email Format

**Validation:** Standard RFC 5322 email format

**Examples:**

- ✅ `john@example.com`
- ✅ `john.doe@company.co.uk`
- ✅ `contact+sales@supplier.com`
- ❌ `invalid@`
- ❌ `@invalid.com`
- ❌ `no-at-sign.com`

**Laravel Validation:**

```php
'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email'
```

### 3.4 Phone Number Format

**Format:** Free-form text (international variations supported)

**Examples:**

- `+1-555-0123`
- `+44 20 1234 5678`
- `+86 10 1234 5678`
- `(555) 123-4567`

**Validation:** Length only (0-50 characters), no format enforcement

---

## 4. Indexes & Performance

### 4.1 Index Strategy

**Primary Key Index:**

```sql
PRIMARY KEY (id)
```

- **Purpose:** Unique row identification
- **Type:** Clustered index (InnoDB)
- **Usage:** Primary key lookups, foreign key references

**Unique Indexes:**

```sql
UNIQUE INDEX uk_suppliers_code (code)
UNIQUE INDEX uk_suppliers_email (email)
```

- **Purpose:** Enforce uniqueness constraints
- **Type:** B-Tree
- **Usage:** Prevent duplicate codes/emails, fast exact lookups

**Regular Indexes:**

```sql
INDEX idx_suppliers_status (status)
INDEX idx_suppliers_country (country)
INDEX idx_suppliers_name (name)
```

- **Purpose:** Optimize filtering and searching
- **Type:** B-Tree
- **Usage:** WHERE clauses, ORDER BY

**Full-Text Index:**

```sql
FULLTEXT INDEX ft_suppliers_search (name, code, country)
```

- **Purpose:** Advanced search across multiple text fields
- **Type:** Full-text
- **Usage:** `MATCH(name, code, country) AGAINST('search term')`

### 4.2 Query Optimization Examples

**List Active Suppliers:**

```sql
SELECT * FROM suppliers
WHERE status = 'active'
ORDER BY name ASC
LIMIT 10 OFFSET 0;

-- Uses: idx_suppliers_status + idx_suppliers_name
```

**Search Suppliers:**

```sql
SELECT * FROM suppliers
WHERE (
    name LIKE '%ABC%' OR
    code LIKE '%ABC%' OR
    country LIKE '%ABC%'
)
AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- Uses: idx_suppliers_status + table scan for LIKE
-- Consider full-text search for better performance
```

**Full-Text Search (Faster):**

```sql
SELECT * FROM suppliers
WHERE MATCH(name, code, country) AGAINST('ABC' IN BOOLEAN MODE)
AND status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- Uses: ft_suppliers_search + idx_suppliers_status
```

---

## 5. Data Constraints & Validation

### 5.1 Database Constraints

| Field  | Constraint Type | Rule                           | Error Handling              |
| ------ | --------------- | ------------------------------ | --------------------------- |
| id     | PRIMARY KEY     | Auto-increment, unique         | Managed by DB               |
| name   | NOT NULL        | Required                       | Reject INSERT/UPDATE        |
| code   | UNIQUE          | No duplicates                  | Reject with duplicate error |
| email  | UNIQUE          | No duplicates                  | Reject with duplicate error |
| status | ENUM            | Must be 'active' or 'inactive' | Reject invalid values       |

### 5.2 Application-Level Validation

**Laravel Form Request Rules:**

```php
// StoreSupplierRequest
public function rules(): array
{
    return [
        'name' => 'required|string|min:2|max:255',
        'code' => 'required|string|max:50|regex:/^SUP\d{4}$/|unique:suppliers,code',
        'contact_person' => 'nullable|string|max:255',
        'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email',
        'phone' => 'nullable|string|max:50',
        'country' => 'nullable|string|max:100',
        'address' => 'nullable|string|max:1000',
        'status' => 'required|in:active,inactive',
    ];
}

// UpdateSupplierRequest
public function rules(): array
{
    $supplierId = $this->route('supplier')->id;

    return [
        'name' => 'required|string|min:2|max:255',
        'code' => 'required|string|max:50|regex:/^SUP\d{4}$/|unique:suppliers,code,' . $supplierId,
        'contact_person' => 'nullable|string|max:255',
        'email' => 'nullable|email:rfc,dns|max:255|unique:suppliers,email,' . $supplierId,
        'phone' => 'nullable|string|max:50',
        'country' => 'nullable|string|max:100',
        'address' => 'nullable|string|max:1000',
        'status' => 'required|in:active,inactive',
    ];
}
```

**Custom Validation Messages:**

```php
public function messages(): array
{
    return [
        'name.required' => 'Supplier name is required',
        'name.min' => 'Supplier name must be at least 2 characters',
        'code.required' => 'Supplier code is required',
        'code.regex' => 'Supplier code must match pattern SUP0001',
        'code.unique' => 'This supplier code already exists',
        'email.email' => 'Please enter a valid email address',
        'email.unique' => 'This email is already registered',
        'status.in' => 'Status must be either active or inactive',
    ];
}
```

### 5.3 Business Rules

**BR-SUP-001: Code Uniqueness**

- Every supplier must have a unique code
- Code cannot be changed to an existing code
- Code format must be SUP + 4 digits

**BR-SUP-002: Email Uniqueness**

- If email is provided, it must be unique
- NULL emails are allowed (multiple suppliers can have NULL email)
- Email format must be valid RFC 5322

**BR-SUP-003: Deletion Restrictions**

- Cannot delete supplier if associated with any B2B LC
- Must deactivate instead of delete
- Return 409 Conflict with appropriate message

**BR-SUP-004: Status Transitions**

- Can change from active → inactive anytime
- Can change from inactive → active anytime
- No restrictions on status changes

**BR-SUP-005: Required Fields**

- name: Always required
- code: Always required
- status: Defaults to 'active' if not provided
- All other fields: Optional

---

## 6. Data Migration

### 6.1 Initial Migration (suppliers table)

**File:** `database/migrations/2025_01_15_100000_create_suppliers_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->string('contact_person', 255)->nullable();
            $table->string('email', 255)->unique()->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('country');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
```

### 6.2 B2B LC Integration Migration (Phase 1 - Add Column)

**File:** `database/migrations/2025_01_22_100000_add_supplier_id_to_b2b_lcs_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('b2b_lcs', function (Blueprint $table) {
            // Add nullable supplier_id column
            $table->unsignedBigInteger('supplier_id')->nullable()->after('id');

            // Add index for better query performance
            $table->index('supplier_id');
        });
    }

    public function down(): void
    {
        Schema::table('b2b_lcs', function (Blueprint $table) {
            $table->dropIndex(['supplier_id']);
            $table->dropColumn('supplier_id');
        });
    }
};
```

### 6.3 B2B LC Integration Migration (Phase 2 - Add Foreign Key)

**File:** `database/migrations/2025_01_29_100000_add_supplier_foreign_key_to_b2b_lcs_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('b2b_lcs', function (Blueprint $table) {
            // Add foreign key constraint
            $table->foreign('supplier_id')
                  ->references('id')
                  ->on('suppliers')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('b2b_lcs', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
        });
    }
};
```

**Migration Strategy:**

1. **Week 1:** Create suppliers table, deploy to production
2. **Week 2:** Add supplier_id column (nullable), deploy
3. **Week 3:** Backfill data if needed (manual or seeder)
4. **Week 4:** Add foreign key constraint, deploy

---

## 7. Seed Data

### 7.1 Supplier Seeder

**File:** `database/seeders/SupplierSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'ABC Manufacturing Corp',
                'code' => 'SUP0001',
                'contact_person' => 'John Smith',
                'email' => 'john@abcmfg.com',
                'phone' => '+1-555-0101',
                'country' => 'USA',
                'address' => '123 Industrial Blvd, New York, NY 10001',
                'status' => 'active',
            ],
            [
                'name' => 'XYZ Exports Ltd',
                'code' => 'SUP0002',
                'contact_person' => 'Jane Doe',
                'email' => 'jane@xyzexports.com',
                'phone' => '+44-20-1234-5678',
                'country' => 'United Kingdom',
                'address' => '456 Export Lane, London, E1 6AN',
                'status' => 'active',
            ],
            [
                'name' => 'Global Trading Co',
                'code' => 'SUP0003',
                'contact_person' => 'Li Wei',
                'email' => 'liwei@globaltrading.cn',
                'phone' => '+86-10-1234-5678',
                'country' => 'China',
                'address' => '789 Trade Street, Beijing, 100000',
                'status' => 'active',
            ],
            [
                'name' => 'European Suppliers GmbH',
                'code' => 'SUP0004',
                'contact_person' => 'Hans Mueller',
                'email' => 'hans@eurosuppliers.de',
                'phone' => '+49-30-1234-5678',
                'country' => 'Germany',
                'address' => 'Industriestrasse 10, Berlin, 10115',
                'status' => 'active',
            ],
            [
                'name' => 'Inactive Supplier Inc',
                'code' => 'SUP0005',
                'contact_person' => 'Bob Johnson',
                'email' => 'bob@inactive.com',
                'phone' => '+1-555-0199',
                'country' => 'USA',
                'address' => '999 Closed Ave, Boston, MA 02101',
                'status' => 'inactive',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
```

### 7.2 Factory Definition

**File:** `database/factories/SupplierFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

class SupplierFactory extends Factory
{
    protected $model = Supplier::class;

    private static $codeCounter = 0;

    public function definition(): array
    {
        self::$codeCounter++;

        return [
            'name' => $this->faker->company(),
            'code' => 'SUP' . str_pad(self::$codeCounter, 4, '0', STR_PAD_LEFT),
            'contact_person' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'country' => $this->faker->country(),
            'address' => $this->faker->address(),
            'status' => $this->faker->randomElement(['active', 'active', 'active', 'inactive']), // 75% active
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
```

---

## 8. Model Specifications

### 8.1 Supplier Model

**File:** `app/Models/Supplier.php`

```php
<?php

namespace App\Models;

use App\Enums\SupplierStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'contact_person',
        'email',
        'phone',
        'country',
        'address',
        'status',
    ];

    protected $casts = [
        'status' => SupplierStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [];

    protected $appends = ['status_badge'];

    // Relationships
    public function b2bLcs()
    {
        return $this->hasMany(B2BLC::class, 'supplier_id');
    }

    // Query Scopes
    public function scopeActive($query)
    {
        return $query->where('status', SupplierStatus::ACTIVE);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', SupplierStatus::INACTIVE);
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('country', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    public function scopeByStatus($query, $status)
    {
        if (empty($status) || $status === 'all') {
            return $query;
        }

        return $query->where('status', $status);
    }

    // Accessors
    public function getStatusBadgeAttribute(): array
    {
        return $this->status->badge();
    }

    // Methods
    public function isActive(): bool
    {
        return $this->status === SupplierStatus::ACTIVE;
    }

    public function canBeDeleted(): bool
    {
        return $this->b2bLcs()->count() === 0;
    }

    public function deactivate(): bool
    {
        $this->status = SupplierStatus::INACTIVE;
        return $this->save();
    }

    public function activate(): bool
    {
        $this->status = SupplierStatus::ACTIVE;
        return $this->save();
    }
}
```

### 8.2 B2BLC Model Updates

**File:** `app/Models/B2BLC.php` (Updates)

```php
// Add to $fillable array
protected $fillable = [
    // ... existing fields
    'supplier_id',
];

// Add to $with array for eager loading
protected $with = ['supplier', 'buyer'];

// Add relationship method
public function supplier()
{
    return $this->belongsTo(Supplier::class, 'supplier_id');
}
```

---

## 9. Data Access Patterns

### 9.1 Common Queries

**Get All Active Suppliers:**

```php
$suppliers = Supplier::active()
    ->orderBy('name')
    ->get();
```

**Search Suppliers:**

```php
$suppliers = Supplier::search($searchTerm)
    ->byStatus($status)
    ->orderBy('created_at', 'desc')
    ->paginate(10);
```

**Get Supplier with B2B LCs:**

```php
$supplier = Supplier::with('b2bLcs')
    ->findOrFail($id);
```

**Check if Supplier Can Be Deleted:**

```php
$supplier = Supplier::findOrFail($id);
if (!$supplier->canBeDeleted()) {
    throw new \Exception('Cannot delete supplier with associated B2B LCs');
}
```

**Get B2B LC with Supplier:**

```php
$b2bLc = B2BLC::with('supplier', 'buyer')
    ->findOrFail($id);
```

### 9.2 Bulk Operations

**Deactivate Multiple Suppliers:**

```php
Supplier::whereIn('id', $ids)->update(['status' => 'inactive']);
```

**Get Supplier Count by Country:**

```php
$counts = Supplier::select('country', DB::raw('count(*) as total'))
    ->groupBy('country')
    ->orderBy('total', 'desc')
    ->get();
```

---

## 10. Data Archival & Retention

### 10.1 Soft Delete Consideration

**Decision:** Not implementing soft deletes initially

**Rationale:**

- Foreign key constraint prevents accidental deletion
- Inactive status provides sufficient "archival"
- Simplifies queries and maintenance

**Future Enhancement:**
If soft deletes needed later:

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;
}

// Migration
$table->softDeletes();
```

### 10.2 Data Retention Policy

- **Active Suppliers:** Retained indefinitely
- **Inactive Suppliers:** Retained indefinitely (historical records)
- **Audit Logs:** Created_at and updated_at timestamps permanent
- **Deletion:** Only allowed if no B2B LC associations exist

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Status:** Ready for Implementation
