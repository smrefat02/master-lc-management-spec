# Supplier Module - Implementation Checklist v1.0

**Purpose:** Comprehensive verification checklist for Supplier module implementation  
**Total Items:** 186 checkboxes  
**Usage:** Check off each item as completed  
**Review:** Verify all items checked before production deployment

---

## Phase 1: Backend Foundation

### 1.1 Database Setup ✓

#### Migration: Create Suppliers Table

- [ ] Migration file created with proper timestamp naming
- [ ] `id` column: BIGINT UNSIGNED, PRIMARY KEY, AUTO_INCREMENT
- [ ] `name` column: VARCHAR(255), NOT NULL
- [ ] `code` column: VARCHAR(50), NOT NULL, UNIQUE
- [ ] `contact_person` column: VARCHAR(255), NULLABLE
- [ ] `email` column: VARCHAR(255), NULLABLE, UNIQUE
- [ ] `phone` column: VARCHAR(50), NULLABLE
- [ ] `country` column: VARCHAR(100), NULLABLE
- [ ] `address` column: TEXT, NULLABLE
- [ ] `status` column: ENUM('active', 'inactive'), NOT NULL, DEFAULT 'active'
- [ ] `created_at` timestamp field
- [ ] `updated_at` timestamp field
- [ ] Index on `status` column
- [ ] Index on `country` column
- [ ] Index on `name` column for search
- [ ] Unique constraint on `code` verified
- [ ] Unique constraint on `email` verified
- [ ] Up method creates table correctly
- [ ] Down method drops table correctly
- [ ] Migration runs without errors: `php artisan migrate`
- [ ] Migration can be rolled back: `php artisan migrate:rollback`

#### Enum: SupplierStatus

- [ ] File created at `app/Enums/SupplierStatus.php`
- [ ] Extends base string-backed enum
- [ ] ACTIVE case defined with value 'active'
- [ ] INACTIVE case defined with value 'inactive'
- [ ] `label()` method returns 'Active' for ACTIVE
- [ ] `label()` method returns 'Inactive' for INACTIVE
- [ ] `badge()` method returns correct Tailwind classes for active (green)
- [ ] `badge()` method returns correct Tailwind classes for inactive (gray)
- [ ] Can be used in model casting

### 1.2 Eloquent Model ✓

#### Supplier Model Structure

- [ ] File created at `app/Models/Supplier.php`
- [ ] Extends Illuminate\Database\Eloquent\Model
- [ ] Uses HasFactory trait
- [ ] Table name set to 'suppliers' (or defaults correctly)
- [ ] $fillable includes: name, code, contact_person, email, phone, country, address, status
- [ ] $casts includes: status as SupplierStatus::class
- [ ] $casts includes timestamps (created_at, updated_at)

#### Model Relationships

- [ ] `b2bLcs()` method defined
- [ ] `b2bLcs()` returns hasMany(B2BLC::class)
- [ ] Relationship tested and working

#### Query Scopes

- [ ] `scopeActive()` defined: where('status', SupplierStatus::ACTIVE)
- [ ] `scopeInactive()` defined: where('status', SupplierStatus::INACTIVE)
- [ ] `scopeByStatus($status)` defined: where('status', $status)
- [ ] `scopeSearch($query, $search)` defined
- [ ] Search scope checks name LIKE %search%
- [ ] Search scope checks code LIKE %search%
- [ ] Search scope checks country LIKE %search%
- [ ] Search scope checks email LIKE %search%
- [ ] All scopes tested and working

#### Helper Methods

- [ ] `isActive()` method returns boolean
- [ ] `isActive()` checks status === SupplierStatus::ACTIVE
- [ ] `canBeDeleted()` method defined
- [ ] `canBeDeleted()` returns !$this->b2bLcs()->exists()
- [ ] `activate()` method sets status to ACTIVE
- [ ] `deactivate()` method sets status to INACTIVE

### 1.3 Factory & Seeder ✓

#### SupplierFactory

- [ ] File created at `database/factories/SupplierFactory.php`
- [ ] Extends Illuminate\Database\Eloquent\Factories\Factory
- [ ] Model property set to Supplier::class
- [ ] definition() method returns array with all fields
- [ ] Generates unique supplier codes (SUP0001 format)
- [ ] Uses faker for realistic company names
- [ ] Generates unique emails
- [ ] Generates phone numbers
- [ ] Generates countries
- [ ] Generates addresses
- [ ] Status defaults to 'active'
- [ ] 75% active, 25% inactive distribution
- [ ] `active()` state modifier defined
- [ ] `inactive()` state modifier defined
- [ ] Can create multiple suppliers: Supplier::factory()->count(10)->create()

