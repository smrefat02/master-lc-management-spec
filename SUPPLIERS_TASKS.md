# Supplier Module - Detailed Task Breakdown v1.0

## Task Organization

**Total Tasks:** 72  
**Estimated Total Time:** 18 days  
**Branch Naming:** `feature/suppliers/<task-slug>`  
**Commit Convention:** `<type>(scope): <description>`

**Types:** feat, fix, test, docs, style, refactor, perf, chore

---

## Phase 1: Backend Foundation (Days 1-4)

### Day 1: Database Setup (8 tasks)

**TASK-001: Create suppliers table migration**

- **Branch:** `feature/suppliers/create-migration`
- **Description:** Create Laravel migration for suppliers table with all columns and indexes
- **Files:**
  - `database/migrations/YYYY_MM_DD_HHMMSS_create_suppliers_table.php`
- **Acceptance Criteria:**
  - ✓ Migration file created with proper timestamp
  - ✓ All 11 columns defined (id, name, code, contact_person, email, phone, country, address, status, created_at, updated_at)
  - ✓ Unique constraints on code and email
  - ✓ Indexes on status, country, name
  - ✓ Default value 'active' for status
  - ✓ Up and down methods implemented
- **Commit:** `feat(suppliers): create suppliers table migration with indexes and constraints`
- **Time:** 1 hour

**TASK-002: Create SupplierStatus enum**

- **Branch:** `feature/suppliers/status-enum`
- **Description:** Create enum class for supplier status values
- **Files:**
  - `app/Enums/SupplierStatus.php`
- **Acceptance Criteria:**
  - ✓ Enum with ACTIVE and INACTIVE cases
  - ✓ label() method returns human-readable names
  - ✓ badge() method returns Tailwind CSS classes
  - ✓ Backed by string values
- **Commit:** `feat(suppliers): add SupplierStatus enum with badge methods`
- **Time:** 30 minutes

**TASK-003: Create Supplier model**

- **Branch:** `feature/suppliers/model`
- **Description:** Create Eloquent model for Supplier with relationships and scopes
- **Files:**
  - `app/Models/Supplier.php`
- **Acceptance Criteria:**
  - ✓ Model created with HasFactory trait
  - ✓ $fillable array includes all editable fields
  - ✓ $casts includes status as SupplierStatus enum
  - ✓ b2bLcs() relationship method (hasMany)
  - ✓ active() and inactive() query scopes
  - ✓ search() scope for name/code/country/email
  - ✓ byStatus() scope for filtering
  - ✓ isActive() helper method
  - ✓ canBeDeleted() method checks B2B LC associations
- **Commit:** `feat(suppliers): create Supplier model with relationships and scopes`
- **Time:** 1.5 hours

**TASK-004: Create SupplierFactory**

- **Branch:** `feature/suppliers/factory`
- **Description:** Create factory for generating test supplier data
- **Files:**
  - `database/factories/SupplierFactory.php`
- **Acceptance Criteria:**
  - ✓ Factory generates unique supplier codes (SUP0001, SUP0002, etc.)
  - ✓ Generates realistic company names
  - ✓ Generates unique emails
  - ✓ 75% active, 25% inactive distribution
  - ✓ active() state modifier
  - ✓ inactive() state modifier
- **Commit:** `feat(suppliers): add SupplierFactory for test data generation`
- **Time:** 45 minutes

**TASK-005: Create SupplierSeeder**

- **Branch:** `feature/suppliers/seeder`
- **Description:** Create seeder with 5 sample suppliers
- **Files:**
  - `database/seeders/SupplierSeeder.php`
- **Acceptance Criteria:**
  - ✓ Creates 5 diverse supplier records
  - ✓ Includes suppliers from different countries (USA, UK, China, Germany)
  - ✓ 1 inactive supplier for testing
  - ✓ Realistic data (names, emails, phones, addresses)
  - ✓ Sequential codes (SUP0001 to SUP0005)
- **Commit:** `feat(suppliers): add SupplierSeeder with sample data`
- **Time:** 1 hour

**TASK-006: Create SupplierCodeGenerator service**

- **Branch:** `feature/suppliers/code-generator`
- **Description:** Create service for auto-generating sequential supplier codes
- **Files:**
  - `app/Services/SupplierCodeGenerator.php`
