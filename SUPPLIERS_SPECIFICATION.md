# Supplier Module - Functional Specification v1.0

## 1. Executive Summary

This specification defines the complete Supplier module and its integration with the B2B-LC system. The Supplier module will be a pixel-perfect clone of the existing Buyers module in terms of UI, behavior, and API design, while the B2B-LC integration will allow linking B2B LCs to specific suppliers with auto-fill capabilities.

**Project Goals:**

- Create a standalone Supplier management module
- Integrate suppliers into B2B-LC workflow
- Maintain UI/UX consistency with existing Buyers module
- Ensure data integrity and validation across modules

---

## 2. Module Overview

### 2.1 Supplier Module Scope

The Supplier module manages supplier (exporter) information in the B2B LC system. Suppliers are the entities that provide goods to buyers under B2B LC arrangements.

**Key Features:**

- CRUD operations for supplier records
- Sequential code generation (SUP0001, SUP0002, etc.)
- Search and filtering capabilities
- Status management (active/inactive)
- Unique validation for code and email fields

### 2.2 B2B-LC Integration Scope

**Integration Points:**

- Add supplier_id foreign key to B2B LC records
- Supplier dropdown in B2B-LC create/edit forms
- Auto-populate supplier details when selected
- Display supplier information in B2B-LC views
- API response includes nested supplier object

---

## 3. User Interface Specifications

### 3.1 Navigation & Placement

**Sidebar Menu:**

```
ERT GROUP
├── Sales Contract
├── Orders
├── Shipments
├── Master LC
├── B2B-LC
├── Buyers
└── Suppliers  ← New menu item
```

**Menu Properties:**

- Label: "Suppliers"
- Icon: Same style as Buyers (building/organization icon)
- Position: Directly below "Buyers" in sidebar
- Access Level: Same permissions as Buyers module

### 3.2 Suppliers List Page

**URL:** `/suppliers`

