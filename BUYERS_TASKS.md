# Buyers Module - Development Tasks

**Project:** LC Management System  
**Module:** Buyers Management  
**Version:** 1.0.0  
**Date:** December 11, 2025  
**Total Tasks:** 55

---

## 📋 Task Legend

| Status      | Symbol | Description               |
| ----------- | ------ | ------------------------- |
| Not Started | ⬜     | Task not yet begun        |
| In Progress | 🔄     | Currently being worked on |
| Completed   | ✅     | Task finished             |
| Blocked     | 🚫     | Waiting on dependency     |

---

## 🗄️ Phase 1: Backend - Database Layer

### Task 1.1: Create Database Migration

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Assignee:** Backend Developer

**Description:**
Create Laravel migration for the `buyers` table with all required columns.

**Acceptance Criteria:**

- [ ] Migration file created with timestamp
- [ ] All columns defined per data model
- [ ] Unique constraint on `code` column
- [ ] Indexes on `status`, `name`, `country`
- [ ] Migration runs without errors
- [ ] Rollback works correctly

**Technical Notes:**

```bash
php artisan make:migration create_buyers_table
```

---

### Task 1.2: Run and Verify Migration

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 10 minutes  
**Depends On:** Task 1.1

**Description:**
Execute migration and verify table structure in database.

**Acceptance Criteria:**

- [ ] `php artisan migrate` executes successfully
- [ ] Table exists in database
- [ ] All columns have correct types
- [ ] Indexes created properly

---

## 🏗️ Phase 2: Backend - Model Layer

### Task 2.1: Create Buyer Model

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 1.2

**Description:**
Create Eloquent model with fillable fields, casts, and relationships.

**Acceptance Criteria:**

- [ ] Model file created at `app/Models/Buyer.php`
- [ ] `$fillable` array includes all editable fields
- [ ] `$casts` configured for timestamps
- [ ] Table name explicitly set
- [ ] Timestamps enabled

**Technical Notes:**

```bash
php artisan make:model Buyer
```

---

### Task 2.2: Add Model Scopes

**Status:** ⬜ Not Started  
**Priority:** P1 - High  
**Estimated Time:** 20 minutes  
**Depends On:** Task 2.1

**Description:**
Implement query scopes for filtering and searching.

**Acceptance Criteria:**

- [ ] `scopeActive()` - Filter active buyers
- [ ] `scopeInactive()` - Filter inactive buyers
- [ ] `scopeSearch($query, $search)` - Search by name/code/country/email
- [ ] Scopes are chainable

---

### Task 2.3: Add Model Relationships

**Status:** ⬜ Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 15 minutes  
**Depends On:** Task 2.1

**Description:**
Define relationships to other models (if applicable).

**Acceptance Criteria:**

- [ ] `contracts()` hasMany relationship defined
- [ ] `canDelete()` helper method checks for references

---

## ✅ Phase 3: Backend - Validation Layer

### Task 3.1: Create StoreBuyerRequest

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 2.1

**Description:**
Create form request for validating buyer creation.

**Acceptance Criteria:**

- [ ] File created at `app/Http/Requests/StoreBuyerRequest.php`
- [ ] `authorize()` returns true
- [ ] All validation rules defined
- [ ] `name` required, max 255
- [ ] `code` required, unique, max 50
- [ ] `email` nullable, email format
- [ ] `status` required, in:active,inactive

**Technical Notes:**

```bash
php artisan make:request StoreBuyerRequest
```

---

### Task 3.2: Create UpdateBuyerRequest

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 3.1

**Description:**
Create form request for validating buyer updates.

**Acceptance Criteria:**

- [ ] File created at `app/Http/Requests/UpdateBuyerRequest.php`
- [ ] `authorize()` returns true
- [ ] Same rules as store, but code unique ignores current ID
- [ ] Uses `Rule::unique('buyers')->ignore($this->buyer)`

---

## 🎮 Phase 4: Backend - Controller Layer

### Task 4.1: Create BuyerController

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes  
**Depends On:** Task 3.2

**Description:**
Create resource controller for Buyer CRUD operations.

**Acceptance Criteria:**

- [ ] File created at `app/Http/Controllers/BuyerController.php`
- [ ] Controller extends base Controller
- [ ] OpenAPI annotations added (or documented separately)

**Technical Notes:**

```bash
php artisan make:controller BuyerController --resource
```

---

