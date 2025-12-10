# B2B LC Module - Implementation Checklist

**Project:** LC Management System  
**Module:** B2B LC Management  
**Date:** December 10, 2025  
**Purpose:** Quick-reference checklist for implementation progress

---

## 🎯 Quick Start Checklist

### Prerequisites

- [ ] Laravel 11 backend running
- [ ] React + Vite frontend running
- [ ] Database connection configured
- [ ] Contracts and Orders modules functional
- [ ] Git repository initialized

---

## 📦 Phase 1: Database Setup

### Migration

- [ ] Create migration file: `create_b2b_lcs_table.php`
- [ ] Add id (primary key)
- [ ] Add contract_id (foreign key → contracts)
- [ ] Add order_id (foreign key → orders)
- [ ] Add costing_detail_id (bigInteger)
- [ ] Add pi_number (string, unique, indexed)
- [ ] Add supplier (string, indexed)
- [ ] Add order_qty (integer)
- [ ] Add fob_value (decimal 15,2)
- [ ] Add order_value (decimal 15,2)
- [ ] Add post_pi_value (decimal 15,2)
- [ ] Add b2b_percent (decimal 5,2)
- [ ] Add status (enum: draft, active, completed, cancelled, indexed)
- [ ] Add timestamps (created_at, updated_at)
- [ ] Add foreign key constraints with cascade delete
- [ ] Add composite index on (contract_id, order_id)
- [ ] Run migration: `php artisan migrate`
- [ ] Verify table in database

**Verification:**

```sql
DESCRIBE b2b_lcs;
SHOW INDEXES FROM b2b_lcs;
```

---

## 🏗️ Phase 2: Backend Development

### Model Creation

- [ ] Create model: `php artisan make:model B2BLC`
- [ ] Set table name: `protected $table = 'b2b_lcs';`
- [ ] Add fillable fields (all 11 columns)
- [ ] Add casts for numeric fields
- [ ] Create contract() relationship (belongsTo)
- [ ] Create order() relationship (belongsTo)
- [ ] Add getFormattedOrderValueAttribute() accessor
- [ ] Add getFormattedB2BPercentAttribute() accessor
- [ ] Add scopeSearch($query, $search) scope
- [ ] Add scopeByStatus($query, $status) scope
- [ ] Test in tinker: `B2BLC::first()`

### Validation Classes

- [ ] Create: `php artisan make:request StoreB2BLCRequest`
- [ ] Set authorize() to return true
- [ ] Add validation rules for all fields
- [ ] Add custom error messages
- [ ] Create: `php artisan make:request UpdateB2BLCRequest`
- [ ] Copy rules with 'sometimes' instead of 'required'
- [ ] Add unique rule with ignore for pi_number
- [ ] Test validation with invalid data

### Controller Implementation

- [ ] Create: `php artisan make:controller B2BLCController --api`
- [ ] Implement index() method:
  - [ ] Accept filters (pi_number, supplier, status, page)
  - [ ] Add search query
  - [ ] Eager load relationships
  - [ ] Add pagination (15 per page)
  - [ ] Return JSON response
- [ ] Implement store() method:
  - [ ] Accept StoreB2BLCRequest
  - [ ] Calculate order_value if missing
  - [ ] Calculate b2b_percent if missing
  - [ ] Create record
  - [ ] Return JSON with 201 status
- [ ] Implement show() method:
  - [ ] Use route model binding
  - [ ] Eager load relationships
  - [ ] Return JSON
- [ ] Implement update() method:
  - [ ] Accept UpdateB2BLCRequest
  - [ ] Recalculate values if needed
  - [ ] Update record
  - [ ] Return JSON
- [ ] Implement destroy() method:
  - [ ] Delete record
  - [ ] Return success message

### Swagger Documentation

- [ ] Add @OA\Tag annotation for "B2B LC"
- [ ] Add @OA\Schema for B2BLC model
- [ ] Add @OA\Get for index()
- [ ] Add @OA\Post for store()
- [ ] Add @OA\Get for show()
- [ ] Add @OA\Put for update()
- [ ] Add @OA\Delete for destroy()
- [ ] Generate docs: `php artisan l5-swagger:generate`
- [ ] Test in Swagger UI: http://localhost:8000/api/documentation

### API Routes

- [ ] Open routes/api.php
- [ ] Import B2BLCController
- [ ] Add: `Route::apiResource('b2b-lc', B2BLCController::class);`
- [ ] Verify routes: `php artisan route:list | grep b2b-lc`

### API Testing (Postman/Thunder Client)