**Page Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Suppliers                                   [+ Add New Supplier] │
├─────────────────────────────────────────────────────────────┤
│ [Search name / code / country / email...]  [Status: All ▼]  │
├─────────────────────────────────────────────────────────────┤
│ Name        Code    Country  Contact  Email      Phone  Status  Action │
├─────────────────────────────────────────────────────────────┤
│ ABC Corp    SUP0001 USA      John Doe j@abc.com  +1...  Active  [Edit][Delete] │
│ XYZ Ltd     SUP0002 UK       Jane Doe j@xyz.com  +44... Active  [Edit][Delete] │
│ ...                                                              │
├─────────────────────────────────────────────────────────────┤
│ Showing 1-10 of 50      [◄] [1] [2] [3] [►]                │
└─────────────────────────────────────────────────────────────┘
```

**Header Section:**

- Page title: "Suppliers" (text-2xl font-bold text-gray-900)
- "+ Add New Supplier" button (px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700)

**Search & Filter Bar:**

- Search input:
  - Placeholder: "Search name / code / country / email..."
  - Width: flex-1 (grows to fill space)
  - Icon: Magnifying glass (left side)
  - Styling: border rounded-lg px-4 py-2
  - Real-time search (debounced 300ms)
- Status filter dropdown:
  - Options: "All", "Active", "Inactive"
  - Default: "All"
  - Width: w-48 (fixed width)
  - Styling: border rounded-lg px-4 py-2

**Data Table:**

| Column         | Width | Content                 | Sorting | Styling                   |
| -------------- | ----- | ----------------------- | ------- | ------------------------- |
| Name           | 20%   | Supplier name           | Yes     | text-gray-900 font-medium |
| Code           | 12%   | Supplier code           | Yes     | text-gray-700 font-mono   |
| Country        | 12%   | Country name            | Yes     | text-gray-700             |
| Contact Person | 15%   | Contact name            | No      | text-gray-700             |
| Email          | 18%   | Email address           | No      | text-gray-600 text-sm     |
| Phone          | 13%   | Phone number            | No      | text-gray-600 text-sm     |
| Status         | 8%    | Badge (Active/Inactive) | Yes     | See badge specs below     |
| Action         | 10%   | Edit/Delete buttons     | No      | Icon buttons              |

**Status Badge Styling:**

- Active: `bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium`
- Inactive: `bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium`

**Action Buttons:**

- Edit: Pencil icon button (text-indigo-600 hover:text-indigo-900)
- Delete: Trash icon button (text-red-600 hover:text-red-900)
- Confirm delete with modal: "Are you sure you want to delete this supplier?"

**Pagination:**

- Position: Bottom of table
- Style: Same as Buyers module
- Items per page: 10 (default), options: 10, 25, 50, 100
- Shows: "Showing X-Y of Z results"

**Empty State:**

```
No suppliers found
[+ Add New Supplier]
```

### 3.3 Add/Edit Supplier Modal

**Modal Properties:**

- Width: max-w-2xl (672px)
- Background: White with shadow-xl
- Backdrop: Semi-transparent black (bg-black bg-opacity-50)
- Animation: Fade in/scale up
- Close: Click backdrop, ESC key, or Cancel button

**Modal Layout:**

```
┌────────────────────────────────────────────┐
│ Add New Supplier                      [×]  │
├────────────────────────────────────────────┤
│                                            │
│ Name *                                     │
│ [_______________________________]          │
│                                            │
│ Supplier Code *                            │
│ [SUP0003____________] (Auto-generated)     │
│                                            │
│ Contact Person                             │
│ [_______________________________]          │
│                                            │
│ Email                                      │
│ [_______________________________]          │
│                                            │
│ Phone                                      │
│ [_______________________________]          │
│                                            │
│ Country                                    │
│ [Select country________________ ▼]         │
│                                            │
│ Address                                    │
│ [                               ]          │
│ [                               ]          │
│ [                               ]          │
│                                            │
│ Status                                     │
│ ○ Active  ○ Inactive                       │
│                                            │
├────────────────────────────────────────────┤
│                    [Cancel]  [Save Supplier] │
└────────────────────────────────────────────┘
```

**Form Fields Specification:**

1. **Name\*** (Required)

   - Type: Text input
   - Max length: 255 characters
   - Validation: Required, min 2 characters
   - Error: "Supplier name is required"
   - Styling: w-full border rounded-lg px-3 py-2

2. **Supplier Code\*** (Required)

   - Type: Text input
   - Pattern: SUP + 4 digits (e.g., SUP0001)
   - Auto-generated on modal open
   - Editable: Yes
   - Unique: Must be unique across all suppliers
   - Validation: Required, matches pattern, unique
   - Error: "Code is required" / "Code already exists"
   - Styling: w-full border rounded-lg px-3 py-2 font-mono

3. **Contact Person**

   - Type: Text input
   - Max length: 255 characters
   - Optional
   - Styling: w-full border rounded-lg px-3 py-2

4. **Email**

   - Type: Email input
   - Max length: 255 characters
   - Validation: Valid email format, unique (if provided)
   - Optional
   - Error: "Invalid email format" / "Email already exists"
   - Styling: w-full border rounded-lg px-3 py-2

5. **Phone**

   - Type: Text input
   - Max length: 50 characters
   - Optional
   - Styling: w-full border rounded-lg px-3 py-2

6. **Country**

   - Type: Select dropdown
   - Options: Standard country list (ISO countries)
   - Optional
   - Searchable: Yes
   - Styling: w-full border rounded-lg px-3 py-2

7. **Address**

   - Type: Textarea
   - Rows: 4
   - Max length: 1000 characters
   - Optional
   - Styling: w-full border rounded-lg px-3 py-2

8. **Status**
   - Type: Radio buttons
   - Options: Active (default), Inactive
   - Required: Always has a value
   - Styling: Radio buttons with labels

**Modal Actions:**

- **Cancel Button:**

  - Style: px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300
  - Action: Close modal without saving, discard changes
  - Shortcut: ESC key

- **Save Supplier Button:**
  - Style: px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
  - Action: Validate and submit form
  - Loading state: "Saving..." with spinner
  - Success: Close modal, refresh list, show toast "Supplier created/updated successfully"
  - Error: Show inline validation errors

**Edit Mode Differences:**

- Modal title: "Edit Supplier"
- All fields pre-filled with existing data
- Code field: Pre-filled but editable (unique check excludes current record)
- Save button: "Update Supplier"
- Success toast: "Supplier updated successfully"

---

## 4. Backend Specifications

### 4.1 Database Schema

**Table: `suppliers`**

```sql
CREATE TABLE suppliers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    contact_person VARCHAR(255) NULL,
    email VARCHAR(255) NULL UNIQUE,
    phone VARCHAR(50) NULL,
    country VARCHAR(100) NULL,
    address TEXT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_suppliers_status (status),
    INDEX idx_suppliers_country (country),
    INDEX idx_suppliers_code (code)
);
```

**Indexes Rationale:**

- Primary key on `id` for unique identification
- Unique index on `code` for business key enforcement
- Unique index on `email` for preventing duplicate contacts
- Regular index on `status` for filtering active/inactive suppliers
- Regular index on `country` for geographic filtering
- Regular index on `code` for search optimization

### 4.2 Model Specifications

**File:** `app/Models/Supplier.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function b2bLcs()
    {
        return $this->hasMany(B2BLC::class, 'supplier_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('country', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        return $this->status === 'active'
            ? ['class' => 'bg-green-100 text-green-800', 'label' => 'Active']
            : ['class' => 'bg-gray-100 text-gray-800', 'label' => 'Inactive'];
    }

    // Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
```

### 4.3 API Endpoints

**Base URL:** `/api/suppliers`

#### 4.3.1 List Suppliers

```
GET /api/suppliers
```

**Query Parameters:**

- `search` (string, optional): Search term for name/code/country/email
- `status` (string, optional): Filter by status (active/inactive)
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 10, max: 100)
- `sort_by` (string, optional): Column to sort by (default: created_at)
- `sort_order` (string, optional): Sort direction (asc/desc, default: desc)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ABC Corporation",
      "code": "SUP0001",
      "contact_person": "John Doe",
      "email": "john@abccorp.com",
      "phone": "+1-555-0123",
      "country": "USA",
      "address": "123 Main St, New York, NY 10001",
      "status": "active",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 50,
    "last_page": 5,
    "from": 1,
    "to": 10
  }
}
```

#### 4.3.2 Get Supplier by ID

```
GET /api/suppliers/{id}
```

**Path Parameters:**

- `id` (integer, required): Supplier ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ABC Corporation",
    "code": "SUP0001",
    "contact_person": "John Doe",
    "email": "john@abccorp.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Main St, New York, NY 10001",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Supplier not found"
}
```

#### 4.3.3 Create Supplier

```
POST /api/suppliers
```

**Request Body:**

```json
{
  "name": "ABC Corporation",
  "code": "SUP0001",
  "contact_person": "John Doe",
  "email": "john@abccorp.com",
  "phone": "+1-555-0123",
  "country": "USA",
  "address": "123 Main St, New York, NY 10001",
  "status": "active"
}
```

**Validation Rules:**

- `name`: required|string|min:2|max:255
- `code`: required|string|max:50|unique:suppliers,code
- `contact_person`: nullable|string|max:255
- `email`: nullable|email|max:255|unique:suppliers,email
- `phone`: nullable|string|max:50
- `country`: nullable|string|max:100
- `address`: nullable|string|max:1000
- `status`: required|in:active,inactive

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "id": 1,
    "name": "ABC Corporation",
    "code": "SUP0001",
    "contact_person": "John Doe",
    "email": "john@abccorp.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Main St, New York, NY 10001",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response (422 Unprocessable Entity):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "code": ["The code has already been taken."],
    "email": ["The email must be a valid email address."]
  }
}
```