- **Acceptance Criteria:**
  - ✓ generate() method returns next code (SUP0001, SUP0002, etc.)
  - ✓ Handles case when no suppliers exist (returns SUP0001)
  - ✓ Extracts numeric part and increments correctly
  - ✓ Pads with leading zeros (4 digits)
  - ✓ Thread-safe with lockForUpdate()
  - ✓ isValid() method validates code format
- **Commit:** `feat(suppliers): add code generator service with validation`
- **Time:** 1 hour

**TASK-007: Run migrations and seed database**

- **Branch:** `feature/suppliers/db-setup`
- **Description:** Execute migrations and populate database with seed data
- **Commands:**
  ```bash
  php artisan migrate
  php artisan db:seed --class=SupplierSeeder
  ```
- **Acceptance Criteria:**
  - ✓ suppliers table created in database
  - ✓ All indexes and constraints applied
  - ✓ 5 supplier records inserted
  - ✓ Can query suppliers successfully
  - ✓ Unique constraints working (test duplicate code/email)
- **Commit:** `chore(suppliers): run migrations and seed test data`
- **Time:** 30 minutes

**TASK-008: Verify database schema**

- **Branch:** `feature/suppliers/schema-verification`
- **Description:** Manually verify database schema matches specifications
- **Verification Steps:**
  - Check all columns exist with correct types
  - Verify indexes created
  - Test unique constraints
  - Verify default values
  - Test enum values
- **Acceptance Criteria:**
  - ✓ Schema matches specification exactly
  - ✓ All constraints working
  - ✓ Can insert valid records
  - ✓ Cannot insert invalid records (duplicate code/email)
- **Commit:** `test(suppliers): verify database schema and constraints`
- **Time:** 30 minutes

---

### Day 2: API Layer (10 tasks)

**TASK-009: Create StoreSupplierRequest**

- **Branch:** `feature/suppliers/store-request`
- **Description:** Create form request for supplier creation validation
- **Files:**
  - `app/Http/Requests/StoreSupplierRequest.php`
- **Acceptance Criteria:**
  - ✓ authorize() returns true
  - ✓ rules() includes all validation rules
  - ✓ name: required|string|min:2|max:255
  - ✓ code: required|string|max:50|regex:/^SUP\d{4}$/|unique:suppliers,code
  - ✓ email: nullable|email:rfc,dns|max:255|unique:suppliers,email
  - ✓ status: required|in:active,inactive
  - ✓ Custom error messages for each rule
- **Commit:** `feat(suppliers): add store request with validation rules`
- **Time:** 45 minutes

**TASK-010: Create UpdateSupplierRequest**

- **Branch:** `feature/suppliers/update-request`
- **Description:** Create form request for supplier update validation
- **Files:**
  - `app/Http/Requests/UpdateSupplierRequest.php`
- **Acceptance Criteria:**
  - ✓ Same rules as StoreSupplierRequest
  - ✓ Unique validation excludes current supplier ID
  - ✓ Uses route model binding to get supplier ID
  - ✓ Custom error messages
- **Commit:** `feat(suppliers): add update request with unique exclusion`
- **Time:** 30 minutes

**TASK-011: Create SupplierResource**

- **Branch:** `feature/suppliers/resource`
- **Description:** Create API resource for consistent JSON responses
- **Files:**
  - `app/Http/Resources/SupplierResource.php`
- **Acceptance Criteria:**
  - ✓ Returns all supplier fields
  - ✓ Formats dates consistently
  - ✓ Includes status_badge attribute
  - ✓ Can be used for single and collection responses
- **Commit:** `feat(suppliers): add API resource for consistent responses`
- **Time:** 30 minutes

**TASK-012: Create SupplierController**

- **Branch:** `feature/suppliers/controller`
- **Description:** Create API controller with CRUD methods
- **Files:**
  - `app/Http/Controllers/SupplierController.php`
- **Acceptance Criteria:**
  - ✓ Controller created with --api flag
  - ✓ Six methods: index, store, show, update, destroy, generateCode
  - ✓ Uses route model binding for show, update, destroy
  - ✓ Uses form requests for validation
  - ✓ Returns JsonResponse for all methods
- **Commit:** `feat(suppliers): create controller with CRUD methods`
- **Time:** 2 hours

**TASK-013: Implement index() method**