- [ ] Test GET /api/b2b-lc (empty list)
- [ ] Test POST /api/b2b-lc (create)
- [ ] Test GET /api/b2b-lc (list with data)
- [ ] Test GET /api/b2b-lc/{id} (show single)
- [ ] Test PUT /api/b2b-lc/{id} (update)
- [ ] Test DELETE /api/b2b-lc/{id} (delete)
- [ ] Test filters: ?pi_number=PI-001
- [ ] Test filters: ?supplier=ABC
- [ ] Test filters: ?status=draft
- [ ] Test pagination: ?page=2

---

## 🎨 Phase 3: Frontend - List Page

### Component Setup

- [ ] Create file: `frontend/src/pages/B2BLCList.jsx`
- [ ] Import React hooks: useState, useEffect
- [ ] Import useNavigate from react-router-dom
- [ ] Initialize state variables:
  - [ ] b2bLCs (empty array)
  - [ ] loading (false)
  - [ ] filters ({piNumber: '', supplier: ''})
  - [ ] pagination ({currentPage: 1, perPage: 15, total: 0})

### Header Section

- [ ] Create header with flex justify-between
- [ ] Add page title: "B2B LC List"
- [ ] Style title: text-2xl font-bold text-gray-900
- [ ] Add "Create B2B LC" button
- [ ] Style button: bg-indigo-600 text-white px-4 py-2 rounded
- [ ] Add hover: hover:bg-indigo-700
- [ ] Add navigation to /b2b-lc/create

### Filters Section

- [ ] Create filters card: bg-white rounded-lg shadow-sm p-4
- [ ] Add grid layout: grid grid-cols-1 md:grid-cols-3 gap-4
- [ ] Add PI Number input field
- [ ] Add Supplier input field
- [ ] Add Search button
- [ ] Bind inputs to filters state
- [ ] Add onChange handlers
- [ ] Trigger API call on search click

### Table Component

- [ ] Create table container: bg-white rounded-lg shadow-sm overflow-hidden
- [ ] Add table: min-w-full
- [ ] Create thead with 10 columns:
  - [ ] # (serial number)
  - [ ] PI Number
  - [ ] Supplier
  - [ ] Amount ($)
  - [ ] B2B %
  - [ ] Costing Detail
  - [ ] Order
  - [ ] Contract
  - [ ] Status
  - [ ] Action