#### 4.3.4 Update Supplier

```
PUT /api/suppliers/{id}
```

**Path Parameters:**

- `id` (integer, required): Supplier ID

**Request Body:** Same as Create (all fields optional except required ones)

**Validation Rules:** Same as Create, with unique checks excluding current record

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Supplier updated successfully",
  "data": {
    "id": 1,
    "name": "ABC Corporation Updated",
    "code": "SUP0001",
    "contact_person": "John Doe",
    "email": "john@abccorp.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Main St, New York, NY 10001",
    "status": "active",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:45:00Z"
  }
}
```

#### 4.3.5 Delete Supplier

```
DELETE /api/suppliers/{id}
```

**Path Parameters:**

- `id` (integer, required): Supplier ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

**Response (409 Conflict):**

```json
{
  "success": false,
  "message": "Cannot delete supplier. It is associated with B2B LC records."
}
```

#### 4.3.6 Generate Next Supplier Code

```
GET /api/suppliers/generate-code
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "code": "SUP0043"
  }
}
```

### 4.4 Controller Structure

**File:** `app/Http/Controllers/SupplierController.php`

```php
class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    public function store(StoreSupplierRequest $request): JsonResponse
    public function show(Supplier $supplier): JsonResponse
    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    public function destroy(Supplier $supplier): JsonResponse
    public function generateCode(): JsonResponse
}
```

### 4.5 Form Request Classes

**Files:**

- `app/Http/Requests/StoreSupplierRequest.php`
- `app/Http/Requests/UpdateSupplierRequest.php`

---

## 5. B2B-LC Integration Specifications

### 5.1 Database Changes

**Migration: Add supplier_id to b2b_lcs**

```sql
ALTER TABLE b2b_lcs
ADD COLUMN supplier_id BIGINT UNSIGNED NULL AFTER id,
ADD INDEX idx_b2b_lcs_supplier_id (supplier_id);