### Task 4.2: Implement index() Method

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 4.1

**Description:**
Implement listing with pagination, search, and status filter.

**Acceptance Criteria:**

- [ ] Returns paginated results (15 per page)
- [ ] Accepts `search` query parameter
- [ ] Accepts `status` query parameter
- [ ] Accepts `per_page` query parameter
- [ ] Orders by `name` ascending by default
- [ ] Returns proper JSON structure

**Expected Response:**

```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 72
}
```

---

### Task 4.3: Implement store() Method

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 4.2

**Description:**
Implement buyer creation with validation.

**Acceptance Criteria:**

- [ ] Uses `StoreBuyerRequest` for validation
- [ ] Creates buyer from validated data
- [ ] Returns created buyer with 201 status
- [ ] Returns validation errors with 422 status

---

### Task 4.4: Implement show() Method

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes  
**Depends On:** Task 4.3

**Description:**
Implement single buyer retrieval.

**Acceptance Criteria:**

- [ ] Returns buyer by ID
- [ ] Returns 404 if not found
- [ ] Returns full buyer object

---

### Task 4.5: Implement update() Method

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 4.4

**Description:**
Implement buyer update with validation.

**Acceptance Criteria:**

- [ ] Uses `UpdateBuyerRequest` for validation
- [ ] Updates buyer from validated data
- [ ] Returns updated buyer with 200 status
- [ ] Handles unique code constraint properly

---

### Task 4.6: Implement destroy() Method

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 4.5

**Description:**
Implement buyer deletion with reference check.

**Acceptance Criteria:**

- [ ] Checks if buyer is referenced by contracts
- [ ] Returns 409 Conflict if referenced
- [ ] Deletes buyer if not referenced
- [ ] Returns 204 No Content on success

---

## 🛤️ Phase 5: Backend - Routes

### Task 5.1: Register API Routes

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes  
**Depends On:** Task 4.6

**Description:**
Add buyer routes to `routes/api.php`.

**Acceptance Criteria:**

- [ ] GET `/api/buyers` → index
- [ ] POST `/api/buyers` → store
- [ ] GET `/api/buyers/{buyer}` → show
- [ ] PUT `/api/buyers/{buyer}` → update
- [ ] DELETE `/api/buyers/{buyer}` → destroy
- [ ] Routes grouped with prefix

---

### Task 5.2: Test API Endpoints

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 5.1

**Description:**
Manually test all endpoints using Postman or similar tool.

**Acceptance Criteria:**

- [ ] List returns paginated buyers
- [ ] Create works with valid data
- [ ] Create fails with invalid data
- [ ] Update works correctly
- [ ] Delete works for unreferenced buyers
- [ ] Delete fails for referenced buyers

---

## 🌐 Phase 6: Frontend - API Service

### Task 6.1: Create Buyer Service

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 5.2

**Description:**
Create JavaScript service for buyer API calls.

**Acceptance Criteria:**

- [ ] File created at `src/services/buyerService.js`
- [ ] `getBuyers(params)` - List with filters
- [ ] `getBuyer(id)` - Single buyer
- [ ] `createBuyer(data)` - Create
- [ ] `updateBuyer(id, data)` - Update
- [ ] `deleteBuyer(id)` - Delete
- [ ] Uses axios with base URL

---

## 📄 Phase 7: Frontend - List Page

### Task 7.1: Create Buyers Page Component

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 6.1

**Description:**
Create main Buyers page with basic structure.

**Acceptance Criteria:**

- [ ] File created at `src/pages/Buyers.jsx`
- [ ] Page title "Buyers"
- [ ] Basic layout with card container
- [ ] Exports default component

---

### Task 7.2: Implement Search Bar

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 7.1

**Description:**
Add search input with debounced filtering.

**Acceptance Criteria:**

- [ ] Search input with placeholder
- [ ] Debounced search (300ms)
- [ ] Triggers API call on change
- [ ] Clears on empty

---

### Task 7.3: Implement Status Filter

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes  
**Depends On:** Task 7.2

**Description:**
Add dropdown for filtering by status.

**Acceptance Criteria:**

- [ ] Dropdown with All/Active/Inactive options
- [ ] Default to "All"
- [ ] Triggers API call on change
- [ ] Works with search filter

---

### Task 7.4: Implement Data Table

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 45 minutes  
**Depends On:** Task 7.3

**Description:**
Create data table with all columns.

**Acceptance Criteria:**