- **Branch:** `feature/suppliers/controller-index`
- **Description:** Implement list suppliers with search, filters, pagination
- **Acceptance Criteria:**
  - ✓ Accepts search query parameter
  - ✓ Accepts status filter parameter
  - ✓ Accepts sort_by and sort_order parameters
  - ✓ Accepts page and per_page parameters
  - ✓ Uses search() and byStatus() scopes
  - ✓ Returns paginated results
  - ✓ Returns SupplierResource collection
- **Commit:** `feat(suppliers): implement index with search and filters`
- **Time:** 1 hour

**TASK-014: Implement store() method**

- **Branch:** `feature/suppliers/controller-store`
- **Description:** Implement create supplier endpoint
- **Acceptance Criteria:**
  - ✓ Uses StoreSupplierRequest for validation
  - ✓ Creates supplier record
  - ✓ Returns 201 status code
  - ✓ Returns created supplier in response
  - ✓ Handles validation errors (422)
  - ✓ Returns success message
- **Commit:** `feat(suppliers): implement store method with validation`
- **Time:** 45 minutes

**TASK-015: Implement show() method**

- **Branch:** `feature/suppliers/controller-show`
- **Description:** Implement get single supplier endpoint
- **Acceptance Criteria:**
  - ✓ Uses route model binding
  - ✓ Returns supplier data
  - ✓ Returns 404 if not found
  - ✓ Uses SupplierResource
- **Commit:** `feat(suppliers): implement show method with model binding`
- **Time:** 30 minutes

**TASK-016: Implement update() method**

- **Branch:** `feature/suppliers/controller-update`
- **Description:** Implement update supplier endpoint
- **Acceptance Criteria:**
  - ✓ Uses UpdateSupplierRequest for validation
  - ✓ Uses route model binding
  - ✓ Updates supplier record
  - ✓ Returns updated supplier
  - ✓ Returns success message
  - ✓ Handles validation errors (422)
- **Commit:** `feat(suppliers): implement update method with validation`
- **Time:** 45 minutes

**TASK-017: Implement destroy() method**

- **Branch:** `feature/suppliers/controller-destroy`
- **Description:** Implement delete supplier endpoint with B2B LC check
- **Acceptance Criteria:**
  - ✓ Uses route model binding
  - ✓ Checks if supplier has B2B LCs
  - ✓ Returns 409 Conflict if has B2B LCs
  - ✓ Deletes supplier if no associations
  - ✓ Returns success message
  - ✓ Returns appropriate error message
- **Commit:** `feat(suppliers): implement destroy with association check`
- **Time:** 1 hour

**TASK-018: Implement generateCode() method**

- **Branch:** `feature/suppliers/controller-generate-code`
- **Description:** Implement code generation endpoint
- **Acceptance Criteria:**
  - ✓ Uses SupplierCodeGenerator service
  - ✓ Returns next available code
  - ✓ Returns JSON response
  - ✓ Handles errors gracefully
- **Commit:** `feat(suppliers): implement code generation endpoint`
- **Time:** 30 minutes

---

### Day 3: Testing (12 tasks)

**TASK-019: Create SupplierTest unit tests**

- **Branch:** `feature/suppliers/unit-tests`
- **Description:** Create unit tests for Supplier model
- **Files:**
  - `tests/Unit/SupplierTest.php`
- **Tests:**
  - test_supplier_can_be_created()
  - test_supplier_code_must_be_unique()
  - test_supplier_email_must_be_unique()
  - test_supplier_name_is_required()
  - test_supplier_code_is_required()
  - test_supplier_status_defaults_to_active()
  - test_supplier_can_have_b2b_lcs()
  - test_supplier_active_scope_works()
  - test_supplier_search_scope_works()
  - test_supplier_can_be_activated_deactivated()
- **Commit:** `test(suppliers): add unit tests for Supplier model`
- **Time:** 2 hours

**TASK-020: Test SupplierCodeGenerator**

- **Branch:** `feature/suppliers/test-code-generator`
- **Description:** Unit tests for code generator service
- **Tests:**
  - test_generates_first_code_when_no_suppliers()
  - test_generates_sequential_codes()
  - test_validates_code_format()
  - test_handles_gaps_in_sequence()
- **Commit:** `test(suppliers): add unit tests for code generator`
- **Time:** 1 hour

**TASK-021: Create SupplierControllerTest feature tests**