#### SupplierSeeder

- [ ] File created at `database/seeders/SupplierSeeder.php`
- [ ] Extends Illuminate\Database\Seeder
- [ ] run() method defined
- [ ] Creates 5 diverse supplier records
- [ ] Supplier 1: USA-based company
- [ ] Supplier 2: UK-based company
- [ ] Supplier 3: China-based company
- [ ] Supplier 4: Germany-based company
- [ ] Supplier 5: Inactive supplier for testing
- [ ] Sequential codes SUP0001 to SUP0005
- [ ] Realistic data (names, emails, phones, addresses)
- [ ] Seeder registered in DatabaseSeeder.php
- [ ] Can run: `php artisan db:seed --class=SupplierSeeder`

### 1.4 Services ✓

#### SupplierCodeGenerator Service

- [ ] File created at `app/Services/SupplierCodeGenerator.php`
- [ ] `generate()` method defined
- [ ] Returns next available code (SUP0001, SUP0002, etc.)
- [ ] Handles case when no suppliers exist (returns SUP0001)
- [ ] Uses lockForUpdate() for thread safety
- [ ] Extracts numeric part from last code
- [ ] Increments numeric part correctly
- [ ] Pads with leading zeros (4 digits)
- [ ] `isValid($code)` method defined
- [ ] isValid() checks regex: /^SUP\d{4}$/
- [ ] Service tested with unit tests

### 1.5 Form Requests ✓

#### StoreSupplierRequest

- [ ] File created at `app/Http/Requests/StoreSupplierRequest.php`
- [ ] Extends FormRequest
- [ ] `authorize()` returns true
- [ ] `rules()` method defined
- [ ] Validation: name required
- [ ] Validation: name string
- [ ] Validation: name min:2
- [ ] Validation: name max:255
- [ ] Validation: code required
- [ ] Validation: code string
- [ ] Validation: code max:50
- [ ] Validation: code regex:/^SUP\d{4}$/
- [ ] Validation: code unique:suppliers,code
- [ ] Validation: contact_person nullable
- [ ] Validation: contact_person string
- [ ] Validation: contact_person max:255
- [ ] Validation: email nullable
- [ ] Validation: email email:rfc,dns
- [ ] Validation: email max:255
- [ ] Validation: email unique:suppliers,email
- [ ] Validation: phone nullable
- [ ] Validation: phone string
- [ ] Validation: phone max:50
- [ ] Validation: country nullable
- [ ] Validation: country string
- [ ] Validation: country max:100
- [ ] Validation: address nullable
- [ ] Validation: address string
- [ ] Validation: status required
- [ ] Validation: status in:active,inactive
- [ ] Custom error messages defined for all rules
- [ ] Messages are user-friendly

#### UpdateSupplierRequest

- [ ] File created at `app/Http/Requests/UpdateSupplierRequest.php`
- [ ] Extends FormRequest
- [ ] Same validation rules as StoreSupplierRequest
- [ ] Unique validation for code excludes current supplier ID
- [ ] Unique validation for email excludes current supplier ID
- [ ] Uses route model binding to get supplier ID: $this->route('supplier')->id
- [ ] Custom error messages defined

### 1.6 API Resources ✓

#### SupplierResource

- [ ] File created at `app/Http/Resources/SupplierResource.php`
- [ ] Extends JsonResource
- [ ] `toArray()` method defined
- [ ] Returns all supplier fields: id, name, code, contact_person, email, phone, country, address, status
- [ ] Formats dates: created_at and updated_at
- [ ] Includes status_badge attribute
- [ ] status_badge uses enum badge() method
- [ ] Can be used for single resource: new SupplierResource($supplier)
- [ ] Can be used for collection: SupplierResource::collection($suppliers)

### 1.7 Controller ✓

#### SupplierController Structure

- [ ] File created at `app/Http/Controllers/SupplierController.php`
- [ ] Created with --api flag (no create/edit methods)
- [ ] Six methods defined: index, store, show, update, destroy, generateCode
- [ ] Uses SupplierCodeGenerator service via dependency injection
- [ ] All methods return JsonResponse

#### index() Method

- [ ] Method defined with Request parameter
- [ ] Accepts search query parameter
- [ ] Accepts status filter parameter
- [ ] Accepts sort_by parameter (default: 'created_at')
- [ ] Accepts sort_order parameter (default: 'desc')
- [ ] Accepts page parameter
- [ ] Accepts per_page parameter (default: 15, max: 100)
- [ ] Applies search() scope when search provided
- [ ] Applies byStatus() scope when status provided
- [ ] Applies sorting
- [ ] Returns paginated results
- [ ] Returns SupplierResource collection
- [ ] Handles errors gracefully
- [ ] Returns 200 status code on success