- [ ] Table with 8 columns
- [ ] Name column displayed
- [ ] Code column displayed
- [ ] Country column displayed
- [ ] Contact Person column displayed
- [ ] Email column displayed
- [ ] Phone column displayed
- [ ] Status badge (green/red)
- [ ] Action column with Edit/Delete buttons
- [ ] Proper column widths

---

### Task 7.5: Implement Pagination

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 7.4

**Description:**
Add pagination controls below table.

**Acceptance Criteria:**

- [ ] Previous/Next buttons
- [ ] Page numbers
- [ ] Current page indicator
- [ ] Total records display
- [ ] Disabled state for buttons

---

### Task 7.6: Implement Add Button

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 10 minutes  
**Depends On:** Task 7.5

**Description:**
Add "+ Add New Buyer" button.

**Acceptance Criteria:**

- [ ] Button positioned top-right
- [ ] Blue/primary color
- [ ] Opens add modal on click

---

### Task 7.7: Add Loading State

**Status:** ⬜ Not Started  
**Priority:** P1 - High  
**Estimated Time:** 15 minutes  
**Depends On:** Task 7.6

**Description:**
Show loading indicator while fetching data.

**Acceptance Criteria:**

- [ ] Spinner/skeleton while loading
- [ ] Table content replaced during load
- [ ] Smooth transition

---

### Task 7.8: Add Empty State

**Status:** ⬜ Not Started  
**Priority:** P1 - High  
**Estimated Time:** 15 minutes  
**Depends On:** Task 7.7

**Description:**
Show message when no buyers found.

**Acceptance Criteria:**

- [ ] "No buyers found" message
- [ ] Different message for search/filter
- [ ] Clean centered design

---

## 🔲 Phase 8: Frontend - Modal Components

### Task 8.1: Create BuyerModal Component

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 7.8

**Description:**
Create reusable modal for add/edit buyer.

**Acceptance Criteria:**

- [ ] File at `src/components/buyers/BuyerModal.jsx`
- [ ] Accepts `isOpen`, `onClose`, `buyer`, `onSave` props
- [ ] Dynamic title based on mode
- [ ] Modal overlay with centered content

---

### Task 8.2: Implement Modal Form Fields

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 45 minutes  
**Depends On:** Task 8.1

**Description:**
Add all form fields to modal.

**Acceptance Criteria:**

- [ ] Name field (text, required)
- [ ] Code field (text, required)
- [ ] Contact Person field (text)
- [ ] Email field (email)
- [ ] Phone field (text)
- [ ] Country field (text)
- [ ] Address field (textarea)
- [ ] Status field (dropdown, required)
- [ ] Required fields marked with \*

---

### Task 8.3: Implement Form Validation

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 8.2

**Description:**
Add client-side validation to form.

**Acceptance Criteria:**

- [ ] Name required error
- [ ] Code required error
- [ ] Email format validation
- [ ] Status required error
- [ ] Error messages displayed below fields
- [ ] Red border on invalid fields

---

### Task 8.4: Implement Form Submission

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 30 minutes  
**Depends On:** Task 8.3

**Description:**
Handle form submission with API call.

**Acceptance Criteria:**

- [ ] Submit button enabled when valid
- [ ] Loading state during submission
- [ ] Success closes modal
- [ ] Success shows toast notification
- [ ] Error shows error message
- [ ] Refreshes list after success

---

### Task 8.5: Implement Edit Mode

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 8.4

**Description:**
Populate form with existing buyer data.

**Acceptance Criteria:**

- [ ] Form pre-filled when editing
- [ ] Title shows "Edit Buyer"
- [ ] Calls update API instead of create
- [ ] Handles API errors

---

### Task 8.6: Implement Delete Confirmation

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 20 minutes  
**Depends On:** Task 8.5

**Description:**
Add delete confirmation dialog.

**Acceptance Criteria:**

- [ ] Confirmation modal appears on delete click
- [ ] Shows buyer name in message
- [ ] Cancel button closes dialog
- [ ] Confirm button deletes buyer
- [ ] Shows error if buyer is referenced

---

## 🧭 Phase 9: Frontend - Navigation & Routing

### Task 9.1: Add Route to App.jsx

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 10 minutes  
**Depends On:** Task 8.6

**Description:**
Add route for Buyers page.

**Acceptance Criteria:**

- [ ] Import Buyers component
- [ ] Add route `/buyers`
- [ ] Wrapped in layout component