- **Branch:** `feature/suppliers/feature-tests`
- **Description:** Create feature tests for API endpoints
- **Files:**
  - `tests/Feature/SupplierControllerTest.php`
- **Tests to create:** (Next 10 tasks detail these)
- **Time:** 4 hours total

**TASK-022: Test list suppliers endpoint**

- **Test:** test_can_list_suppliers()
- **Acceptance Criteria:**
  - ✓ GET /api/suppliers returns 200
  - ✓ Returns paginated data
  - ✓ Returns correct structure
- **Commit:** `test(suppliers): add test for list endpoint`

**TASK-023: Test search functionality**

- **Test:** test_can_search_suppliers()
- **Acceptance Criteria:**
  - ✓ Search by name works
  - ✓ Search by code works
  - ✓ Search by country works
  - ✓ Search by email works
- **Commit:** `test(suppliers): add test for search functionality`

**TASK-024: Test status filter**

- **Test:** test_can_filter_suppliers_by_status()
- **Acceptance Criteria:**
  - ✓ Filter by active works
  - ✓ Filter by inactive works
  - ✓ No filter shows all
- **Commit:** `test(suppliers): add test for status filter`

**TASK-025: Test pagination**

- **Test:** test_can_paginate_suppliers()
- **Acceptance Criteria:**
  - ✓ per_page parameter works
  - ✓ page parameter works
  - ✓ Returns correct pagination metadata
- **Commit:** `test(suppliers): add test for pagination`

**TASK-026: Test create supplier**

- **Test:** test_can_create_supplier()
- **Acceptance Criteria:**
  - ✓ POST /api/suppliers with valid data returns 201
  - ✓ Supplier created in database
  - ✓ Returns created supplier
- **Commit:** `test(suppliers): add test for create endpoint`

**TASK-027: Test create validation**

- **Tests:**
  - test_cannot_create_supplier_with_duplicate_code()
  - test_cannot_create_supplier_with_duplicate_email()
  - test_cannot_create_supplier_without_name()
  - test_cannot_create_supplier_without_code()
- **Commit:** `test(suppliers): add validation tests for create`

**TASK-028: Test update supplier**

- **Test:** test_can_update_supplier()
- **Acceptance Criteria:**
  - ✓ PUT /api/suppliers/{id} returns 200
  - ✓ Supplier updated in database
  - ✓ Returns updated supplier
- **Commit:** `test(suppliers): add test for update endpoint`

**TASK-029: Test delete supplier**

- **Test:** test_can_delete_supplier()
- **Acceptance Criteria:**
  - ✓ DELETE /api/suppliers/{id} returns 200
  - ✓ Supplier deleted from database
- **Commit:** `test(suppliers): add test for delete endpoint`

**TASK-030: Test delete restriction**

- **Test:** test_cannot_delete_supplier_with_b2b_lcs()
- **Acceptance Criteria:**
  - ✓ Create supplier with B2B LC
  - ✓ DELETE returns 409
  - ✓ Supplier not deleted
  - ✓ Returns appropriate error message
- **Commit:** `test(suppliers): add test for delete restriction`

---

### Day 4: Backend Polish (6 tasks)

**TASK-031: Add API routes**

- **Branch:** `feature/suppliers/routes`
- **Description:** Add supplier routes to api.php
- **Files:**
  - `routes/api.php`
- **Routes:**
  ```php
  Route::get('/suppliers', [SupplierController::class, 'index']);
  Route::post('/suppliers', [SupplierController::class, 'store']);
  Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
  Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
  Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
  Route::get('/suppliers/generate-code', [SupplierController::class, 'generateCode']);
  ```
- **Commit:** `feat(suppliers): add API routes`
- **Time:** 30 minutes

**TASK-032: Add PHPDoc comments**

- **Branch:** `feature/suppliers/phpdoc`
- **Description:** Add comprehensive PHPDoc to all classes
- **Files:**
  - All controller methods
  - All model methods
  - All service methods
- **Commit:** `docs(suppliers): add PHPDoc comments to all classes`
- **Time:** 1 hour

**TASK-033: Add error logging**

- **Branch:** `feature/suppliers/logging`
- **Description:** Add logging for errors and important events
- **Locations:**
  - Controller exceptions
  - Validation failures
  - Delete restrictions
- **Commit:** `feat(suppliers): add error logging for troubleshooting`
- **Time:** 45 minutes

**TASK-034: Performance optimization**