#### store() Method

- [ ] Method defined with StoreSupplierRequest parameter
- [ ] Uses validated() data
- [ ] Creates supplier record: Supplier::create($validated)
- [ ] Returns 201 status code
- [ ] Returns created supplier wrapped in SupplierResource
- [ ] Includes success message
- [ ] Handles database errors
- [ ] Returns 422 for validation errors
- [ ] Logs errors

#### show() Method

- [ ] Method defined with Supplier model binding
- [ ] Returns supplier data
- [ ] Uses SupplierResource
- [ ] Returns 200 status code
- [ ] Returns 404 if not found (handled by Laravel)

#### update() Method

- [ ] Method defined with UpdateSupplierRequest and Supplier model binding
- [ ] Uses validated() data
- [ ] Updates supplier: $supplier->update($validated)
- [ ] Returns updated supplier wrapped in SupplierResource
- [ ] Returns 200 status code
- [ ] Includes success message
- [ ] Handles database errors
- [ ] Returns 422 for validation errors

#### destroy() Method

- [ ] Method defined with Supplier model binding
- [ ] Checks if supplier can be deleted: $supplier->canBeDeleted()
- [ ] Returns 409 Conflict if has B2B LCs
- [ ] Returns appropriate error message when restricted
- [ ] Deletes supplier: $supplier->delete()
- [ ] Returns 200 status code on success
- [ ] Includes success message
- [ ] Handles errors gracefully

#### generateCode() Method

- [ ] Method defined
- [ ] Calls SupplierCodeGenerator service
- [ ] Returns next available code
- [ ] Returns JSON: {code: 'SUP0001'}
- [ ] Returns 200 status code
- [ ] Handles errors

### 1.8 Routes ✓

#### API Routes

- [ ] Routes added to `routes/api.php`
- [ ] GET /api/suppliers → index
- [ ] POST /api/suppliers → store
- [ ] GET /api/suppliers/generate-code → generateCode (BEFORE show route)
- [ ] GET /api/suppliers/{supplier} → show
- [ ] PUT /api/suppliers/{supplier} → update
- [ ] DELETE /api/suppliers/{supplier} → destroy
- [ ] Route model binding works for {supplier}
- [ ] Routes use SupplierController
- [ ] Routes protected with auth middleware (if required)
- [ ] CORS configured correctly

### 1.9 Testing ✓

#### Unit Tests: Supplier Model

- [ ] File created at `tests/Unit/SupplierTest.php`
- [ ] test_supplier_can_be_created()
- [ ] test_supplier_code_must_be_unique()
- [ ] test_supplier_email_must_be_unique()
- [ ] test_supplier_name_is_required()
- [ ] test_supplier_code_is_required()
- [ ] test_supplier_status_defaults_to_active()
- [ ] test_supplier_can_have_b2b_lcs()
- [ ] test_supplier_active_scope_works()
- [ ] test_supplier_inactive_scope_works()
- [ ] test_supplier_search_scope_works()
- [ ] test_supplier_by_status_scope_works()
- [ ] test_supplier_is_active_method()
- [ ] test_supplier_can_be_activated()
- [ ] test_supplier_can_be_deactivated()
- [ ] test_supplier_can_be_deleted_method()
- [ ] All tests passing

#### Unit Tests: SupplierCodeGenerator

- [ ] File created at `tests/Unit/SupplierCodeGeneratorTest.php`
- [ ] test_generates_first_code_when_no_suppliers()
- [ ] test_generates_sequential_codes()
- [ ] test_validates_code_format()
- [ ] test_handles_gaps_in_sequence()
- [ ] test_pads_with_leading_zeros()
- [ ] All tests passing

#### Feature Tests: SupplierController