- [ ] Style thead: bg-[#2d3748] text-white
- [ ] Create tbody with data mapping
- [ ] Format Amount as currency: $12,345.67
- [ ] Format B2B% with 2 decimals: 45.00%
- [ ] Add status badge (color-coded):
  - [ ] Draft: gray
  - [ ] Active: blue
  - [ ] Completed: green
  - [ ] Cancelled: red
- [ ] Add Show button with eye icon
- [ ] Navigate to /b2b-lc/{id} on click

### API Integration

- [ ] Create fetchB2BLCs async function
- [ ] Build URL with query params
- [ ] Add try-catch error handling
- [ ] Set loading state
- [ ] Fetch data from /api/b2b-lc
- [ ] Parse JSON response
- [ ] Update b2bLCs state
- [ ] Update pagination state
- [ ] Clear loading state
- [ ] Add useEffect to fetch on mount
- [ ] Add useEffect to fetch when filters change

### Pagination

- [ ] Create pagination component
- [ ] Show current page / total pages
- [ ] Add Previous button (disabled if page 1)
- [ ] Add Next button (disabled if last page)
- [ ] Update currentPage on click
- [ ] Trigger API re-fetch

### Loading & Empty States

- [ ] Add loading spinner while fetching
- [ ] Show "Loading..." text
- [ ] Add empty state when no data
- [ ] Show "No B2B LCs found" message

---

## 🆕 Phase 4: Frontend - Create Page

### Component Setup

- [ ] Create file: `frontend/src/pages/CreateB2BLC.jsx`
- [ ] Import React hooks: useState, useEffect
- [ ] Import useNavigate
- [ ] Initialize state:
  - [ ] contracts (empty array)
  - [ ] orders (empty array)
  - [ ] costingDetails (empty array)
  - [ ] selectedContract ('')
  - [ ] selectedOrder ('')
  - [ ] selectedCosting ('')
  - [ ] formData (object with 7 fields)

### Layout Structure

- [ ] Create page container: min-h-screen bg-gray-50
- [ ] Add page title: "Create B2B LC"
- [ ] Create grid: grid grid-cols-1 lg:grid-cols-3 gap-6
- [ ] Left panel: lg:col-span-1
- [ ] Right panel: lg:col-span-2

### Left Panel - Dropdowns

- [ ] Create Contract dropdown card:
  - [ ] White background, rounded-lg, shadow-sm, p-4
  - [ ] Label: "Contract"
  - [ ] Select element with Tailwind styling
  - [ ] Placeholder option: "Select Contract"
  - [ ] Map contracts to options
  - [ ] Bind to selectedContract
  - [ ] onChange: handleContractChange
- [ ] Create Order dropdown card:
  - [ ] Same styling as Contract
  - [ ] Label: "Order"
  - [ ] disabled={!selectedContract}
  - [ ] Map orders to options
  - [ ] onChange: handleOrderChange
- [ ] Create Costing Detail dropdown card:
  - [ ] Same styling
  - [ ] Label: "Costing Detail"
  - [ ] disabled={!selectedOrder}
  - [ ] Map costingDetails to options
  - [ ] onChange: handleCostingChange
- [ ] Add space-y-4 between cards

### Dependent Dropdown Logic

- [ ] Fetch contracts on mount:
  - [ ] useEffect(() => fetchContracts(), [])
  - [ ] Call /api/contracts
  - [ ] Update contracts state
- [ ] Handle contract selection:
  - [ ] Clear selectedOrder and selectedCosting
  - [ ] Fetch orders: /api/contracts/{id}/orders
  - [ ] Update orders state
- [ ] Handle order selection:
  - [ ] Clear selectedCosting
  - [ ] Fetch order details: /api/orders/{id}
  - [ ] Extract order_qty from response
  - [ ] Auto-fill formData.orderQty
  - [ ] Parse cost_details JSON array
  - [ ] Update costingDetails state
- [ ] Handle costing selection:
  - [ ] Find selected costing item
  - [ ] Auto-fill formData.postPIValue from postCosting field
  - [ ] Trigger B2B% calculation

### Right Panel - Form

- [ ] Create form card: bg-white rounded-lg shadow-sm p-6
- [ ] Add title: "B2B LC Information" (text-lg font-bold)
- [ ] Create grid: grid grid-cols-2 gap-4
- [ ] Add Order Qty field:
  - [ ] Label: "Order Qty (Pcs)"
  - [ ] Input type="number"
  - [ ] readOnly
  - [ ] bg-gray-100 text-gray-600
- [ ] Add FOB Value/piece field:
  - [ ] Label: "FOB Value/piece ($)"
  - [ ] Input type="number" step="0.01"
  - [ ] Editable
  - [ ] onChange: handleFobChange
- [ ] Add Order Value field:
  - [ ] Label: "Order Value ($)"
  - [ ] Input type="text"
  - [ ] readOnly
  - [ ] bg-gray-100 text-blue-600 font-semibold
- [ ] Add PI Number field:
  - [ ] Label: "PI Number"
  - [ ] Input type="text"
  - [ ] Editable
  - [ ] Placeholder: "Enter PI Number"
- [ ] Add Supplier field:
  - [ ] Label: "Supplier"
  - [ ] Input type="text"
  - [ ] Editable
  - [ ] Placeholder: "Enter Supplier Name"
- [ ] Add Post PI Value field:
  - [ ] Label: "Post Costing / Received PI Value ($)"
  - [ ] Input type="number" step="0.01"
  - [ ] Editable
  - [ ] onChange: handlePostPIChange
- [ ] Add B2B % field:
  - [ ] Label: "B2B %"
  - [ ] Input type="text"
  - [ ] readOnly
  - [ ] bg-gray-100 text-blue-600 font-semibold

### Calculation Logic

- [ ] Create handleFobChange:
  - [ ] Parse FOB value
  - [ ] Parse orderQty
  - [ ] Calculate: orderValue = orderQty × fobValue
  - [ ] Update formData.fobValue
  - [ ] Update formData.orderValue
  - [ ] Call calculateB2BPercent()
- [ ] Create handlePostPIChange:
  - [ ] Parse Post PI value
  - [ ] Update formData.postPIValue
  - [ ] Call calculateB2BPercent()
- [ ] Create calculateB2BPercent:
  - [ ] Parse postPIValue
  - [ ] Parse orderValue
  - [ ] Check orderValue > 0
  - [ ] Calculate: b2bPercent = (postPI / orderValue) × 100
  - [ ] Format: toFixed(2) + '%'
  - [ ] Update formData.b2bPercent
  - [ ] Handle division by zero

### Form Buttons

- [ ] Create button container: flex justify-end mt-6 gap-3
- [ ] Add Cancel button:
  - [ ] Text: "Cancel"
  - [ ] Style: px-6 py-2 border border-gray-300 rounded text-gray-700
  - [ ] onClick: navigate('/b2b-lc')
- [ ] Add Save button:
  - [ ] Text: "Save B2B LC"
  - [ ] Style: px-6 py-2 bg-indigo-600 text-white rounded
  - [ ] Hover: hover:bg-indigo-700
  - [ ] onClick: handleSave

### Save Functionality

- [ ] Create handleSave async function:
  - [ ] Validate required fields:
    - [ ] selectedContract must be set
    - [ ] selectedOrder must be set
    - [ ] selectedCosting must be set
    - [ ] piNumber must not be empty
    - [ ] supplier must not be empty
  - [ ] Show alert if validation fails
  - [ ] Build payload object:
    ```javascript
    {
      contract_id: selectedContract,
      order_id: selectedOrder,
      costing_detail_id: selectedCosting,
      pi_number: formData.piNumber,
      supplier: formData.supplier,
      order_qty: formData.orderQty,
      fob_value: formData.fobValue,
      order_value: formData.orderValue,
      post_pi_value: formData.postPIValue,
      b2b_percent: parseFloat(formData.b2bPercent),
      status: 'draft'
    }
    ```
  - [ ] POST to /api/b2b-lc
  - [ ] Set Content-Type: application/json
  - [ ] Handle response:
    - [ ] If success (200-201): show alert, navigate to list
    - [ ] If error: parse error message, show alert
  - [ ] Add try-catch for network errors

---

## 👁️ Phase 5: Frontend - Detail Page

### Component Setup

- [ ] Create file: `frontend/src/pages/B2BLCDetail.jsx`
- [ ] Copy structure from CreateB2BLC.jsx
- [ ] Add isEditMode state (default: false)
- [ ] Add b2bLC state for fetched data
- [ ] Use useParams to get ID from URL

### Data Fetching

- [ ] Create fetchB2BLC async function
- [ ] Get ID from useParams
- [ ] Fetch /api/b2b-lc/{id}
- [ ] Parse response
- [ ] Populate formData with fetched values
- [ ] Populate dropdown selections
- [ ] Add useEffect to fetch on mount

### View Mode

- [ ] Make all fields readonly initially
- [ ] Show fetched data
- [ ] Display dropdowns as text (not selects)
- [ ] Add "Edit" button
- [ ] onClick: set isEditMode to true

### Edit Mode

- [ ] Enable all editable fields
- [ ] Keep calculated fields readonly
- [ ] Enable dropdowns
- [ ] Change "Edit" button to "Cancel Edit"
- [ ] Change "Cancel" to "Update"
- [ ] Implement update functionality:
  - [ ] PUT to /api/b2b-lc/{id}
  - [ ] Send updated data
  - [ ] Show success message
  - [ ] Refresh data
  - [ ] Exit edit mode

### Delete Functionality

- [ ] Add "Delete" button (red, admin only)
- [ ] Add confirmation dialog:
  - [ ] "Are you sure you want to delete this B2B LC?"
- [ ] If confirmed:
  - [ ] DELETE /api/b2b-lc/{id}
  - [ ] Show success message
  - [ ] Navigate to list page

---

## 🧪 Phase 6: Testing

### Backend Tests

- [ ] Create feature test: `tests/Feature/B2BLCTest.php`
- [ ] Test list endpoint with filters
- [ ] Test create with valid data
- [ ] Test create with invalid data (validation)
- [ ] Test show single record
- [ ] Test update record
- [ ] Test delete record
- [ ] Test calculations are correct
- [ ] Run: `php artisan test --filter=B2BLCTest`

### Frontend Manual Tests

- [ ] Test list page loads
- [ ] Test filters work
- [ ] Test pagination works
- [ ] Test navigation to create page
- [ ] Test dependent dropdowns cascade correctly
- [ ] Test auto-fill works (Order Qty, Post PI)
- [ ] Test calculations:
  - [ ] Order Value = Order Qty × FOB
  - [ ] B2B% = (Post PI / Order Value) × 100
- [ ] Test form validation
- [ ] Test save creates record
- [ ] Test navigation to detail page
- [ ] Test view mode displays correctly
- [ ] Test edit mode enables fields
- [ ] Test update saves changes
- [ ] Test delete removes record

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)