- **Branch:** `feature/suppliers/performance`
- **Description:** Optimize queries and add caching where appropriate
- **Changes:**
  - Review N+1 query issues
  - Add query result caching
  - Optimize search queries
- **Commit:** `perf(suppliers): optimize database queries and add caching`
- **Time:** 1.5 hours

**TASK-035: Security audit**

- **Branch:** `feature/suppliers/security-audit`
- **Description:** Perform security review of backend code
- **Checks:**
  - SQL injection prevention
  - Mass assignment protection
  - XSS prevention
  - CSRF token validation
- **Commit:** `security(suppliers): complete security audit and fixes`
- **Time:** 1 hour

**TASK-036: Run all tests and verify coverage**

- **Commands:**
  ```bash
  php artisan test --coverage
  phpunit --coverage-html coverage
  ```
- **Acceptance Criteria:**
  - ✓ All tests passing
  - ✓ Coverage >95%
  - ✓ No critical issues found
- **Commit:** `test(suppliers): verify all tests passing with >95% coverage`
- **Time:** 1 hour

---

## Phase 2: Frontend Development (Days 5-7)

### Day 5: Component Setup (8 tasks)

**TASK-037: Create supplier service**

- **Branch:** `feature/suppliers/frontend-service`
- **Description:** Create API service for supplier operations
- **Files:**
  - `frontend/src/services/supplierService.js`
- **Methods:**
  - getAll(params)
  - getById(id)
  - create(data)
  - update(id, data)
  - delete(id)
  - generateCode()
- **Commit:** `feat(suppliers): add frontend supplier API service`
- **Time:** 1 hour

**TASK-038: Create SuppliersList page**

- **Branch:** `feature/suppliers/list-page`
- **Description:** Create main suppliers list page component
- **Files:**
  - `frontend/src/pages/suppliers/SuppliersList.jsx`
- **Initial Structure:**
  - Page layout
  - Header with title and add button
  - Search/filter bar placeholder
  - Table structure
  - Pagination placeholder
- **Commit:** `feat(suppliers): create suppliers list page structure`
- **Time:** 1.5 hours

**TASK-039: Implement search and filter**

- **Branch:** `feature/suppliers/search-filter`
- **Description:** Add search input and status filter
- **Acceptance Criteria:**
  - ✓ Search input with debounce (300ms)
  - ✓ Status dropdown filter
  - ✓ Updates API call with params
  - ✓ Clears filters button
- **Commit:** `feat(suppliers): implement search and status filter`
- **Time:** 1 hour

**TASK-040: Implement data table**

- **Branch:** `feature/suppliers/data-table`
- **Description:** Implement suppliers table with data
- **Acceptance Criteria:**
  - ✓ Fetches data from API
  - ✓ Displays all columns
  - ✓ Status badge with correct colors
  - ✓ Edit and delete buttons
  - ✓ Loading state
  - ✓ Empty state
- **Commit:** `feat(suppliers): implement suppliers data table`
- **Time:** 2 hours

**TASK-041: Implement pagination**

- **Branch:** `feature/suppliers/pagination`
- **Description:** Add pagination controls
- **Acceptance Criteria:**
  - ✓ Page numbers
  - ✓ Previous/next buttons
  - ✓ Items per page selector
  - ✓ Total count display
  - ✓ Updates on page change
- **Commit:** `feat(suppliers): implement pagination controls`
- **Time:** 1 hour

**TASK-042: Create SupplierModal component**

- **Branch:** `feature/suppliers/modal`
- **Description:** Create modal for add/edit supplier
- **Files:**
  - `frontend/src/components/suppliers/SupplierModal.jsx`
- **Structure:**
  - Modal overlay
  - Close handlers
  - Title (dynamic for add/edit)
  - Form placeholder
  - Cancel/save buttons
- **Commit:** `feat(suppliers): create supplier modal component`
- **Time:** 1 hour

**TASK-043: Create SupplierForm component**

- **Branch:** `feature/suppliers/form`
- **Description:** Create form with all supplier fields
- **Files:**
  - `frontend/src/components/suppliers/SupplierForm.jsx`
- **Fields:**
  - Name (required)
  - Code (required, auto-generated)
  - Contact person
  - Email
  - Phone
  - Country (searchable select)
  - Address (textarea)
  - Status (radio buttons)
