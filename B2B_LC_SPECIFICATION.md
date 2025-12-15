# B2B LC Module - Technical Specification

**Project:** LC Management System  
**Module:** B2B LC Management  
**Version:** 1.1.0  
**Date:** December 15, 2025  
**Status:** ✅ Implemented with Updates

---

## 📝 Recent Updates (v1.1.0 - December 15, 2025)

### Costing Detail Integration Fixes

**Issue:** Costing details dropdown was displaying "undefined - undefined" because it tried to access non-existent fields (`supplier`, `item_type`) from order cost_details.

**Root Cause:** Order cost_details structure contains:

- `id`, `name`, `preCosting`, `budget`, `budgetPercent`, `postCosting`, `b2bPercent`, `status`
- Does NOT contain `supplier` or `item_type` fields

**Fixes Applied:**

1. **Dropdown Display Logic** (`CreateB2BLC.jsx` line ~450):

   ```jsx
   // OLD (incorrect):
   {detail.supplier} - {detail.item_type}

   // NEW (correct):
   {detail.name} - ${detail.postCosting || detail.budget || detail.preCosting} ({detail.b2bPercent || detail.budgetPercent}% B2B)
   ```

2. **Calculation Logic** (`handleCostingDetailChange`):

   ```jsx
   // Uses fallback chain: postCosting → budget → preCosting
   const costPerUnit =
     selectedCosting.postCosting ||
     selectedCosting.budget ||
     selectedCosting.preCosting ||
     "";
   const b2bPercentValue =
     selectedCosting.b2bPercent || selectedCosting.budgetPercent || "";
   ```

3. **Selected Section Display**:
   ```jsx
   // Shows: "YARN - $0.01 (0.17% B2B)" instead of "undefined - undefined"
   const cost =
     selectedDetail.postCosting ||
     selectedDetail.budget ||
     selectedDetail.preCosting ||
     "0.00";
   const percent =
     selectedDetail.b2bPercent || selectedDetail.budgetPercent || "0.00";
   return `${selectedDetail.name} - $${cost} (${percent}% B2B)`;
   ```

**Data Structure Reference:**