- [ ] File created at `tests/Feature/SupplierControllerTest.php`
- [ ] test_can_list_suppliers()
- [ ] test_list_returns_paginated_data()
- [ ] test_can_search_suppliers_by_name()
- [ ] test_can_search_suppliers_by_code()
- [ ] test_can_search_suppliers_by_country()
- [ ] test_can_search_suppliers_by_email()
- [ ] test_can_filter_suppliers_by_active_status()
- [ ] test_can_filter_suppliers_by_inactive_status()
- [ ] test_can_sort_suppliers()
- [ ] test_can_paginate_suppliers()
- [ ] test_can_create_supplier()
- [ ] test_create_returns_201_status()
- [ ] test_created_supplier_stored_in_database()
- [ ] test_cannot_create_supplier_with_duplicate_code()
- [ ] test_cannot_create_supplier_with_duplicate_email()
- [ ] test_cannot_create_supplier_without_name()
- [ ] test_cannot_create_supplier_without_code()
- [ ] test_cannot_create_supplier_with_invalid_code_format()
- [ ] test_cannot_create_supplier_with_invalid_email()
- [ ] test_can_show_supplier()
- [ ] test_show_returns_404_for_nonexistent_supplier()
- [ ] test_can_update_supplier()
- [ ] test_update_returns_200_status()
- [ ] test_updated_supplier_persisted_in_database()
- [ ] test_cannot_update_with_duplicate_code()
- [ ] test_cannot_update_with_duplicate_email()
- [ ] test_can_delete_supplier()
- [ ] test_delete_returns_200_status()
- [ ] test_deleted_supplier_removed_from_database()
- [ ] test_cannot_delete_supplier_with_b2b_lcs()
- [ ] test_delete_with_associations_returns_409()
- [ ] test_can_generate_code()
- [ ] test_generated_code_is_sequential()
- [ ] All tests passing
- [ ] Test coverage >95%

---

## Phase 2: Frontend Development

### 2.1 Service Layer ✓

#### supplierService.js

- [ ] File created at `frontend/src/services/supplierService.js`
- [ ] Imports axios
- [ ] Base URL configured: /api/suppliers
- [ ] getAll(params) method defined
- [ ] getAll() accepts search, status, page, per_page parameters
- [ ] getAll() returns promise
- [ ] getById(id) method defined
- [ ] create(data) method defined
- [ ] create() sends POST request
- [ ] update(id, data) method defined
- [ ] update() sends PUT request
- [ ] delete(id) method defined
- [ ] delete() sends DELETE request
- [ ] generateCode() method defined
- [ ] generateCode() sends GET to /generate-code
- [ ] All methods handle errors
- [ ] Service tested manually with API

### 2.2 SuppliersList Page ✓

#### Component Structure

- [ ] File created at `frontend/src/pages/suppliers/SuppliersList.jsx`
- [ ] Component uses functional component syntax
- [ ] Uses useState for state management
- [ ] Uses useEffect for data fetching
- [ ] Page layout matches Buyers module
- [ ] Header with "Suppliers" title
- [ ] "Add Supplier" button in header
- [ ] Button styled consistently

#### Search and Filters

- [ ] Search input field rendered
- [ ] Search input has placeholder: "Search by name, code, country, or email"
- [ ] Search input debounced (300ms)
- [ ] Status filter dropdown rendered
- [ ] Status options: All, Active, Inactive
- [ ] Filter changes trigger API call
- [ ] "Clear Filters" button present
- [ ] Clear button resets search and filters
- [ ] URL parameters updated on filter change (optional)

#### Data Table

- [ ] Table rendered with proper structure
- [ ] Table headers: Code, Name, Contact Person, Email, Country, Status, Actions
- [ ] Code column displays supplier code
- [ ] Name column displays supplier name
- [ ] Contact Person column displays contact_person
- [ ] Email column displays email
- [ ] Country column displays country
- [ ] Status column displays badge
- [ ] Status badge green for active
- [ ] Status badge gray for inactive
- [ ] Actions column has Edit and Delete buttons
- [ ] Edit button opens modal with supplier data
- [ ] Delete button shows confirmation
- [ ] Table shows loading state while fetching
- [ ] Table shows empty state when no results
- [ ] Empty state has icon and helpful message
- [ ] Table responsive on mobile devices

#### Pagination

- [ ] Pagination controls rendered
- [ ] Shows current page and total pages
- [ ] Previous button present
- [ ] Next button present
- [ ] Previous button disabled on first page
- [ ] Next button disabled on last page
- [ ] Page number buttons rendered (if applicable)
- [ ] Items per page selector present
- [ ] Options: 10, 15, 25, 50, 100
- [ ] Total items count displayed
- [ ] Pagination state persists across refreshes (optional)

### 2.3 SupplierModal Component ✓

#### Modal Structure

- [ ] File created at `frontend/src/components/suppliers/SupplierModal.jsx`
- [ ] Modal overlay covers entire screen
- [ ] Modal centered on screen
- [ ] Modal has max-width (e.g., 600px)
- [ ] Modal has close button (X icon)
- [ ] Clicking overlay closes modal
- [ ] Pressing Escape closes modal
- [ ] Title displays "Add Supplier" when adding
- [ ] Title displays "Edit Supplier" when editing
- [ ] Footer has Cancel and Save buttons
- [ ] Cancel button closes modal
- [ ] Save button submits form
- [ ] Save button shows loading state
- [ ] Save button disabled when invalid
- [ ] Modal styled consistently with app