- **Commit:** `feat(suppliers): create supplier form with all fields`
- **Time:** 2 hours

**TASK-044: Implement form validation**

- **Branch:** `feature/suppliers/form-validation`
- **Description:** Add client-side validation to form
- **Acceptance Criteria:**
  - ✓ Required field validation
  - ✓ Email format validation
  - ✓ Code format validation (SUP\d{4})
  - ✓ Inline error messages
  - ✓ Submit button disabled when invalid
- **Commit:** `feat(suppliers): add form validation with error display`
- **Time:** 1 hour

---

### Day 6: Form Functionality (6 tasks)

**TASK-045: Implement create supplier**

- **Branch:** `feature/suppliers/create-functionality`
- **Description:** Connect create form to API
- **Acceptance Criteria:**
  - ✓ Form submission calls API
  - ✓ Success closes modal and refreshes list
  - ✓ Shows success toast
  - ✓ Handles API errors
  - ✓ Shows validation errors
- **Commit:** `feat(suppliers): implement create supplier functionality`
- **Time:** 1.5 hours

**TASK-046: Implement auto-code generation**

- **Branch:** `feature/suppliers/auto-code`
- **Description:** Auto-populate code field when modal opens
- **Acceptance Criteria:**
  - ✓ Calls generateCode API on modal open
  - ✓ Populates code field
  - ✓ User can edit code
  - ✓ Handles API failure gracefully
- **Commit:** `feat(suppliers): implement auto-code generation`
- **Time:** 1 hour

**TASK-047: Implement edit supplier**

- **Branch:** `feature/suppliers/edit-functionality`
- **Description:** Connect edit form to API
- **Acceptance Criteria:**
  - ✓ Fetches supplier data
  - ✓ Pre-fills form fields
  - ✓ Update API call on save
  - ✓ Success refreshes list
  - ✓ Shows success toast
  - ✓ Handles errors
- **Commit:** `feat(suppliers): implement edit supplier functionality`
- **Time:** 1.5 hours

**TASK-048: Implement delete supplier**

- **Branch:** `feature/suppliers/delete-functionality`
- **Description:** Add delete confirmation and API call
- **Acceptance Criteria:**
  - ✓ Shows confirmation modal
  - ✓ Delete API call on confirm
  - ✓ Success refreshes list
  - ✓ Shows success toast
  - ✓ Handles delete restriction (409)
  - ✓ Shows appropriate error message
- **Commit:** `feat(suppliers): implement delete with confirmation`
- **Time:** 1.5 hours

**TASK-049: Add loading states**

- **Branch:** `feature/suppliers/loading-states`
- **Description:** Add loading indicators throughout UI
- **Locations:**
  - Table loading skeleton
  - Form submit button spinner
  - Modal loading state
  - Button disabled states
- **Commit:** `feat(suppliers): add loading states and spinners`
- **Time:** 1 hour

**TASK-050: Add toast notifications**

- **Branch:** `feature/suppliers/toast-notifications`
- **Description:** Implement toast messages for user feedback
- **Types:**
  - Success: Create, update, delete
  - Error: API failures, validation
  - Info: Loading states
- **Commit:** `feat(suppliers): add toast notification system`
- **Time:** 1 hour

---

### Day 7: UI Polish (6 tasks)

**TASK-051: Match Buyers module styling**

- **Branch:** `feature/suppliers/styling-match`
- **Description:** Ensure pixel-perfect match with Buyers module
- **Tasks:**
  - Side-by-side comparison
  - Adjust spacing, margins, padding
  - Match colors exactly
  - Match font sizes and weights
  - Match button styles
  - Match badge styles
- **Commit:** `style(suppliers): match Buyers module UI exactly`
- **Time:** 2 hours

**TASK-052: Add empty states**

- **Branch:** `feature/suppliers/empty-states`
- **Description:** Design and implement empty states
- **States:**
  - No suppliers found
  - No search results
  - Error loading data
- **Commit:** `feat(suppliers): add empty state designs`
- **Time:** 1 hour

**TASK-053: Responsive design**

- **Branch:** `feature/suppliers/responsive`
- **Description:** Ensure responsive layout on all devices
- **Breakpoints:**
  - Mobile (< 768px)
  - Tablet (768px - 1024px)
  - Desktop (> 1024px)
- **Commit:** `style(suppliers): implement responsive design`
- **Time:** 1.5 hours