---

### Task 9.2: Add Sidebar Navigation

**Status:** ⬜ Not Started  
**Priority:** P0 - Critical  
**Estimated Time:** 15 minutes  
**Depends On:** Task 9.1

**Description:**
Add Buyers link to sidebar.

**Acceptance Criteria:**

- [ ] "Buyers" menu item added
- [ ] Appropriate icon (users/building)
- [ ] Positioned logically in menu
- [ ] Active state on current page

---

## 🧪 Phase 10: Testing

### Task 10.1: Create BuyerTest Feature Test

**Status:** ⬜ Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 60 minutes  
**Depends On:** Task 9.2

**Description:**
Create feature tests for buyer API.

**Acceptance Criteria:**

- [ ] Test list buyers
- [ ] Test create buyer success
- [ ] Test create buyer validation failure
- [ ] Test update buyer
- [ ] Test delete buyer
- [ ] Test delete referenced buyer fails

---

### Task 10.2: Manual End-to-End Testing

**Status:** ⬜ Not Started  
**Priority:** P1 - High  
**Estimated Time:** 45 minutes  
**Depends On:** Task 10.1

**Description:**
Manually test complete workflow.

**Acceptance Criteria:**

- [ ] Navigate to Buyers page
- [ ] Create new buyer
- [ ] Edit existing buyer
- [ ] Search for buyer
- [ ] Filter by status
- [ ] Delete unreferenced buyer
- [ ] Attempt delete referenced buyer
- [ ] Pagination works
- [ ] No console errors

---

### Task 10.3: Cross-Browser Testing

**Status:** ⬜ Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 30 minutes  
**Depends On:** Task 10.2

**Description:**
Test in multiple browsers.

**Acceptance Criteria:**

- [ ] Chrome - all features work
- [ ] Firefox - all features work
- [ ] Edge - all features work
- [ ] Safari - all features work (if applicable)

---

## 📚 Phase 11: Documentation & Cleanup

### Task 11.1: Add OpenAPI Documentation

**Status:** ⬜ Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 30 minutes  
**Depends On:** Task 10.3

**Description:**
Add Swagger annotations to controller.

**Acceptance Criteria:**

- [ ] All endpoints documented
- [ ] Request/response schemas defined
- [ ] Swagger UI accessible

---

### Task 11.2: Code Cleanup

**Status:** ⬜ Not Started  
**Priority:** P2 - Medium  
**Estimated Time:** 20 minutes  
**Depends On:** Task 11.1

**Description:**
Clean up code, remove debug statements.

**Acceptance Criteria:**

- [ ] No console.log statements
- [ ] No commented code
- [ ] Consistent formatting
- [ ] ESLint passes

---

### Task 11.3: Create Database Seeder (Optional)

**Status:** ⬜ Not Started  
**Priority:** P3 - Low  
**Estimated Time:** 20 minutes  
**Depends On:** Task 11.2

**Description:**
Create seeder for sample buyer data.

**Acceptance Criteria:**

- [ ] Creates 5-10 sample buyers
- [ ] Mix of active/inactive
- [ ] Realistic data

---

## 📊 Task Summary

| Phase                   | Tasks | Priority Mix     |
| ----------------------- | ----- | ---------------- |
| Phase 1: Database       | 2     | 2 P0             |
| Phase 2: Model          | 3     | 1 P0, 1 P1, 1 P2 |
| Phase 3: Validation     | 2     | 2 P0             |
| Phase 4: Controller     | 6     | 6 P0             |
| Phase 5: Routes         | 2     | 2 P0             |
| Phase 6: API Service    | 1     | 1 P0             |
| Phase 7: List Page      | 8     | 6 P0, 2 P1       |
| Phase 8: Modals         | 6     | 6 P0             |
| Phase 9: Navigation     | 2     | 2 P0             |
| Phase 10: Testing       | 3     | 1 P1, 2 P2       |
| Phase 11: Documentation | 3     | 2 P2, 1 P3       |

**Total Tasks:** 38 main tasks + 17 sub-tasks = **55 items**

---

## 🏁 Completion Criteria

All the following must be true for module completion:

- [ ] All P0 tasks completed
- [ ] All P1 tasks completed
- [ ] API fully functional
- [ ] UI matches specification
- [ ] No critical bugs
- [ ] Code reviewed
- [ ] Tests passing

---

**End of Tasks Document**