#### Form Fields

- [ ] SupplierForm component embedded
- [ ] All form fields rendered correctly
- [ ] Form pre-filled when editing
- [ ] Form empty when adding

### 2.4 SupplierForm Component ✓

#### Form Structure

- [ ] File created at `frontend/src/components/suppliers/SupplierForm.jsx`
- [ ] Form uses controlled components
- [ ] Form state managed with useState
- [ ] All fields present and styled
- [ ] Form layout matches Buyers module

#### Form Fields: Name

- [ ] Name input field rendered
- [ ] Label: "Supplier Name \*"
- [ ] Input type="text"
- [ ] Required indicator (\*)
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Validation: required
- [ ] Validation: min 2 characters
- [ ] Validation: max 255 characters
- [ ] Error message displays below field
- [ ] Error styling (red border) when invalid

#### Form Fields: Code

- [ ] Code input field rendered
- [ ] Label: "Supplier Code \*"
- [ ] Input type="text"
- [ ] Required indicator (\*)
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Auto-populated on modal open (add mode)
- [ ] User can edit code
- [ ] Validation: required
- [ ] Validation: matches regex /^SUP\d{4}$/
- [ ] Validation: unique (backend)
- [ ] Error message displays
- [ ] Placeholder: "SUP0001"

#### Form Fields: Contact Person

- [ ] Contact person input field rendered
- [ ] Label: "Contact Person"
- [ ] Input type="text"
- [ ] Optional (no \*)
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Max 255 characters

#### Form Fields: Email

- [ ] Email input field rendered
- [ ] Label: "Email"
- [ ] Input type="email"
- [ ] Optional
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Validation: valid email format
- [ ] Validation: unique (backend)
- [ ] Error message displays

#### Form Fields: Phone

- [ ] Phone input field rendered
- [ ] Label: "Phone"
- [ ] Input type="text"
- [ ] Optional
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Max 50 characters
- [ ] Placeholder: "+1 (555) 123-4567"

#### Form Fields: Country

- [ ] Country field rendered
- [ ] Can use select dropdown or searchable select
- [ ] Label: "Country"
- [ ] Optional
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Common countries listed
- [ ] Searchable (if using library like react-select)

#### Form Fields: Address

- [ ] Address field rendered
- [ ] Label: "Address"
- [ ] Input type="textarea"
- [ ] Optional
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Rows: 3
- [ ] Resizable

#### Form Fields: Status

- [ ] Status field rendered
- [ ] Label: "Status \*"
- [ ] Radio buttons or toggle switch
- [ ] Options: Active, Inactive
- [ ] Default: Active
- [ ] Value bound to state
- [ ] onChange updates state
- [ ] Required
- [ ] Styled consistently

#### Form Validation

- [ ] All required fields validated
- [ ] Email format validated
- [ ] Code format validated
- [ ] Validation errors displayed inline
- [ ] Submit disabled when invalid
- [ ] All errors shown at once
- [ ] Error messages clear and helpful

### 2.5 CRUD Functionality ✓

#### Create Supplier

- [ ] "Add Supplier" button opens modal
- [ ] Modal displays with empty form
- [ ] generateCode() called on modal open
- [ ] Code field auto-populated
- [ ] All fields editable
- [ ] Form validation works
- [ ] Submit calls supplierService.create()
- [ ] Success closes modal
- [ ] Success shows toast notification
- [ ] Success refreshes supplier list
- [ ] Errors displayed in form
- [ ] Backend validation errors shown
- [ ] Loading state during submit

#### Edit Supplier

- [ ] Edit button in table row
- [ ] Edit button opens modal
- [ ] Modal displays with supplier data
- [ ] All fields pre-filled
- [ ] Form validation works
- [ ] Submit calls supplierService.update()
- [ ] Success closes modal
- [ ] Success shows toast notification
- [ ] Success refreshes supplier list
- [ ] Errors displayed in form
- [ ] Backend validation errors shown
- [ ] Loading state during submit

#### Delete Supplier

- [ ] Delete button in table row
- [ ] Delete button shows confirmation dialog
- [ ] Confirmation message clear
- [ ] Cancel button cancels action
- [ ] Confirm calls supplierService.delete()
- [ ] Success shows toast notification
- [ ] Success refreshes supplier list
- [ ] Handles delete restriction (409)
- [ ] Shows appropriate error when restricted
- [ ] Error message: "Cannot delete supplier with associated B2B LCs"
- [ ] Loading state during delete