**TASK-054: Add to navigation menu**

- **Branch:** `feature/suppliers/navigation`
- **Description:** Add Suppliers menu item to sidebar
- **Files:**
  - `frontend/src/components/layout/Sidebar.jsx`
- **Acceptance Criteria:**
  - ✓ Suppliers item below Buyers
  - ✓ Correct icon
  - ✓ Active state highlighting
  - ✓ Click navigates to /suppliers
- **Commit:** `feat(suppliers): add Suppliers to navigation menu`
- **Time:** 30 minutes

**TASK-055: Accessibility improvements**

- **Branch:** `feature/suppliers/accessibility`
- **Description:** Add accessibility features
- **Features:**
  - ARIA labels
  - Keyboard navigation
  - Focus management
  - Screen reader support
- **Commit:** `feat(suppliers): add accessibility improvements`
- **Time:** 1.5 hours

**TASK-056: Frontend code review**

- **Description:** Review and refactor frontend code
- **Tasks:**
  - Extract reusable components
  - Optimize re-renders
  - Add PropTypes or TypeScript types
  - Code cleanup
- **Commit:** `refactor(suppliers): code review and optimization`
- **Time:** 1.5 hours

---

## Phase 3: B2B-LC Integration (Days 8-13)

### Day 8: Backend Integration (6 tasks)

**TASK-057: Create migration for supplier_id**

- **Branch:** `feature/b2b-lc/add-supplier-id`
- **Description:** Add supplier_id column to b2b_lcs table
- **Files:**
  - `database/migrations/YYYY_MM_DD_HHMMSS_add_supplier_id_to_b2b_lcs_table.php`
- **Acceptance Criteria:**
  - ✓ Adds nullable supplier_id column
  - ✓ Adds index on supplier_id
  - ✓ Up and down methods
- **Commit:** `feat(b2b-lc): add supplier_id column to b2b_lcs table`
- **Time:** 30 minutes

**TASK-058: Update B2BLC model**

- **Branch:** `feature/b2b-lc/supplier-relationship`
- **Description:** Add supplier relationship to B2BLC model
- **Files:**
  - `app/Models/B2BLC.php`
- **Changes:**
  - Add supplier_id to $fillable
  - Add supplier() relationship method
  - Add supplier to $with array
- **Commit:** `feat(b2b-lc): add supplier relationship to B2BLC model`
- **Time:** 30 minutes

**TASK-059: Create foreign key migration**

- **Branch:** `feature/b2b-lc/supplier-foreign-key`
- **Description:** Add foreign key constraint
- **Files:**
  - `database/migrations/YYYY_MM_DD_HHMMSS_add_supplier_foreign_key_to_b2b_lcs_table.php`
- **Acceptance Criteria:**
  - ✓ Adds foreign key constraint
  - ✓ ON DELETE RESTRICT
  - ✓ ON UPDATE CASCADE
- **Commit:** `feat(b2b-lc): add supplier foreign key constraint`
- **Time:** 30 minutes

**TASK-060: Update B2BLC validation**

- **Branch:** `feature/b2b-lc/supplier-validation`
- **Description:** Add supplier_id to form request validation
- **Files:**
  - `app/Http/Requests/StoreB2BLCRequest.php`
  - `app/Http/Requests/UpdateB2BLCRequest.php`
- **Rules:**
  ```php
  'supplier_id' => 'nullable|exists:suppliers,id',
  ```
- **Commit:** `feat(b2b-lc): add supplier_id validation rules`
- **Time:** 30 minutes

**TASK-061: Update B2BLC controller**

- **Branch:** `feature/b2b-lc/supplier-controller`
- **Description:** Update controller to handle supplier
- **Changes:**
  - Eager load supplier in index, show
  - Handle supplier_id in store, update
- **Commit:** `feat(b2b-lc): update controller for supplier integration`
- **Time:** 1 hour

**TASK-062: Update B2BLC resource**

- **Branch:** `feature/b2b-lc/supplier-resource`
- **Description:** Include supplier in API responses
- **Files:**
  - `app/Http/Resources/B2BLCResource.php`
- **Acceptance Criteria:**
  - ✓ Includes supplier object when present
  - ✓ Null handling when no supplier
- **Commit:** `feat(b2b-lc): include supplier in API responses`
- **Time:** 30 minutes

---

