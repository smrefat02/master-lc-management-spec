# B2B LC Module - Implementation Tasks

**Project:** LC Management System  
**Module:** B2B LC Management  
**Date:** December 10, 2025  
**Task Tracking:** Checklist Format

---

## 🗂️ Task Categories

1. [Database & Models](#database--models)
2. [Backend API](#backend-api)
3. [Frontend - List Page](#frontend---list-page)
4. [Frontend - Create Page](#frontend---create-page)
5. [Frontend - Detail Page](#frontend---detail-page)
6. [Testing](#testing)
7. [Documentation](#documentation)

---

## 📊 Database & Models

### Task 1.1: Create Migration File

**Priority:** 🔴 Critical  
**Estimated Time:** 30 minutes

- [ ] Run: `php artisan make:migration create_b2b_lcs_table`
- [ ] Open migration file in `database/migrations/`
- [ ] Add 11 columns as specified:
  - [ ] `id` (primary key)
  - [ ] `contract_id` (foreign key)
  - [ ] `order_id` (foreign key)
  - [ ] `costing_detail_id` (big integer)
  - [ ] `pi_number` (string, unique)
  - [ ] `supplier` (string)
  - [ ] `order_qty` (integer)
  - [ ] `fob_value` (decimal 15,2)
  - [ ] `order_value` (decimal 15,2)
  - [ ] `post_pi_value` (decimal 15,2)
  - [ ] `b2b_percent` (decimal 5,2)
  - [ ] `status` (enum)
  - [ ] `timestamps` (created_at, updated_at)
- [ ] Add foreign key constraints with cascade delete
- [ ] Add indexes on: pi_number, supplier, status, contract_id+order_id
- [ ] Add comment for costing_detail_id explaining JSON reference
- [ ] Save file

**Acceptance Criteria:**

- Migration file compiles without errors
- All column types match specification
- Foreign keys reference correct tables

---

### Task 1.2: Run Migration

**Priority:** 🔴 Critical  
**Estimated Time:** 5 minutes

- [ ] Run: `php artisan migrate`
- [ ] Verify no errors in console output
- [ ] Open database tool (TablePlus/PhpMyAdmin/MySQL Workbench)
- [ ] Verify `b2b_lcs` table exists
- [ ] Check all columns are created
- [ ] Verify indexes are created
- [ ] Check foreign key constraints exist

**Acceptance Criteria:**

- Table visible in database
- All 13 columns present (11 + id + timestamps)
- Indexes show in database structure

---

### Task 1.3: Create B2BLC Model

**Priority:** 🔴 Critical  
**Estimated Time:** 45 minutes

- [ ] Run: `php artisan make:model B2BLC`
- [ ] Open `app/Models/B2BLC.php`
- [ ] Set table name: `protected $table = 'b2b_lcs';`
- [ ] Add fillable array with all 11 fields
- [ ] Add casts array:
  - [ ] order_qty → integer
  - [ ] fob_value → decimal:2
  - [ ] order_value → decimal:2
  - [ ] post_pi_value → decimal:2
  - [ ] b2b_percent → decimal:2
- [ ] Add relationships:
  - [ ] `contract()` → belongsTo(Contract::class)
  - [ ] `order()` → belongsTo(Order::class)
- [ ] Add accessors:
  - [ ] `getFormattedOrderValueAttribute()` returns "$X.XX"
  - [ ] `getFormattedB2BPercentAttribute()` returns "X.XX%"
- [ ] Add scopes:
  - [ ] `scopeSearch($query, $search)` for PI/Supplier search
  - [ ] `scopeByStatus($query, $status)` for status filter
- [ ] Save file

**Acceptance Criteria:**

- Model loads without errors
- Relationships work in tinker
- Accessors format correctly
- Scopes filter properly

**Test Command:**

```bash
php artisan tinker
>>> $lc = App\Models\B2BLC::first();
>>> $lc->contract;
>>> $lc->order;
```

---

## 🔧 Backend API

### Task 2.1: Create Store Request Validation

**Priority:** 🔴 Critical  
**Estimated Time:** 30 minutes

- [ ] Run: `php artisan make:request StoreB2BLCRequest`
- [ ] Open `app/Http/Requests/StoreB2BLCRequest.php`
- [ ] Set `authorize()` to return `true`
- [ ] Add validation rules in `rules()` method:
  - [ ] contract_id: required, exists:contracts,id
  - [ ] order_id: required, exists:orders,id
  - [ ] costing_detail_id: required, integer
  - [ ] pi_number: required, string, unique:b2b_lcs, max:255
  - [ ] supplier: required, string, min:2, max:255
  - [ ] order_qty: required, integer, min:1
  - [ ] fob_value: required, numeric, min:0
  - [ ] order_value: nullable, numeric, min:0
  - [ ] post_pi_value: required, numeric, min:0
  - [ ] b2b_percent: nullable, numeric, min:0, max:100
  - [ ] status: nullable, in:draft,active,completed,cancelled
- [ ] Add custom error messages in `messages()` method
- [ ] Save file

**Acceptance Criteria:**

- Validation rejects invalid data
- Custom error messages display correctly
- Required fields enforced

---

### Task 2.2: Create Update Request Validation

**Priority:** 🔴 Critical  
**Estimated Time:** 20 minutes

- [ ] Run: `php artisan make:request UpdateB2BLCRequest`
- [ ] Open `app/Http/Requests/UpdateB2BLCRequest.php`
- [ ] Copy rules from StoreB2BLCRequest
- [ ] Change all `required` to `sometimes`
- [ ] Update pi_number rule to use `Rule::unique()->ignore()`
- [ ] Save file

**Acceptance Criteria:**

- Partial updates allowed
- PI number uniqueness excludes current record
- All other validations work

---

### Task 2.3: Create B2BLC Controller

**Priority:** 🔴 Critical  
**Estimated Time:** 2 hours

- [ ] Run: `php artisan make:controller B2BLCController --api`
- [ ] Open `app/Http/Controllers/B2BLCController.php`
- [ ] Import required classes (B2BLC model, Requests)
- [ ] Implement `index()` method:
  - [ ] Accept filters: pi_number, supplier, status
  - [ ] Add search queries
  - [ ] Eager load: contract, order
  - [ ] Add pagination (15 per page)
  - [ ] Return JSON response
  - [ ] Add Swagger @OA\Get annotation
- [ ] Implement `store()` method:
  - [ ] Accept StoreB2BLCRequest
  - [ ] Calculate order_value if not provided
  - [ ] Calculate b2b_percent if not provided
  - [ ] Create B2BLC record
  - [ ] Return JSON with created record
  - [ ] Add Swagger @OA\Post annotation
- [ ] Implement `show()` method:
  - [ ] Accept B2BLC $b2bLC (route model binding)
  - [ ] Eager load relationships
  - [ ] Return JSON
  - [ ] Add Swagger @OA\Get annotation
- [ ] Implement `update()` method:
  - [ ] Accept UpdateB2BLCRequest
  - [ ] Recalculate order_value if qty or fob changed
  - [ ] Recalculate b2b_percent if values changed
  - [ ] Update record
  - [ ] Return JSON
  - [ ] Add Swagger @OA\Put annotation
- [ ] Implement `destroy()` method:
  - [ ] Delete record
  - [ ] Return success message
  - [ ] Add Swagger @OA\Delete annotation
- [ ] Save file

**Acceptance Criteria:**

- All 5 methods work correctly
- Calculations accurate
- Swagger annotations complete
- Error handling present

**Test with Postman:**

- [ ] GET /api/b2b-lc (list)
- [ ] POST /api/b2b-lc (create)
- [ ] GET /api/b2b-lc/{id} (show)
- [ ] PUT /api/b2b-lc/{id} (update)
- [ ] DELETE /api/b2b-lc/{id} (delete)

---

### Task 2.4: Add API Routes

**Priority:** 🔴 Critical  
**Estimated Time:** 10 minutes

- [ ] Open `backend/routes/api.php`
- [ ] Add import: `use App\Http\Controllers\B2BLCController;`
- [ ] Add route: `Route::apiResource('b2b-lc', B2BLCController::class);`
- [ ] Save file
- [ ] Run: `php artisan route:list | grep b2b-lc`
- [ ] Verify 5 routes created

**Expected Routes:**

```
GET    /api/b2b-lc            → index
POST   /api/b2b-lc            → store
GET    /api/b2b-lc/{id}       → show
PUT    /api/b2b-lc/{id}       → update
DELETE /api/b2b-lc/{id}       → destroy
```

**Acceptance Criteria:**

- All 5 routes visible
- Routes accessible via API

---

## 🎨 Frontend - List Page

### Task 3.1: Create B2BLCList Component

**Priority:** 🟡 High  
**Estimated Time:** 1 hour

- [ ] Create file: `frontend/src/pages/B2BLCList.jsx`
- [ ] Import required hooks: useState, useEffect, useNavigate
- [ ] Set up state variables:
  - [ ] b2bLCs (array)
  - [ ] loading (boolean)
  - [ ] filters (object: piNumber, supplier)
  - [ ] pagination (object: currentPage, perPage, total)
- [ ] Create basic component structure
- [ ] Add page title in header
- [ ] Save file

**Acceptance Criteria:**

- Component renders without errors
- State variables initialized

---

### Task 3.2: Build Header Section

**Priority:** 🟡 High  
**Estimated Time:** 20 minutes

- [ ] Add header div with flex justify-between
- [ ] Add page title: "B2B LC List" (text-2xl font-bold)
- [ ] Add "Create B2B LC" button (bg-indigo-600)
- [ ] Style button: px-4 py-2 rounded text-white
- [ ] Add hover effect: hover:bg-indigo-700
- [ ] Add onClick to navigate to /b2b-lc/create
- [ ] Test button navigation

**Acceptance Criteria:**

- Header displays correctly
- Button navigates to create page
- Styling matches screenshot

---

### Task 3.3: Build Filters Section

**Priority:** 🟡 High  
**Estimated Time:** 30 minutes

- [ ] Create filters card (bg-white rounded shadow-sm p-4)
- [ ] Add grid layout: `grid grid-cols-1 md:grid-cols-3 gap-4`
- [ ] Add PI Number input:
  - [ ] placeholder: "Search by PI Number"
  - [ ] value: filters.piNumber
  - [ ] onChange: update filters state
- [ ] Add Supplier input:
  - [ ] placeholder: "Search by Supplier"
  - [ ] value: filters.supplier
  - [ ] onChange: update filters state
- [ ] Add Search button (bg-indigo-600 text-white)
- [ ] Add onClick handler to fetch filtered data
- [ ] Test filter functionality

**Acceptance Criteria:**

- Filters display in row on desktop
- Inputs update state correctly
- Search button triggers API call

---

### Task 3.4: Build Table Component

**Priority:** 🔴 Critical  
**Estimated Time:** 1.5 hours

- [ ] Create table container (bg-white rounded shadow-sm overflow-hidden)
- [ ] Add table: `<table className="min-w-full">`
- [ ] Create thead with 10 column headers:
  1. [ ] # (SL)
  2. [ ] PI Number
  3. [ ] Supplier
  4. [ ] Amount ($)
  5. [ ] B2B %
  6. [ ] Costing Detail
  7. [ ] Order
  8. [ ] Contract
  9. [ ] Status
  10. [ ] Action
- [ ] Style headers: bg-[#2d3748] text-white font-bold
- [ ] Create tbody with map function
- [ ] Display data in each column:
  - [ ] Format amount as currency: $X,XXX.XX
  - [ ] Format B2B%: XX.XX%
  - [ ] Create status badge (color-coded)
  - [ ] Add Show button with eye icon
- [ ] Add onClick to Show button → navigate to detail page
- [ ] Test table displays data correctly

**Acceptance Criteria:**

- Table shows all 10 columns
- Data formats correctly
- Status badges color-coded
- Show button navigates

---

### Task 3.5: Implement API Integration

**Priority:** 🔴 Critical  
**Estimated Time:** 45 minutes

- [ ] Create fetchB2BLCs async function
- [ ] Build API URL with query params (filters, page)
- [ ] Add try-catch error handling
- [ ] Set loading state before fetch
- [ ] Parse JSON response
- [ ] Update b2bLCs state with data
- [ ] Update pagination state with totals
- [ ] Clear loading state after fetch
- [ ] Add useEffect to call fetchB2BLCs on mount
- [ ] Add useEffect to re-fetch when filters change
- [ ] Test API calls with Network tab

**Acceptance Criteria:**

- Data loads on page mount
- Filters trigger re-fetch
- Loading state works
- Errors handled gracefully

---

### Task 3.6: Add Pagination

**Priority:** 🟡 High  
**Estimated Time:** 30 minutes

- [ ] Create pagination component below table
- [ ] Show current page and total pages
- [ ] Add Previous button (disabled if page 1)
- [ ] Add Next button (disabled if last page)
- [ ] Update currentPage state on button click
- [ ] Trigger API re-fetch when page changes
- [ ] Test pagination navigation

**Acceptance Criteria:**

- Pagination displays correctly
- Buttons enable/disable properly
- Page changes fetch new data

---

## 🆕 Frontend - Create Page

### Task 4.1: Create CreateB2BLC Component

**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour

- [ ] Create file: `frontend/src/pages/CreateB2BLC.jsx`
- [ ] Import hooks: useState, useEffect, useNavigate
- [ ] Set up state variables:
  - [ ] contracts (array)
  - [ ] orders (array)
  - [ ] costingDetails (array)
  - [ ] selectedContract (string)
  - [ ] selectedOrder (string)
  - [ ] selectedCosting (string)
  - [ ] formData (object with 7 fields)
- [ ] Create basic two-column layout
- [ ] Add page title
- [ ] Save file

**Acceptance Criteria:**

- Component renders
- Layout structure in place

---

### Task 4.2: Build Left Panel - Dropdowns

**Priority:** 🔴 Critical  
**Estimated Time:** 1.5 hours

- [ ] Create left panel: `lg:col-span-1`
- [ ] Create Contract dropdown card:
  - [ ] White background, shadow-sm, p-4
  - [ ] Label: "Contract"
  - [ ] Select element styled with Tailwind
  - [ ] Default option: "Select Contract"
  - [ ] Map contracts to options
  - [ ] value: selectedContract
  - [ ] onChange: handleContractChange
- [ ] Create Order dropdown card:
  - [ ] Same styling as Contract
  - [ ] Label: "Order"
  - [ ] disabled when no contract selected
  - [ ] Map orders to options
  - [ ] onChange: handleOrderChange
- [ ] Create Costing Detail dropdown card:
  - [ ] Same styling
  - [ ] Label: "Costing Detail"
  - [ ] disabled when no order selected
  - [ ] Map costingDetails to options
  - [ ] onChange: handleCostingChange
- [ ] Add space-y-4 between cards
- [ ] Test dropdown rendering

**Acceptance Criteria:**

- All 3 dropdowns display
- Dropdowns stack vertically
- Disabled states work

---

### Task 4.3: Implement Dependent Dropdown Logic

**Priority:** 🔴 Critical  
**Estimated Time:** 2 hours

- [ ] Create fetchContracts function:
  - [ ] Call /api/contracts
  - [ ] Update contracts state
- [ ] Add useEffect to fetch contracts on mount
- [ ] Create handleContractChange function:
  - [ ] Update selectedContract state
  - [ ] Clear selectedOrder and selectedCosting
  - [ ] Fetch orders for selected contract
  - [ ] Call /api/contracts/{id}/orders
  - [ ] Update orders state
- [ ] Create handleOrderChange function:
  - [ ] Update selectedOrder state
  - [ ] Clear selectedCosting
  - [ ] Fetch order details: /api/orders/{id}
  - [ ] Extract order_qty and auto-fill formData
  - [ ] Parse cost_details JSON
  - [ ] Update costingDetails state
- [ ] Create handleCostingChange function:
  - [ ] Update selectedCosting state
  - [ ] Find selected costing item
  - [ ] Auto-fill postPIValue from postCosting
  - [ ] Trigger B2B% calculation
- [ ] Test full dropdown chain
- [ ] Verify auto-fill works

**Acceptance Criteria:**

- Contract selection loads orders
- Order selection loads costing items
- Order Qty auto-fills
- Post PI Value auto-fills
- Dropdowns cascade correctly

---

### Task 4.4: Build Right Panel - Form

**Priority:** 🔴 Critical  
**Estimated Time:** 1.5 hours

- [ ] Create right panel: `lg:col-span-2`
- [ ] Create form card (bg-white rounded shadow-sm p-6)
- [ ] Add card title: "B2B LC Information"
- [ ] Create grid layout: `grid grid-cols-2 gap-4`
- [ ] Add 7 input fields in exact order:
  1. [ ] Order Qty (Pcs) - readonly, gray background
  2. [ ] FOB Value/piece ($) - editable
  3. [ ] Order Value ($) - readonly, blue text
  4. [ ] PI Number - editable
  5. [ ] Supplier - editable
  6. [ ] Post Costing / Received PI Value ($) - editable
  7. [ ] B2B % - readonly, blue text
- [ ] Style all inputs consistently
- [ ] Add proper labels above each input
- [ ] Test form layout matches screenshot

**Acceptance Criteria:**

- Form displays in 2 columns
- Readonly fields have gray background
- Calculated fields have blue text
- Labels match specification exactly

---

### Task 4.5: Implement Calculations

**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour

- [ ] Create handleFobChange function:
  - [ ] Update formData.fobValue
  - [ ] Calculate: orderValue = orderQty × fobValue
  - [ ] Update formData.orderValue
  - [ ] Call calculateB2BPercent
- [ ] Create handlePostPIChange function:
  - [ ] Update formData.postPIValue
  - [ ] Call calculateB2BPercent
- [ ] Create calculateB2BPercent function:
  - [ ] Get postPIValue and orderValue
  - [ ] Calculate: b2bPercent = (postPI / orderValue) × 100
  - [ ] Format to 2 decimals with % suffix
  - [ ] Update formData.b2bPercent
  - [ ] Handle division by zero
- [ ] Test calculations with different values:
  - [ ] Order Qty: 5000, FOB: 2.50 → Order Value: 12500.00
  - [ ] Post PI: 5625 → B2B%: 45.00%
- [ ] Verify calculations update in real-time

**Acceptance Criteria:**

- Order Value calculates correctly
- B2B% calculates correctly
- Updates happen immediately on input
- No division by zero errors

---

### Task 4.6: Add Save Functionality

**Priority:** 🔴 Critical  
**Estimated Time:** 45 minutes

- [ ] Add buttons div at bottom of form
- [ ] Add Cancel button (border, gray text)
- [ ] Add Save B2B LC button (bg-indigo-600, white text)
- [ ] Create handleSave async function:
  - [ ] Validate all required fields
  - [ ] Show alert if validation fails
  - [ ] Build payload object with all data
  - [ ] POST to /api/b2b-lc
  - [ ] Add Content-Type header
  - [ ] Handle response
  - [ ] Show success alert
  - [ ] Navigate to /b2b-lc
  - [ ] Handle errors with try-catch
- [ ] Add onClick handlers to buttons
- [ ] Test full save workflow
- [ ] Verify record created in database

**Acceptance Criteria:**

- Save button posts correct data
- Validation prevents invalid submissions
- Success message displays
- Navigates to list page after save
- Errors show user-friendly messages

---

## 👁️ Frontend - Detail Page

### Task 5.1: Create B2BLCDetail Component

**Priority:** 🟡 High  
**Estimated Time:** 2 hours

- [ ] Create file: `frontend/src/pages/B2BLCDetail.jsx`
- [ ] Copy structure from CreateB2BLC.jsx
- [ ] Add isEditMode state (boolean, default false)
- [ ] Add b2bLC state to store fetched data
- [ ] Fetch B2B LC data on mount using useParams
- [ ] Populate form fields with fetched data
- [ ] Make all fields readonly initially
- [ ] Add Edit button to toggle edit mode
- [ ] Change Save button to Update button
- [ ] Add Delete button (admin only)
- [ ] Implement update function (PUT request)
- [ ] Implement delete function with confirmation
- [ ] Test view/edit/delete workflows

**Acceptance Criteria:**

- Detail page displays existing record
- Edit mode enables form fields
- Update saves changes
- Delete removes record (after confirmation)

---

## 🧪 Testing

### Task 6.1: Backend Unit Tests

**Priority:** 🟢 Medium  
**Estimated Time:** 2 hours

- [ ] Create test file: `tests/Feature/B2BLCTest.php`
- [ ] Test model relationships
- [ ] Test validation rules
- [ ] Test calculations in controller
- [ ] Test index with filters
- [ ] Test store creates record
- [ ] Test update modifies record
- [ ] Test destroy deletes record
- [ ] Run: `php artisan test`

---

### Task 6.2: Frontend Component Tests

**Priority:** 🟢 Medium  
**Estimated Time:** 1.5 hours

- [ ] Test CreateB2BLC renders
- [ ] Test dropdowns populate
- [ ] Test calculations work
- [ ] Test form submission
- [ ] Test validation messages
- [ ] Test navigation
- [ ] Run: `npm test`

---

### Task 6.3: End-to-End Testing

**Priority:** 🟡 High  
**Estimated Time:** 2 hours

- [ ] Test complete create workflow:
  - [ ] Select contract
  - [ ] Select order
  - [ ] Select costing
  - [ ] Fill PI Number and Supplier
  - [ ] Enter FOB Value
  - [ ] Verify calculations
  - [ ] Save
  - [ ] Verify in list
- [ ] Test search and filter
- [ ] Test pagination
- [ ] Test edit workflow
- [ ] Test delete workflow
- [ ] Test responsive design
- [ ] Test in different browsers

**Acceptance Criteria:**

- All workflows complete successfully
- No console errors
- UI matches screenshots
- Works on mobile devices

---

## 📚 Documentation

### Task 7.1: Update Swagger

**Priority:** 🟡 High  
**Estimated Time:** 45 minutes

- [ ] Run: `php artisan l5-swagger:generate`
- [ ] Open Swagger UI at /api/documentation
- [ ] Verify B2B LC endpoints appear
- [ ] Test each endpoint in Swagger UI
- [ ] Update descriptions if needed
- [ ] Add example requests/responses

---

### Task 7.2: Create User Guide

**Priority:** 🟢 Medium  
**Estimated Time:** 1 hour

- [ ] Document how to create B2B LC
- [ ] Add screenshots
- [ ] Explain calculations
- [ ] Document filter usage
- [ ] Add troubleshooting section

---

## 📊 Task Summary

**Total Tasks:** 45  
**Critical Priority:** 18 tasks  
**High Priority:** 13 tasks  
**Medium Priority:** 14 tasks

**Estimated Total Time:** 25-30 hours (3-4 days)

---

**Document Status:** ✅ Complete Task Breakdown  
**Next Step:** Begin implementation following task order