### 2.6 UI/UX Polish ✓

#### Styling

- [ ] All components styled with Tailwind CSS
- [ ] Styles match Buyers module exactly
- [ ] Colors consistent: blue for primary actions
- [ ] Status badges: green for active, gray for inactive
- [ ] Buttons have hover states
- [ ] Buttons have focus states
- [ ] Form inputs have focus states
- [ ] Table has hover states on rows
- [ ] Modal has shadow and backdrop
- [ ] Responsive layout on all screens

#### Loading States

- [ ] Table shows skeleton loader while fetching
- [ ] Submit button shows spinner during save
- [ ] Delete button shows spinner during delete
- [ ] Code generation shows loading (if slow)
- [ ] Disable form during submission

#### Empty States

- [ ] "No suppliers found" message when empty
- [ ] "No search results" message when search returns nothing
- [ ] Empty state has icon
- [ ] Empty state has helpful message
- [ ] Empty state suggests action (e.g., "Add your first supplier")

#### Toast Notifications

- [ ] Toast library integrated (e.g., react-toastify)
- [ ] Success toast on create: "Supplier created successfully"
- [ ] Success toast on update: "Supplier updated successfully"
- [ ] Success toast on delete: "Supplier deleted successfully"
- [ ] Error toast on API failure
- [ ] Error messages clear and actionable
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Toasts positioned consistently (top-right recommended)

#### Responsive Design

- [ ] Desktop (>1024px): Full table visible
- [ ] Tablet (768px-1024px): Table scrolls horizontally if needed
- [ ] Mobile (<768px): Card view or simplified table
- [ ] Modal fits on mobile screens
- [ ] Form fields stack vertically on mobile
- [ ] Buttons full-width on mobile
- [ ] Navigation menu works on mobile

### 2.7 Navigation ✓

#### Sidebar Menu

- [ ] Suppliers menu item added to sidebar
- [ ] Positioned below Buyers menu item
- [ ] Icon matches style (e.g., building or user-group icon)
- [ ] Label: "Suppliers"
- [ ] Click navigates to /suppliers
- [ ] Active state highlighted when on /suppliers page
- [ ] Active styling matches other menu items

#### Routing

- [ ] Route defined: /suppliers → SuppliersList
- [ ] Route accessible
- [ ] Route protected with authentication (if required)
- [ ] Browser back/forward works correctly

### 2.8 Accessibility ✓

#### Semantic HTML

- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Form labels associated with inputs
- [ ] Button elements for clickable actions (not divs)
- [ ] Table uses proper table elements

#### ARIA Attributes

- [ ] Modal has role="dialog"
- [ ] Modal has aria-labelledby
- [ ] Form errors have aria-live="polite"
- [ ] Loading states have aria-busy
- [ ] Buttons have aria-label when icon-only

#### Keyboard Navigation

- [ ] All interactive elements focusable
- [ ] Tab order logical
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Focus visible with outline
- [ ] Can navigate table with keyboard

#### Screen Reader Support

- [ ] Form fields announced correctly
- [ ] Error messages announced
- [ ] Success toasts announced
- [ ] Loading states announced
- [ ] Empty states readable

---

## Phase 3: B2B-LC Integration

### 3.1 Backend Integration ✓

#### Database Migration

- [ ] Migration created: add_supplier_id_to_b2b_lcs_table.php
- [ ] Adds supplier_id column: BIGINT UNSIGNED, NULLABLE
- [ ] Adds index on supplier_id
- [ ] Up method defined
- [ ] Down method defined
- [ ] Migration runs without errors
- [ ] Can rollback migration

#### Foreign Key Constraint

- [ ] Migration created: add_supplier_foreign_key_to_b2b_lcs_table.php
- [ ] Adds foreign key: supplier_id references suppliers(id)
- [ ] ON DELETE RESTRICT
- [ ] ON UPDATE CASCADE
- [ ] Migration runs without errors
- [ ] Constraint enforced (test with invalid supplier_id)

#### B2BLC Model Updates

- [ ] supplier_id added to $fillable
- [ ] supplier() relationship method added
- [ ] Relationship: belongsTo(Supplier::class)
- [ ] supplier added to $with array for eager loading
- [ ] Relationship tested and working

#### B2BLC Validation Updates

- [ ] StoreB2BLCRequest updated
- [ ] Rule added: supplier_id nullable|exists:suppliers,id
- [ ] UpdateB2BLCRequest updated
- [ ] Same validation rule added