```javascript
// Order cost_details structure:
{
  id: 1,
  name: "YARN", // Item name (not supplier)
  preCosting: "0.01",
  budget: "0.01",
  budgetPercent: "0.00",
  postCosting: "0.00", // May be empty initially
  b2bPercent: "0.00", // May be empty initially
  status: "draft"
}
```

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Frontend Specifications](#frontend-specifications)
3. [Backend Specifications](#backend-specifications)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Business Logic](#business-logic)
7. [UI Component Details](#ui-component-details)

---

## 🎯 Overview

Complete technical specification for B2B LC module with exact UI implementation requirements matching provided screenshots.

---

## 🎨 Frontend Specifications

### 1. B2B LC List Page (`/b2b-lc`)

#### File: `frontend/src/pages/B2BLCList.jsx`

**EXACT UI REQUIREMENTS FROM SCREENSHOT:**

**Page Title:** "B2B LC List"  
**Subtitle:** "PI / Supplier filter + Costing, Order & Contract info"  
**Top-Right Button:** "+ Create B2B LC" (indigo/blue button)

**Filter Section:**

- Two input fields side-by-side: "PI Number" and "Supplier"
- Two buttons: "Filter" (indigo) and "Reset" (gray)
- NO auto-search - manual Filter button click required
- Display "Total: 0" in top-right corner of filter section

**Table Columns (EXACT ORDER AS IN SCREENSHOT):**

1. **#** - Serial number (incremental from 1)
2. **PI Number** - Text, left-aligned
3. **Supplier** - Text, left-aligned
4. **Amount ($)** - Post PI value, right-aligned, currency format
5. **B2B %** - Percentage, right-aligned, 2 decimals
6. **Costing Detail** - Text from costing_detail (supplier/item)
7. **Order** - Order number, left-aligned
8. **Contract** - Contract number, left-aligned
9. **Status** - Badge (Draft/Active/Completed/Cancelled)
10. **Director Sir Command** - Text field (empty by default)
11. **Action** - Single column with action buttons

**Layout Structure:**

```jsx
<div className="min-h-screen bg-gray-50">
  {/* Top Header Bar - Same as other pages */}
  <div className="bg-white border-b border-gray-200">
    <div className="px-8 py-4 flex items-center justify-center relative">
      <h1 className="text-2xl font-bold text-gray-900">LC Management</h1>
      <div className="flex items-center gap-3 absolute right-8">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">S.M. Refat</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Viewer
        </span>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="p-8">
    <div className="bg-white rounded-lg shadow">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">B2B LC List</h2>
          <p className="text-sm text-gray-600 mt-1">
            PI / Supplier filter + Costing, Order & Contract info
          </p>
        </div>
        <button
          onClick={handleCreateB2BLC}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          + Create B2B LC
        </button>
      </div>

      {/* Filter Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-end gap-4">
          {/* PI Number Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              PI Number
            </label>
            <input
              type="text"
              value={filters.piNumber}
              onChange={(e) =>
                setFilters({ ...filters, piNumber: e.target.value })
              }
              placeholder="Search PI..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Supplier Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Supplier
            </label>
            <input
              type="text"
              value={filters.supplier}
              onChange={(e) =>
                setFilters({ ...filters, supplier: e.target.value })
              }
              placeholder="Search Supplier..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Filter Button */}
          <div>
            <button
              onClick={handleFilter}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              Filter
            </button>
          </div>

          {/* Reset Button */}
          <div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          </div>

          {/* Total Count */}
          <div className="ml-auto text-sm text-gray-600">
            Total: {totalCount}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                PI Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Supplier
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                Amount ($)
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                B2B %
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Costing Detail
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Contract
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                Director Sir Command
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Table rows */}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button className="px-4 py-2 text-sm text-gray-700">← Prev</button>
        <span className="text-sm text-gray-600">Page 1 of 1</span>
        <button className="px-4 py-2 text-sm text-gray-700">Next →</button>
      </div>
    </div>
  </div>
</div>
```

**Table Columns Data Mapping:**

1. **#** - Row index (start from 1)
2. **PI Number** - `b2blc.pi_number`
3. **Supplier** - `b2blc.supplier`
4. **Amount ($)** - `b2blc.post_pi_value` (formatted as currency)
5. **B2B %** - `b2blc.b2b_percent` (with % sign)
6. **Costing Detail** - Get from order's cost_details array by costing_detail_id
7. **Order** - `b2blc.order.order_number`
8. **Contract** - `b2blc.contract.contract_no`
9. **Status** - `b2blc.status` (badge component)
10. **Director Sir Command** - New field (to be added to database)
11. **Action** - View/Edit/Delete buttons

**State Management:**

```jsx
const [b2bLCs, setB2BLCs] = useState([]);
const [filters, setFilters] = useState({
  piNumber: "",
  supplier: "",
});
const [loading, setLoading] = useState(false);
const [pagination, setPagination] = useState({
  currentPage: 1,
  perPage: 15,
  total: 0,
});
```

**API Integration:**

```jsx
useEffect(() => {
  fetchB2BLCs();
}, [filters, pagination.currentPage]);

const fetchB2BLCs = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `/api/b2b-lc?pi_number=${filters.piNumber}&supplier=${filters.supplier}&page=${pagination.currentPage}`
    );
    const data = await response.json();
    setB2BLCs(data.data);
    setPagination((prev) => ({ ...prev, total: data.total }));
  } catch (error) {
    console.error("Error fetching B2B LCs:", error);
  }
  setLoading(false);
};
```

---

### 2. Create B2B LC Page (`/b2b-lc/create`)

#### File: `frontend/src/pages/CreateB2BLC.jsx`

**EXACT UI REQUIREMENTS FROM SCREENSHOT:**

**Page Title:** "Create B2B LC"  
**Subtitle:** "Contract wise → Order → Costing Detail → B2B LC"  
**Top-Right Buttons:** "← Back" (gray) and "Create" (blue)

**Layout:** Two-column grid (Left: 1/3, Right: 2/3)

**LEFT PANEL - Selection Dropdowns:**

```
┌─────────────────────────────────┐
│ Sales Contract                  │
│ ┌─────────────────────────────┐ │
│ │ -- Select Contract --      ▼│ │
│ └─────────────────────────────┘ │
│ Select contract to load orders  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Order                           │
│ ┌─────────────────────────────┐ │
│ │ -- Select Order --         ▼│ │
│ └─────────────────────────────┘ │
│ Order list depends on contract  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Costing Detail                  │
│ ┌─────────────────────────────┐ │
│ │ -- Select Costing Detail --▼│ │
│ └─────────────────────────────┘ │
│ Costing depends on order        │
└─────────────────────────────────┘
```

**RIGHT PANEL - B2B LC Information:**

Title: "Select Costing Detail"
Subtitle: "Choose Contract → Order → Costing Detail to enable B2B LC form."

Section Header: "B2B LC Information"
Subtitle: "Order Qty / FOB auto-filled from order (editable)."

Top-Right: "Create" button (blue)

**Form Fields (Grid layout - 2 columns):**

```jsx
<div className="grid grid-cols-2 gap-4">
  {/* Row 1 */}
  <div>
    <label>Order Qty (Pcs)</label>
    <input type="number" value={0} readOnly className="bg-gray-100" />
  </div>
  <div>
    <label>FOB Value/piece</label>
    <input type="number" value={0} className="bg-white" />
    <small className="text-gray-500">Editable</small>
  </div>

  {/* Row 2 */}
  <div className="col-span-2">
    <label>Order Value ($)</label>
    <input
      type="text"
      value="0.00"
      readOnly
      className="bg-gray-100 text-right text-2xl font-bold"
    />
  </div>

  {/* Row 3 */}
  <div>
    <label>PI Number</label>
    <input type="text" />
  </div>
  <div>
    <label>Supplier</label>
    <input type="text" />
  </div>

  {/* Row 4 */}
  <div>
    <label>Post Costing / Received PI Value ($)</label>
    <input type="number" value={0} />
  </div>
  <div>
    <label>B2B %</label>
    <input
      type="text"
      value="0.00"
      readOnly
      className="bg-gray-100 text-right text-lg font-semibold text-indigo-600"
    />
    <small className="text-gray-500 block mt-1">
      Calc: 0.00% = Post PI / Order Value × 100
    </small>
  </div>
</div>
```

**Bottom Buttons:**

- "Reset" (gray, left side)
- "Save B2B LC" (blue, right side)

**Complete Layout Structure:**

```jsx
<div className="min-h-screen bg-gray-50">
  {/* Top Header Bar */}
  <div className="bg-white border-b border-gray-200">
    <div className="px-8 py-4 flex items-center justify-center relative">
      <h1 className="text-2xl font-bold text-gray-900">LC Management</h1>
      <div className="flex items-center gap-3 absolute right-8">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">S.M. Refat</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Viewer
        </span>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="p-8">
    <div className="bg-white rounded-lg shadow">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Create B2B LC</h2>
          <p className="text-sm text-gray-600 mt-1">
            Contract wise → Order → Costing Detail → B2B LC
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/b2b-lc")}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-8">
          {/* LEFT PANEL (1/3 width) */}
          <div className="col-span-1 space-y-4">
            {/* Sales Contract Dropdown */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Contract
              </label>
              <select
                value={selectedContract}
                onChange={handleContractChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Contract --</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contract_no}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Select contract to load orders
              </p>
            </div>

            {/* Order Dropdown */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={selectedOrder}
                onChange={handleOrderChange}
                disabled={!selectedContract}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Order --</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Order list depends on contract
              </p>
            </div>

            {/* Costing Detail Dropdown */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costing Detail
              </label>
              <select
                value={selectedCostingDetail}
                onChange={handleCostingDetailChange}
                disabled={!selectedOrder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Costing Detail --</option>
                {costingDetails.map((detail, index) => {
                  const cost =
                    detail.postCosting ||
                    detail.budget ||
                    detail.preCosting ||
                    "0.00";
                  const percent =
                    detail.b2bPercent || detail.budgetPercent || "0.00";
                  return (
                    <option key={detail.id || index} value={detail.id}>
                      {detail.name || `Item ${detail.id || index + 1}`}
                      {` - $${cost}`}
                      {` (${percent}% B2B)`}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Costing depends on order
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Shows: Item Name - Cost (% B2B) from order costing
              </p>
            </div>
          </div>

          {/* RIGHT PANEL (2/3 width) */}
          <div className="col-span-2">
            {/* Instructional Panel (shown when no costing selected) */}
            {!selectedCostingDetail && (
              <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select Costing Detail
                </h3>
                <p className="text-sm text-gray-600">
                  Choose Contract → Order → Costing Detail to enable B2B LC
                  form.
                </p>
              </div>
            )}

            {/* B2B LC Form (shown when costing selected) */}
            {selectedCostingDetail && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      B2B LC Information
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Order Qty / FOB auto-filled from order (editable).
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Row 1: Order Qty and FOB Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Order Qty (Pcs)
                      </label>
                      <input
                        type="number"
                        value={formData.orderQty}
                        onChange={handleOrderQtyChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        FOB Value/piece
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.fobValue}
                        onChange={handleFobValueChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 2: Order Value (full width, large display) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Order Value ($)
                    </label>
                    <input
                      type="text"
                      value={formData.orderValue.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-right text-2xl font-bold text-gray-900 bg-gray-100"
                    />
                  </div>

                  {/* Row 3: PI Number and Supplier */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        PI Number
                      </label>
                      <input
                        type="text"
                        value={formData.piNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, piNumber: e.target.value })
                        }
                        placeholder="Enter PI Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Supplier
                      </label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        placeholder="Enter Supplier Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 4: Post PI Value and B2B % */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Post Costing / Received PI Value ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.postPiValue}
                        onChange={handlePostPiValueChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        B2B %
                      </label>
                      <input
                        type="text"
                        value={formData.b2bPercent.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg text-right text-lg font-semibold text-indigo-600 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Calc: {formData.b2bPercent.toFixed(2)}% = Post PI /
                        Order Value × 100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save B2B LC
        </button>
      </div>
    </div>
  </div>
</div>
```

**Field Behaviors:**

1.  **Order Qty (Pcs)** - Editable (pre-filled from order, can be modified)
2.  **FOB Value/piece** - Editable (pre-filled from order, can be modified)
3.  **Order Value ($)** - Auto-calculated (Qty × FOB), read-only, large display
4.  **PI Number** - Manual input, required
5.  **Supplier** - Manual input (pre-filled from costing detail), editable
6.  **Post PI Value** - Manual input, required
7.  **B2B %** - Auto-calculated (Post PI ÷ Order Value × 100), read-only, indigo color
    value={formData.supplier}
    onChange={(e) =>
    setFormData({ ...formData, supplier: e.target.value })
    }
    className="w-full px-3 py-2 border rounded"
    placeholder="Enter Supplier Name"
    />
    </div>

                {/* Post Costing / Received PI Value - Editable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Costing / Received PI Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.postPIValue}
                    onChange={(e) => handlePostPIChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                {/* B2B % - Calculated (readonly, blue text) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    B2B %
                  </label>
                  <input
                    type="text"
                    value={formData.b2bPercent}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border rounded text-blue-600 font-semibold"
                  />
                </div>
              </div>

              {/* Save Button - Bottom Right */}
              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => navigate("/b2b-lc")}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save B2B LC
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

````

**State Management:**

```jsx
const [contracts, setContracts] = useState([]);
const [orders, setOrders] = useState([]);
const [costingDetails, setCostingDetails] = useState([]);

const [selectedContract, setSelectedContract] = useState("");
const [selectedOrder, setSelectedOrder] = useState("");
const [selectedCosting, setSelectedCosting] = useState("");

const [formData, setFormData] = useState({
  orderQty: "",
  fobValue: "",
  orderValue: "0.00",
  piNumber: "",
  supplier: "",
  postPIValue: "",
  b2bPercent: "0.00%",
});
````

**Calculation Logic:**

```jsx
// Calculate Order Value when FOB changes
const handleFobChange = (fobValue) => {
  const orderQty = parseFloat(formData.orderQty) || 0;
  const fob = parseFloat(fobValue) || 0;
  const orderValue = orderQty * fob;

  setFormData((prev) => ({
    ...prev,
    fobValue: fobValue,
    orderValue: orderValue.toFixed(2),
  }));

  // Recalculate B2B% if post PI value exists
  calculateB2BPercent(formData.postPIValue, orderValue);
};

// Calculate B2B% when Post PI Value changes
const handlePostPIChange = (postPIValue) => {
  const orderValue = parseFloat(formData.orderValue) || 0;

  setFormData((prev) => ({
    ...prev,
    postPIValue: postPIValue,
  }));

  calculateB2BPercent(postPIValue, orderValue);
};

// B2B% Calculation Function
const calculateB2BPercent = (postPIValue, orderValue) => {
  const postPI = parseFloat(postPIValue) || 0;
  const order = parseFloat(orderValue) || 0;

  if (order > 0) {
    const b2bPercent = (postPI / order) * 100;
    setFormData((prev) => ({
      ...prev,
      b2bPercent: b2bPercent.toFixed(2) + "%",
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      b2bPercent: "0.00%",
    }));
  }
};
```

**Dependent Dropdown Logic:**

```jsx
// Load contracts on mount
useEffect(() => {
  fetchContracts();
}, []);

const fetchContracts = async () => {
  const response = await fetch("/api/contracts");
  const data = await response.json();
  setContracts(data);
};

// Load orders when contract selected
const handleContractChange = async (e) => {
  const contractId = e.target.value;
  setSelectedContract(contractId);
  setSelectedOrder("");
  setSelectedCosting("");

  if (contractId) {
    const response = await fetch(`/api/contracts/${contractId}/orders`);
    const data = await response.json();
    setOrders(data);
  } else {
    setOrders([]);
  }
};

// Load costing details when order selected
const handleOrderChange = async (e) => {
  const orderId = e.target.value;
  setSelectedOrder(orderId);
  setSelectedCosting("");

  if (orderId) {
    const response = await fetch(`/api/orders/${orderId}`);
    const data = await response.json();

    // Auto-fill Order Qty from order
    setFormData((prev) => ({
      ...prev,
      orderQty: data.order_qty || "",
    }));

    // Extract costing details from cost_details JSON
    if (data.cost_details && Array.isArray(data.cost_details)) {
      setCostingDetails(data.cost_details);
    }
  } else {
    setCostingDetails([]);
    setFormData((prev) => ({
      ...prev,
      orderQty: "",
    }));
  }
};

// Auto-fill Post PI Value when costing selected
const handleCostingChange = (e) => {
  const costingId = e.target.value;
  setSelectedCosting(costingId);

  if (costingId) {
    const costing = costingDetails.find((c) => c.id == costingId);
    if (costing) {
      setFormData((prev) => ({
        ...prev,
        postPIValue: costing.postCosting || "",
      }));

      // Trigger B2B% calculation
      calculateB2BPercent(costing.postCosting, formData.orderValue);
    }
  }
};
```

**Save Function:**

```jsx
const handleSave = async () => {
  // Validation
  if (!selectedContract || !selectedOrder || !selectedCosting) {
    alert("Please select Contract, Order, and Costing Detail");
    return;
  }

  if (!formData.piNumber || !formData.supplier) {
    alert("Please enter PI Number and Supplier");
    return;
  }

  try {
    const payload = {
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
      status: "draft",
    };

    const response = await fetch("/api/b2b-lc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("B2B LC created successfully!");
      navigate("/b2b-lc");
    } else {
      const error = await response.json();
      alert("Error: " + error.message);
    }
  } catch (error) {
    console.error("Error saving B2B LC:", error);
    alert("Failed to save B2B LC");
  }
};
```

---

### 3. B2B LC Detail Page (`/b2b-lc/:id`)

#### File: `frontend/src/pages/B2BLCDetail.jsx`

**EXACT UI REQUIREMENTS FROM SCREENSHOT:**

**Page Title:** "B2B LC Details"  
**Subtitle:** "PI Number: {pi_number}"  
**Top-Right Buttons:**

- "Edit" button (indigo/blue)
- "Delete" button (red)
- "Back to List" button (gray)

**Layout:** Same 3-column grid layout as Create page

**Key Differences from Create Page:**

1. **Page Header:**

   - Shows "B2B LC Details" instead of "Create B2B LC"
   - Shows "PI Number: {pi_number}" as subtitle
   - Three action buttons in top-right: Edit (indigo), Delete (red), Back to List (gray)

2. **Left Panel - Reference Information:**

   - Shows read-only reference data in clean, simple format
   - **Contract Number** - Display contract_no
   - **Buyer** - Display buyer name
   - **Order Number** - Display order_number
   - **Costing Detail ID** - Display costing_detail_id
   - NO dropdowns, just static text display

3. **Right Panel - B2B LC Information:**

   - Shows "B2B LC Information" title
   - All fields displayed in same grid layout as Create page
   - **Initially in View Mode** - All fields are read-only with gray background
   - **Edit Mode** - Clicking Edit button makes fields editable (white background)

4. **Edit Mode Behavior:**

   - When Edit button clicked:
     - Button changes to "Cancel" (gray)
     - Form fields become editable (white background, border focus)
     - "Save B2B LC" button appears at bottom
     - Delete button remains visible
   - When Cancel clicked:
     - Return to view mode
     - Discard unsaved changes
     - Restore original values

5. **Footer Buttons in Edit Mode:**

   - "Cancel" button (gray, left side)
   - "Save B2B LC" button (indigo, right side)
   - Grouped together similar to Create page

6. **Delete Functionality:**
   - Shows confirmation dialog: "Are you sure you want to delete this B2B LC?"
   - If confirmed: DELETE API call, then navigate to list page
   - Show success message: "B2B LC deleted successfully"

**Layout Structure:**

```jsx
<div className="min-h-screen bg-gray-50">
  {/* Top Header Bar */}
  <div className="bg-white border-b border-gray-200">
    <div className="px-8 py-4 flex items-center justify-center relative">
      <h1 className="text-2xl font-bold text-gray-900">LC Management</h1>
      <div className="flex items-center gap-3 absolute right-8">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">S.M. Refat</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Viewer
        </span>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="p-8">
    <div className="bg-white rounded-lg shadow">
      {/* Page Header with Action Buttons */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            B2B LC Details
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            PI Number: {b2blc.pi_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={handleCancelEdit}
              className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => navigate("/b2b-lc")}
            className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Form Content - Same 3-column grid as Create page */}
      <form onSubmit={handleUpdate}>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Reference Information (1/3) */}
            <div className="col-span-1 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Reference Information
              </h3>

              {/* Contract Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Number
                </label>
                <div className="text-sm text-gray-900">
                  {b2blc.contract?.contract_no}
                </div>
              </div>

              {/* Buyer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buyer
                </label>
                <div className="text-sm text-gray-900">
                  {b2blc.contract?.buyer?.name}
                </div>
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <div className="text-sm text-gray-900">
                  {b2blc.order?.order_number}
                </div>
              </div>

              {/* Costing Detail ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costing Detail ID
                </label>
                <div className="text-sm text-gray-900">
                  {b2blc.costing_detail_id}
                </div>
              </div>
            </div>

            {/* Right Column - B2B LC Information (2/3) */}
            <div className="col-span-2">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                B2B LC Information
              </h3>

              {/* Same grid layout as Create page */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                {/* Row 1 - Order Qty, FOB Value, Order Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    name="order_qty"
                    value={formData.order_qty}
                    onChange={handleOrderQtyChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      isEditing
                        ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">2 pcs</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    FOB Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="fob_value"
                    value={formData.fob_value}
                    onChange={handleFobValueChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      isEditing
                        ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">$0.20</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Value (Auto-calculated)
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                    <div className="text-base font-bold text-gray-900">
                      ${formData.order_value}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">$0.4</p>
                </div>

                {/* Row 2 - PI Number (span 2), Supplier */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PI Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pi_number"
                    value={formData.pi_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      isEditing
                        ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">113</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      isEditing
                        ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">refat</p>
                </div>

                {/* Row 3 - Post PI Value (span 2), B2B % */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post Costing / Received PI Value ($){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="post_pi_value"
                    value={formData.post_pi_value}
                    onChange={handlePostPIChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                      isEditing
                        ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        : "bg-gray-50 cursor-not-allowed"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">$0.1</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    B2B %
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2">
                    <div className="text-base font-bold text-indigo-600">
                      {formData.b2b_percent}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Calc: 0.00% = Post PI / Order Value × 100
                  </p>
                  <p className="text-xs text-gray-500">25.00%</p>
                </div>
              </div>

              {/* Director Sir Command - Full Width */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Director Sir Command
                </label>
                <textarea
                  name="director_command"
                  value={formData.director_command}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="3"
                  placeholder="-"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
                    isEditing
                      ? "bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              {/* Status */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      formData.status === "draft"
                        ? "bg-gray-100 text-gray-700"
                        : formData.status === "active"
                        ? "bg-green-100 text-green-700"
                        : formData.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {formData.status.charAt(0).toUpperCase() +
                      formData.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Only show in Edit Mode */}
        {isEditing && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save B2B LC"}
            </button>
          </div>
        )}
      </form>

      {/* Created/Updated Timestamps */}
      <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div>Created: {formatDate(b2blc.created_at)}</div>
        <div>Last Updated: {formatDate(b2blc.updated_at)}</div>
      </div>
    </div>
  </div>
</div>
```

**State Management:**

```jsx
const [isEditing, setIsEditing] = useState(false);
const [loading, setLoading] = useState(false);
const [b2blc, setB2blc] = useState(null);
const [formData, setFormData] = useState({
  pi_number: "",
  supplier: "",
  order_qty: "",
  fob_value: "",
  order_value: "",
  post_pi_value: "",
  b2b_percent: "",
  director_command: "",
  status: "draft",
});
```

**Key Functions:**

```jsx
// Cancel edit mode
const handleCancelEdit = () => {
  setIsEditing(false);
  // Restore original values
  setFormData({
    pi_number: b2blc.pi_number,
    supplier: b2blc.supplier,
    order_qty: b2blc.order_qty,
    fob_value: b2blc.fob_value,
    order_value: b2blc.order_value,
    post_pi_value: b2blc.post_pi_value,
    b2b_percent: b2blc.b2b_percent,
    director_command: b2blc.director_command || "",
    status: b2blc.status,
  });
};

// Delete B2B LC
const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this B2B LC?")) {
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/b2b-lc/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete B2B LC");

    alert("B2B LC deleted successfully");
    navigate("/b2b-lc");
  } catch (error) {
    console.error("Error deleting B2B LC:", error);
    alert("Failed to delete B2B LC");
  }
};

// Update B2B LC
const handleUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/b2b-lc/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Failed to update B2B LC");

    const data = await response.json();
    setB2blc(data);
    setIsEditing(false);
    alert("B2B LC updated successfully");
  } catch (error) {
    console.error("Error updating B2B LC:", error);
    alert("Failed to update B2B LC");
  } finally {
    setLoading(false);
  }
};
```

**Features:**

1. ✅ Same 3-column grid layout as Create page
2. ✅ Left panel shows reference information (read-only)
3. ✅ Right panel shows B2B LC fields
4. ✅ Edit button toggles edit mode
5. ✅ Fields disabled with gray background in view mode
6. ✅ Fields enabled with white background in edit mode
7. ✅ Delete button with confirmation
8. ✅ Cancel button discards changes
9. ✅ Auto-calculations work in edit mode
10. ✅ Timestamps shown at bottom

---

## 🔧 Backend Specifications

### 1. Database Migration

#### File: `backend/database/migrations/2025_12_10_000001_create_b2b_lcs_table.php`

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

            // Metadata
            $table->timestamps();

            // Indexes
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

### 2. Eloquent Model

#### File: `backend/app/Models/B2BLC.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B2BLC extends Model
{
    protected $table = 'b2b_lcs';

    protected $fillable = [
        'contract_id',
        'order_id',
        'costing_detail_id',
        'pi_number',
        'supplier',
        'order_qty',
        'fob_value',
        'order_value',
        'post_pi_value',
        'b2b_percent',
        'status',
    ];

    protected $casts = [
        'order_qty' => 'integer',
        'fob_value' => 'decimal:2',
        'order_value' => 'decimal:2',
        'post_pi_value' => 'decimal:2',
        'b2b_percent' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Accessors & Mutators
     */
    public function getFormattedOrderValueAttribute(): string
    {
        return '$' . number_format($this->order_value, 2);
    }

    public function getFormattedB2BPercentAttribute(): string
    {
        return number_format($this->b2b_percent, 2) . '%';
    }

    /**
     * Scopes
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('pi_number', 'like', "%{$search}%")
              ->orWhere('supplier', 'like', "%{$search}%");
        });
    }

    public function scopeByStatus($query, $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }
        return $query;
    }
}
```

---

### 3. Controller

#### File: `backend/app/Http/Controllers/B2BLCController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\B2BLC;
use App\Http\Requests\StoreB2BLCRequest;
use App\Http\Requests\UpdateB2BLCRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class B2BLCController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/b2b-lc",
     *     tags={"B2B LC"},
     *     summary="Get list of B2B LCs with filters",
     *     @OA\Parameter(
     *         name="pi_number",
     *         in="query",
     *         description="Filter by PI Number",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="supplier",
     *         in="query",
     *         description="Filter by Supplier",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by Status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"draft", "active", "completed", "cancelled"})
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of B2B LCs"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = B2BLC::with(['contract', 'order']);

        // Search filters
        if ($request->has('pi_number')) {
            $query->where('pi_number', 'like', '%' . $request->pi_number . '%');
        }

        if ($request->has('supplier')) {
            $query->where('supplier', 'like', '%' . $request->supplier . '%');
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $b2bLCs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($b2bLCs);
    }

    /**
     * @OA\Post(
     *     path="/api/b2b-lc",
     *     tags={"B2B LC"},
     *     summary="Create new B2B LC",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"contract_id", "order_id", "costing_detail_id", "pi_number", "supplier"},
     *             @OA\Property(property="contract_id", type="integer"),
     *             @OA\Property(property="order_id", type="integer"),
     *             @OA\Property(property="costing_detail_id", type="integer"),
     *             @OA\Property(property="pi_number", type="string"),
     *             @OA\Property(property="supplier", type="string"),
     *             @OA\Property(property="order_qty", type="integer"),
     *             @OA\Property(property="fob_value", type="number", format="float"),
     *             @OA\Property(property="order_value", type="number", format="float"),
     *             @OA\Property(property="post_pi_value", type="number", format="float"),
     *             @OA\Property(property="b2b_percent", type="number", format="float"),
     *             @OA\Property(property="status", type="string", enum={"draft", "active"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="B2B LC created successfully"
     *     )
     * )
     */
    public function store(StoreB2BLCRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Calculate order value if not provided
        if (!isset($validated['order_value'])) {
            $validated['order_value'] = $validated['order_qty'] * $validated['fob_value'];
        }

        // Calculate B2B% if not provided
        if (!isset($validated['b2b_percent']) && $validated['order_value'] > 0) {
            $validated['b2b_percent'] = ($validated['post_pi_value'] / $validated['order_value']) * 100;
        }

        $b2bLC = B2BLC::create($validated);

        return response()->json([
            'message' => 'B2B LC created successfully',
            'data' => $b2bLC->load(['contract', 'order'])
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Get single B2B LC details",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="B2B LC details"
     *     )
     * )
     */
    public function show(B2BLC $b2bLC): JsonResponse
    {
        return response()->json($b2bLC->load(['contract', 'order']));
    }

    /**
     * @OA\Put(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Update B2B LC",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/B2BLC")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="B2B LC updated successfully"
     *     )
     * )
     */
    public function update(UpdateB2BLCRequest $request, B2BLC $b2bLC): JsonResponse
    {
        $validated = $request->validated();

        // Recalculate values if relevant fields changed
        if (isset($validated['order_qty']) || isset($validated['fob_value'])) {
            $orderQty = $validated['order_qty'] ?? $b2bLC->order_qty;
            $fobValue = $validated['fob_value'] ?? $b2bLC->fob_value;
            $validated['order_value'] = $orderQty * $fobValue;
        }

        if (isset($validated['post_pi_value']) || isset($validated['order_value'])) {
            $postPIValue = $validated['post_pi_value'] ?? $b2bLC->post_pi_value;
            $orderValue = $validated['order_value'] ?? $b2bLC->order_value;

            if ($orderValue > 0) {
                $validated['b2b_percent'] = ($postPIValue / $orderValue) * 100;
            }
        }

        $b2bLC->update($validated);

        return response()->json([
            'message' => 'B2B LC updated successfully',
            'data' => $b2bLC->load(['contract', 'order'])
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/b2b-lc/{id}",
     *     tags={"B2B LC"},
     *     summary="Delete B2B LC",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="B2B LC deleted successfully"
     *     )
     * )
     */
    public function destroy(B2BLC $b2bLC): JsonResponse
    {
        $b2bLC->delete();

        return response()->json([
            'message' => 'B2B LC deleted successfully'
        ]);
    }
}
```

---

### 4. Request Validation

#### File: `backend/app/Http/Requests/StoreB2BLCRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreB2BLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
        ];
    }

    public function messages(): array
    {
        return [
            'pi_number.unique' => 'This PI Number already exists in the system.',
            'supplier.min' => 'Supplier name must be at least 2 characters.',
            'order_qty.min' => 'Order quantity must be at least 1.',
        ];
    }
}
```

#### File: `backend/app/Http/Requests/UpdateB2BLCRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateB2BLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contract_id' => 'sometimes|exists:contracts,id',
            'order_id' => 'sometimes|exists:orders,id',
            'costing_detail_id' => 'sometimes|integer',
            'pi_number' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('b2b_lcs')->ignore($this->route('b2bLC'))
            ],
            'supplier' => 'sometimes|string|min:2|max:255',
            'order_qty' => 'sometimes|integer|min:1',
            'fob_value' => 'sometimes|numeric|min:0',
            'order_value' => 'sometimes|numeric|min:0',
            'post_pi_value' => 'sometimes|numeric|min:0',
            'b2b_percent' => 'sometimes|numeric|min:0|max:100',
            'status' => 'sometimes|in:draft,active,completed,cancelled',
        ];
    }
}
```

---

### 5. API Routes

#### File: `backend/routes/api.php`

```php
use App\Http\Controllers\B2BLCController;