-- Add foreign key (in separate migration for safety)
ALTER TABLE b2b_lcs
ADD CONSTRAINT fk_b2b_lcs_supplier_id
FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
ON DELETE RESTRICT;
```

### 5.2 B2B-LC Model Updates

**File:** `app/Models/B2BLC.php`

Add to `$fillable`:

```php
protected $fillable = [
    // ... existing fields
    'supplier_id',
];
```

Add relationship:

```php
public function supplier()
{
    return $this->belongsTo(Supplier::class);
}
```

### 5.3 B2B-LC API Updates

#### 5.3.1 B2B-LC Response Format

**Updated Response Structure:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "lc_number": "B2B-LC-2025-001",
    "supplier_id": 5,
    "buyer_id": 3,
    // ... other B2B-LC fields
    "supplier": {
      "id": 5,
      "name": "ABC Corporation",
      "code": "SUP0005",
      "contact_person": "John Doe",
      "country": "USA",
      "email": "john@abccorp.com",
      "phone": "+1-555-0123"
    },
    "buyer": {
      "id": 3,
      "name": "XYZ Imports"
      // ... buyer fields
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

#### 5.3.2 B2B-LC Validation Updates

Add to validation rules:

```php
'supplier_id' => 'nullable|exists:suppliers,id',
```

#### 5.3.3 B2B-LC Eager Loading

Update controller methods to eager load supplier:

```php
$b2bLc->load(['supplier', 'buyer', 'contract']);
```

### 5.4 B2B-LC Frontend Integration

#### 5.4.1 Form Field Addition

**Location:** B2B-LC Create/Edit Form

**New Field Group (after existing supplier-related section):**

```jsx
{
  /* Supplier Information */
}
<div className="bg-gray-50 p-4 rounded-lg space-y-4">
  <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>

  {/* Supplier Dropdown */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Supplier
    </label>
    <select
      name="supplier_id"
      value={formData.supplier_id || ""}
      onChange={handleSupplierChange}
      className="w-full border rounded-lg px-3 py-2"
    >
      <option value="">Select Supplier...</option>
      {suppliers.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
          {supplier.code} - {supplier.name}
        </option>
      ))}
    </select>
  </div>

  {/* Auto-filled fields */}
  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Supplier Name
      </label>
      <input
        type="text"
        value={formData.supplier_name || ""}
        onChange={(e) =>
          setFormData({ ...formData, supplier_name: e.target.value })
        }
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Will auto-fill when supplier selected"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Country
      </label>
      <input
        type="text"
        value={formData.supplier_country || ""}
        onChange={(e) =>
          setFormData({ ...formData, supplier_country: e.target.value })
        }
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Will auto-fill when supplier selected"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Contact Person
      </label>
      <input
        type="text"
        value={formData.supplier_contact || ""}
        onChange={(e) =>
          setFormData({ ...formData, supplier_contact: e.target.value })
        }
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Will auto-fill when supplier selected"
      />
    </div>
  </div>