#### B2BLC Controller Updates

- [ ] index() method eager loads supplier
- [ ] show() method eager loads supplier
- [ ] store() method handles supplier_id
- [ ] update() method handles supplier_id
- [ ] Controller tested with supplier_id

#### B2BLC Resource Updates

- [ ] supplier field added to toArray()
- [ ] Includes full supplier object when present
- [ ] Handles null supplier gracefully
- [ ] Resource output tested

### 3.2 Frontend Integration ✓

#### B2BLC Form: Supplier Dropdown

- [ ] Supplier dropdown added to B2BLC form
- [ ] Positioned in appropriate section (e.g., "Supplier Information")
- [ ] Searchable dropdown (using react-select or similar)
- [ ] Label: "Supplier"
- [ ] Fetches active suppliers from API
- [ ] Displays: code + name (e.g., "SUP0001 - Acme Corp")
- [ ] Optional field (no \*)
- [ ] Value bound to form state
- [ ] onChange updates form state
- [ ] onChange triggers auto-fill

#### Auto-Fill Functionality

- [ ] handleSupplierChange function defined
- [ ] Function gets selected supplier details
- [ ] Auto-fills supplier name field
- [ ] Auto-fills country field (if present)
- [ ] Auto-fills contact person (if present)
- [ ] Auto-filled fields remain editable
- [ ] User can clear supplier selection
- [ ] Clearing supplier doesn't clear auto-filled fields (optional behavior)

#### B2BLC List: Supplier Column

- [ ] Supplier column added to B2B-LC table
- [ ] Column position: after buyer or at appropriate location
- [ ] Header: "Supplier"
- [ ] Displays supplier code + name
- [ ] Handles null supplier (shows "-" or "N/A")
- [ ] Column sortable (optional)
- [ ] Column width appropriate

#### B2BLC Detail: Supplier Section

- [ ] Supplier information section added to detail view
- [ ] Section titled "Supplier Information"
- [ ] Displays supplier code
- [ ] Displays supplier name
- [ ] Displays contact person
- [ ] Displays email
- [ ] Displays phone
- [ ] Displays country
- [ ] Displays address
- [ ] Displays status badge
- [ ] Handles null supplier (shows "No supplier assigned")
- [ ] Section styled consistently

#### B2BLC List: Supplier Filter

- [ ] Supplier filter dropdown added
- [ ] Positioned with other filters
- [ ] Label: "Filter by Supplier"
- [ ] Option: "All Suppliers"
- [ ] Lists all active suppliers
- [ ] onChange triggers API call with supplier_id param
- [ ] Backend supports supplier_id filter parameter
- [ ] Filter works correctly

### 3.3 Integration Testing ✓

#### Backend Tests

- [ ] Test: create B2B-LC with supplier_id
- [ ] Test: create B2B-LC without supplier_id
- [ ] Test: update B2B-LC to add supplier
- [ ] Test: update B2B-LC to change supplier
- [ ] Test: update B2B-LC to remove supplier
- [ ] Test: cannot use invalid supplier_id
- [ ] Test: cannot delete supplier with B2B-LCs
- [ ] Test: supplier included in B2B-LC JSON response
- [ ] All integration tests passing

#### Frontend Tests (Manual)

- [ ] Test: Create B2B-LC with supplier selected
- [ ] Test: Auto-fill works when supplier selected
- [ ] Test: Create B2B-LC without supplier
- [ ] Test: Edit B2B-LC and add supplier
- [ ] Test: Edit B2B-LC and change supplier
- [ ] Test: Edit B2B-LC and remove supplier
- [ ] Test: Supplier displays in list view
- [ ] Test: Supplier displays in detail view
- [ ] Test: Supplier filter works
- [ ] Test: Cannot delete supplier with B2B-LCs
- [ ] All manual tests passing

---

## Phase 4: Quality Assurance

### 4.1 E2E Testing ✓

#### E2E: Supplier CRUD

- [ ] E2E test: Navigate to suppliers page
- [ ] E2E test: List loads correctly
- [ ] E2E test: Search suppliers
- [ ] E2E test: Filter by status
- [ ] E2E test: Open add modal
- [ ] E2E test: Create new supplier
- [ ] E2E test: Verify supplier in list
- [ ] E2E test: Edit supplier
- [ ] E2E test: Verify changes saved
- [ ] E2E test: Delete supplier
- [ ] E2E test: Verify supplier removed
- [ ] E2E test: Cannot delete supplier with B2B-LCs
- [ ] All E2E tests passing