### Responsive Testing

- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (≥ 1024px)
- [ ] Test in Chrome DevTools device emulator

### Error Scenarios

- [ ] Test with no internet connection
- [ ] Test with invalid API responses
- [ ] Test with missing required fields
- [ ] Test with duplicate PI Number
- [ ] Test with invalid numeric values
- [ ] Test division by zero (Order Value = 0)

---

## 📚 Phase 7: Documentation

### Swagger Documentation

- [ ] Verify all endpoints in Swagger UI
- [ ] Test each endpoint from Swagger
- [ ] Add example request/response bodies
- [ ] Update descriptions if needed
- [ ] Generate final docs: `php artisan l5-swagger:generate`

### Code Documentation

- [ ] Add PHPDoc comments to model methods
- [ ] Add JSDoc comments to React functions
- [ ] Document calculation formulas in comments
- [ ] Add inline comments for complex logic

### User Documentation

- [ ] Create user guide for B2B LC module
- [ ] Add screenshots of each page
- [ ] Document how to create B2B LC step-by-step
- [ ] Explain calculations with examples
- [ ] Add troubleshooting section

### README Updates

- [ ] Update main README.md
- [ ] Add B2B LC module to features list
- [ ] Document API endpoints
- [ ] Add setup instructions

---

## 🚀 Phase 8: Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] No console.error statements
- [ ] Environment variables configured
- [ ] Database migration files committed
- [ ] .env.example updated
- [ ] Code reviewed
- [ ] Git repository up to date