### Day 9-10: Frontend Integration (8 tasks)

**TASK-063: Add supplier dropdown to B2B-LC form**

- **Branch:** `feature/b2b-lc/supplier-dropdown`
- **Description:** Add supplier selection field to form
- **Files:**
  - `frontend/src/pages/b2b-lc/B2BLCForm.jsx`
- **Acceptance Criteria:**
  - ✓ Searchable supplier dropdown
  - ✓ Shows supplier code + name
  - ✓ Fetches active suppliers
  - ✓ Positioned correctly in form
- **Commit:** `feat(b2b-lc): add supplier dropdown to form`
- **Time:** 1.5 hours

**TASK-064: Implement auto-fill logic**

- **Branch:** `feature/b2b-lc/supplier-autofill`
- **Description:** Auto-populate fields when supplier selected
- **Fields to auto-fill:**
  - Supplier name
  - Country
  - Contact person
- **Acceptance Criteria:**
  - ✓ handleSupplierChange updates form state
  - ✓ Fields remain editable after auto-fill
  - ✓ Clear button resets fields
- **Commit:** `feat(b2b-lc): implement supplier auto-fill functionality`
- **Time:** 1.5 hours

**TASK-065: Style supplier section**

- **Branch:** `feature/b2b-lc/supplier-styling`
- **Description:** Match styling with existing form sections
- **Acceptance Criteria:**
  - ✓ Grouped in card/section
  - ✓ Section heading
  - ✓ Consistent spacing
  - ✓ Matches design system
- **Commit:** `style(b2b-lc): style supplier section in form`
- **Time:** 1 hour

**TASK-066: Add supplier column to list**

- **Branch:** `feature/b2b-lc/supplier-list-column`
- **Description:** Add supplier column to B2B-LC list table
- **Acceptance Criteria:**
  - ✓ Shows supplier code + name
  - ✓ Handles null supplier
  - ✓ Links to supplier detail (optional)
  - ✓ Sortable column
- **Commit:** `feat(b2b-lc): add supplier column to list view`
- **Time:** 1 hour

**TASK-067: Add supplier to detail view**

- **Branch:** `feature/b2b-lc/supplier-detail`
- **Description:** Display supplier information in detail view
- **Acceptance Criteria:**
  - ✓ Supplier information section
  - ✓ Shows all supplier fields
  - ✓ Styled consistently
  - ✓ Handles null supplier
- **Commit:** `feat(b2b-lc): add supplier info to detail view`
- **Time:** 1 hour

**TASK-068: Test create B2B-LC with supplier**

- **Description:** Manual testing of create flow
- **Test Cases:**
  - Create with supplier selected
  - Create without supplier
  - Verify auto-fill works
  - Verify save includes supplier_id
  - Verify supplier shows in list
- **Time:** 1 hour

**TASK-069: Test edit B2B-LC supplier**

- **Description:** Manual testing of edit flow
- **Test Cases:**
  - Edit and change supplier
  - Edit and clear supplier
  - Verify auto-fill updates
  - Verify changes saved
- **Time:** 1 hour

**TASK-070: Add supplier filter to B2B-LC list**

- **Branch:** `feature/b2b-lc/supplier-filter`
- **Description:** Add filter dropdown for supplier
- **Acceptance Criteria:**
  - ✓ Supplier dropdown filter
  - ✓ "All Suppliers" option
  - ✓ Filters API results
- **Commit:** `feat(b2b-lc): add supplier filter to list view`
- **Time:** 1 hour

---

## Phase 4: Testing & QA (Days 14-16)

### Day 14: E2E Tests (6 tasks)

**TASK-071: Create supplier E2E tests**

- **Branch:** `feature/suppliers/e2e-tests`
- **Description:** Comprehensive E2E tests for supplier module
- **Files:**
  - `tests/e2e/suppliers.spec.js`
- **Tests:** See next tasks for breakdown
- **Time:** 4 hours total

**TASK-072: E2E test - Navigation and list**

- **Test:** Navigate to suppliers page and verify list loads
- **Steps:**
  - Click Suppliers menu item
  - Verify URL is /suppliers
  - Verify page title
  - Verify table loads
  - Verify data displayed

**Commit:** `test(suppliers): add E2E test for navigation and list`

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Total Tasks:** 72 detailed tasks across 18 days
**Status:** Ready for Implementation