</div>;
```

#### 5.4.2 Auto-fill Logic

```javascript
const handleSupplierChange = (e) => {
  const supplierId = e.target.value;
  const supplier = suppliers.find((s) => s.id === parseInt(supplierId));

  if (supplier) {
    setFormData({
      ...formData,
      supplier_id: supplierId,
      supplier_name: supplier.name,
      supplier_country: supplier.country,
      supplier_contact: supplier.contact_person,
    });
  } else {
    setFormData({
      ...formData,
      supplier_id: "",
      supplier_name: "",
      supplier_country: "",
      supplier_contact: "",
    });
  }
};
```

#### 5.4.3 B2B-LC List View Updates

Add Supplier column to table:

| Column   | Width | Content                               |
| -------- | ----- | ------------------------------------- |
| ...      | ...   | ...                                   |
| Supplier | 15%   | `{supplier?.code} - {supplier?.name}` |
| ...      | ...   | ...                                   |

---

## 6. Code Generation Service

### 6.1 Supplier Code Generator

**File:** `app/Services/SupplierCodeGenerator.php`

```php
<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class SupplierCodeGenerator
{
    /**
     * Generate next sequential supplier code
     * Format: SUP0001, SUP0002, etc.
     */
    public function generate(): string
    {
        // Get the latest supplier code
        $latestSupplier = Supplier::orderBy('code', 'desc')
            ->lockForUpdate()
            ->first();

        if (!$latestSupplier) {
            return 'SUP0001';
        }

        // Extract numeric part and increment
        preg_match('/SUP(\d+)/', $latestSupplier->code, $matches);
        $number = isset($matches[1]) ? intval($matches[1]) : 0;
        $nextNumber = $number + 1;

        return 'SUP' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Validate supplier code format
     */
    public function isValid(string $code): bool
    {
        return preg_match('/^SUP\d{4}$/', $code) === 1;
    }
}
```

---

## 7. Testing Requirements

### 7.1 Unit Tests

**File:** `tests/Unit/SupplierTest.php`

**Test Cases:**

- `test_supplier_can_be_created()`
- `test_supplier_code_must_be_unique()`
- `test_supplier_email_must_be_unique()`
- `test_supplier_name_is_required()`
- `test_supplier_code_is_required()`
- `test_supplier_status_defaults_to_active()`
- `test_supplier_can_have_b2b_lcs()`
- `test_supplier_code_generator_works()`

### 7.2 Feature Tests

**File:** `tests/Feature/SupplierControllerTest.php`

**Test Cases:**

- `test_can_list_suppliers()`
- `test_can_search_suppliers()`
- `test_can_filter_suppliers_by_status()`
- `test_can_paginate_suppliers()`
- `test_can_create_supplier()`
- `test_cannot_create_supplier_with_duplicate_code()`
- `test_cannot_create_supplier_with_duplicate_email()`
- `test_can_update_supplier()`
- `test_can_delete_supplier()`
- `test_cannot_delete_supplier_with_b2b_lcs()`
- `test_can_generate_supplier_code()`

### 7.3 E2E Tests (Playwright)

**File:** `tests/e2e/suppliers.spec.js`

**Test Scenarios:**

- Navigate to Suppliers page
- Create new supplier with all fields
- Search suppliers by name
- Filter suppliers by status
- Edit existing supplier
- Delete supplier
- Verify unique validation errors
- Test pagination

**File:** `tests/e2e/b2b-lc-supplier-integration.spec.js`

**Test Scenarios:**

- Open B2B-LC create form
- Select supplier from dropdown
- Verify auto-fill works
- Save B2B-LC with supplier
- Verify supplier appears in B2B-LC list
- Edit B2B-LC and change supplier

---

## 8. Security & Permissions

### 8.1 Access Control

**Permissions Required:**

- `suppliers.view` - View suppliers list and details
- `suppliers.create` - Create new suppliers
- `suppliers.edit` - Edit existing suppliers
- `suppliers.delete` - Delete suppliers

### 8.2 Data Validation

**Server-side Validation:**

- All inputs sanitized
- SQL injection prevention via prepared statements
- XSS prevention via output escaping
- CSRF protection on all mutations

**Client-side Validation:**

- Real-time field validation
- Prevent malformed data submission
- User-friendly error messages

---

## 9. Performance Considerations

### 9.1 Database Optimization

- Indexes on frequently queried columns (status, country, code)
- Eager loading to prevent N+1 queries
- Pagination to limit result sets
- Query result caching for supplier dropdowns (5 minutes TTL)

### 9.2 Frontend Optimization

- Debounced search input (300ms)
- Lazy loading for supplier dropdown
- Virtual scrolling for large lists
- Memoized components

---

## 10. Migration Strategy

### 10.1 Phase 1: Supplier Module (Week 1)

1. Database migration (suppliers table)
2. Model and relationships
3. Controller and routes
4. API endpoints
5. Unit and feature tests
6. Frontend components
7. E2E tests

### 10.2 Phase 2: B2B-LC Integration (Week 2)

1. Add supplier_id column (nullable)
2. Deploy to production
3. Update B2B-LC API
4. Update B2B-LC frontend
5. Add foreign key constraint
6. Update tests
7. Documentation

---

## 11. Rollback Plan

**If issues occur:**

1. Remove foreign key constraint
2. Drop supplier_id column from b2b_lcs
3. Remove supplier routes from API
4. Revert frontend changes
5. Drop suppliers table
6. Clear caches

**Rollback SQL:**

```sql
ALTER TABLE b2b_lcs DROP FOREIGN KEY fk_b2b_lcs_supplier_id;
ALTER TABLE b2b_lcs DROP COLUMN supplier_id;
DROP TABLE suppliers;
```

---

## 12. Success Criteria

**Module is considered complete when:**

- ✅ All CRUD operations work for suppliers
- ✅ Supplier code auto-generation works
- ✅ Search and filtering work correctly
- ✅ Unique validation prevents duplicates
- ✅ B2B-LC integration shows supplier dropdown
- ✅ Auto-fill populates supplier fields
- ✅ B2B-LC API returns supplier object
- ✅ All unit tests pass (>95% coverage)
- ✅ All feature tests pass
- ✅ All E2E tests pass
- ✅ No performance regression
- ✅ UI matches Buyers module exactly
- ✅ API documentation is complete
- ✅ User acceptance testing passed

---

## 13. Appendices

### Appendix A: Country List

Use standard ISO 3166-1 country list. Top 20 trading countries should appear first in dropdown.

### Appendix B: Error Messages

| Error             | Message                                                         |
| ----------------- | --------------------------------------------------------------- |
| Name required     | "Supplier name is required"                                     |
| Code required     | "Supplier code is required"                                     |
| Code exists       | "This supplier code already exists"                             |
| Email format      | "Please enter a valid email address"                            |
| Email exists      | "This email is already registered"                              |
| Delete restricted | "Cannot delete supplier. It is associated with B2B LC records." |

### Appendix C: Toast Notifications

| Action | Message                                | Type    |
| ------ | -------------------------------------- | ------- |
| Create | "Supplier created successfully"        | Success |
| Update | "Supplier updated successfully"        | Success |
| Delete | "Supplier deleted successfully"        | Success |
| Error  | "An error occurred. Please try again." | Error   |

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Status:** Ready for Implementation