// B2B LC Routes
Route::apiResource('b2b-lc', B2BLCController::class);

// Additional helper endpoints
Route::get('/contracts/{contract}/orders', [B2BLCController::class, 'getContractOrders']);
```

---

## 📊 API Endpoint Summary

| Method | Endpoint                     | Purpose                          |
| ------ | ---------------------------- | -------------------------------- |
| GET    | `/api/b2b-lc`                | List all B2B LCs with filters    |
| GET    | `/api/b2b-lc/{id}`           | Get single B2B LC                |
| POST   | `/api/b2b-lc`                | Create new B2B LC                |
| PUT    | `/api/b2b-lc/{id}`           | Update B2B LC                    |
| DELETE | `/api/b2b-lc/{id}`           | Delete B2B LC                    |
| GET    | `/api/contracts/{id}/orders` | Get orders for contract (helper) |

---

## 🎯 Business Logic Summary

### Calculations

1. **Order Value:**

   ```
   Order Value = Order Qty × FOB Value/piece
   ```

2. **B2B Percentage:**
   ```
   B2B % = (Post PI Value / Order Value) × 100
   ```

### Dependencies

1. **Contract → Order:** Order dropdown loads after contract selected
2. **Order → Costing:** Costing dropdown loads from order's cost_details JSON
3. **Auto-fill:** Order Qty auto-fills when order selected
4. **Auto-calculation:** Order Value and B2B% calculate automatically

---

## ✅ Validation Summary

### Required Fields

- Contract (dropdown selection)
- Order (dropdown selection)
- Costing Detail (dropdown selection)
- PI Number (unique)
- Supplier (min 2 chars)
- Order Qty (> 0)
- FOB Value (≥ 0)
- Post PI Value (≥ 0)

### Calculated Fields

- Order Value (auto)
- B2B % (auto)

### Status Values

- draft (default)
- active
- completed
- cancelled

---

**Document Status:** ✅ Complete Technical Specification  
**Next Step:** Proceed to B2B_LC_PLAN.md for implementation planning