### Staging Deployment

- [ ] Backup staging database
- [ ] Pull latest code
- [ ] Run: `composer install`
- [ ] Run: `npm install`
- [ ] Run: `php artisan migrate`
- [ ] Run: `npm run build`
- [ ] Test on staging environment
- [ ] Verify all features work

### Production Deployment

- [ ] Backup production database
- [ ] Schedule maintenance window
- [ ] Pull latest code
- [ ] Run: `composer install --no-dev`
- [ ] Run: `php artisan migrate --force`
- [ ] Run: `npm run build`
- [ ] Clear caches: `php artisan cache:clear`
- [ ] Generate optimized autoload: `composer dump-autoload --optimize`
- [ ] Restart queue workers (if applicable)
- [ ] Test critical workflows
- [ ] Monitor error logs
- [ ] Announce deployment complete

### Post-Deployment

- [ ] Smoke test all features
- [ ] Check API response times
- [ ] Monitor error logs for 24 hours
- [ ] Gather user feedback
- [ ] Address any issues immediately

---

## ✅ Final Verification

### Functionality

- [ ] ✅ List page displays all B2B LCs
- [ ] ✅ Filters work correctly (PI Number, Supplier)
- [ ] ✅ Pagination navigates pages
- [ ] ✅ Create page has dependent dropdowns
- [ ] ✅ Contract selection loads orders
- [ ] ✅ Order selection loads costing details
- [ ] ✅ Order Qty auto-fills from order
- [ ] ✅ Post PI Value auto-fills from costing
- [ ] ✅ Order Value calculates: Qty × FOB
- [ ] ✅ B2B% calculates: (Post PI / Order Value) × 100
- [ ] ✅ Save creates new B2B LC record
- [ ] ✅ Detail page displays record
- [ ] ✅ Edit mode enables fields
- [ ] ✅ Update saves changes
- [ ] ✅ Delete removes record (with confirmation)

### UI/UX

- [ ] ✅ Layout matches screenshots exactly
- [ ] ✅ Responsive design works on all devices
- [ ] ✅ Loading states display during API calls
- [ ] ✅ Error messages are user-friendly
- [ ] ✅ Success messages display after actions
- [ ] ✅ Form validation prevents invalid input
- [ ] ✅ Readonly fields have gray background
- [ ] ✅ Calculated fields have blue text
- [ ] ✅ Status badges are color-coded

### Performance

- [ ] ✅ Page load time < 500ms
- [ ] ✅ API responses < 200ms
- [ ] ✅ No memory leaks
- [ ] ✅ Database queries optimized
- [ ] ✅ N+1 queries eliminated

### Documentation

- [ ] ✅ All 7 specification files complete
- [ ] ✅ Swagger documentation generated
- [ ] ✅ Code comments added
- [ ] ✅ User guide created
- [ ] ✅ README updated

---

## 📊 Progress Summary

**Total Checklist Items:** 250+  
**Completion Target:** 100%

**Time Estimate:** 3-4 days  
**Team Size:** 1-2 developers  
**Complexity:** Medium

---

**Document Status:** ✅ Complete Implementation Checklist  
**Usage:** Check off items as you complete them to track progress  
**Next Step:** Begin implementation following the checklist order