#### E2E: B2B-LC Integration

- [ ] E2E test: Create B2B-LC with supplier
- [ ] E2E test: Verify auto-fill works
- [ ] E2E test: Verify supplier in detail view
- [ ] E2E test: Edit B2B-LC supplier
- [ ] E2E test: Filter B2B-LCs by supplier
- [ ] All integration E2E tests passing

### 4.2 Manual Testing ✓

#### Functional Testing

- [ ] All CRUD operations work
- [ ] All validations work
- [ ] All filters work
- [ ] All searches work
- [ ] Pagination works
- [ ] Sorting works (if implemented)
- [ ] Auto-fill works
- [ ] Delete restriction works

#### UI/UX Testing

- [ ] All pages load without errors
- [ ] All buttons clickable
- [ ] All forms submittable
- [ ] All modals open/close correctly
- [ ] All toasts appear
- [ ] All loading states work
- [ ] All empty states display
- [ ] All error states display

#### Cross-Browser Testing

- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

#### Responsive Testing

- [ ] Desktop (1920x1080): Layout correct
- [ ] Laptop (1366x768): Layout correct
- [ ] Tablet (768x1024): Layout correct
- [ ] Mobile (375x667): Layout correct

### 4.3 Performance Testing ✓

#### Backend Performance

- [ ] API response time <500ms for list endpoint
- [ ] API response time <200ms for show endpoint
- [ ] Database queries optimized (no N+1)
- [ ] Indexes used effectively
- [ ] Pagination limits enforced

#### Frontend Performance

- [ ] Page load time <2 seconds
- [ ] No unnecessary re-renders
- [ ] Debounced search working
- [ ] Images/assets optimized
- [ ] Bundle size reasonable

### 4.4 Security Testing ✓

#### Backend Security

- [ ] All inputs validated
- [ ] SQL injection prevented
- [ ] Mass assignment protected
- [ ] CSRF protection enabled
- [ ] XSS prevention in place
- [ ] Authentication enforced (if required)
- [ ] Authorization checked (if required)

#### Frontend Security

- [ ] User inputs sanitized
- [ ] XSS prevention in DOM
- [ ] No sensitive data in localStorage
- [ ] API keys not exposed
- [ ] HTTPS enforced (production)

---

## Phase 5: Documentation & Deployment

### 5.1 Documentation ✓

#### Code Documentation

- [ ] All classes have PHPDoc comments
- [ ] All methods have PHPDoc comments
- [ ] All React components have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] README updated with Supplier module info

#### API Documentation

- [ ] Swagger/OpenAPI spec updated
- [ ] All endpoints documented
- [ ] Request schemas defined
- [ ] Response schemas defined
- [ ] Example requests/responses provided
- [ ] Error responses documented

#### User Documentation

- [ ] User guide created (optional)
- [ ] Screenshots added (optional)
- [ ] FAQ section (optional)

### 5.2 Deployment Preparation ✓

#### Database Preparation

- [ ] All migrations reviewed
- [ ] Migration order verified
- [ ] Rollback plan documented
- [ ] Seeder data appropriate for production

#### Environment Configuration

- [ ] .env.example updated
- [ ] New environment variables documented
- [ ] Config files reviewed

#### Build & Deploy

- [ ] Backend: composer install --optimize-autoloader --no-dev
- [ ] Backend: php artisan config:cache
- [ ] Backend: php artisan route:cache
- [ ] Backend: php artisan view:cache
- [ ] Frontend: npm run build
- [ ] Frontend: Build output verified
- [ ] Assets uploaded to CDN (if applicable)

### 5.3 Production Deployment ✓

#### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Changelog updated
- [ ] Deployment plan documented
- [ ] Rollback plan ready
- [ ] Team notified

#### Deployment Steps

- [ ] Backup production database
- [ ] Enable maintenance mode
- [ ] Pull latest code
- [ ] Install dependencies
- [ ] Run migrations
- [ ] Clear caches
- [ ] Build frontend assets
- [ ] Disable maintenance mode
- [ ] Verify deployment

#### Post-Deployment

- [ ] Smoke tests passed
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Verify all features working
- [ ] No critical issues reported
- [ ] Team notified of completion

---

## Final Verification

- [ ] All 186 checklist items completed
- [ ] All tests passing (unit, feature, E2E)
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Deployed to production successfully
- [ ] No critical bugs reported
- [ ] Feature accepted by stakeholders

---

**Checklist Version:** 1.0  
**Last Updated:** December 12, 2025  
**Status:** Ready for Implementation  
**Completion:** 0/186 items checked
