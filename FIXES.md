# Bug Fixes & Updates

## December 8, 2025

### 🐛 Fixed: Tailwind CSS v4 Configuration Issue

**Problem:** Frontend page displayed unstyled HTML (only raw buttons visible, no colors/styling)

**Root Cause:**

- Project uses Tailwind CSS v4.1.17
- `frontend/src/index.css` was using old v3 syntax: `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
- Tailwind v4 requires: `@import "tailwindcss";`

**Fix Applied:**

```css
/* Before (v3 syntax) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4 syntax) */
@import "tailwindcss";
```

**Files Modified:**

- `frontend/src/index.css`

**Result:** ✅ Full dashboard styling now renders correctly with blue headers, colored cards, styled tables, and proper button styling.

---

### 🐛 Fixed: Empty Buyer Dropdown in Edit Contract Modal

**Problem:** When editing a contract, the Buyer dropdown showed "Select a buyer" but no buyer names appeared.

**Root Cause:**

- Backend API `/api/buyers` returns array directly: `[{id: 1, name: "..."}, ...]`
- Frontend code tried to access: `data.buyers` (which is undefined)
- Code: `setBuyers(data.buyers || [])`

**Fix Applied:**

```javascript
// Before
const data = await response.json();
setBuyers(data.buyers || []);

// After
const data = await response.json();
setBuyers(Array.isArray(data) ? data : []);
```

**Files Modified:**

- `frontend/src/components/contracts/EditContractModal.jsx`

**Additional Changes:**

- Updated API URL from `http://localhost:8000` to `http://127.0.0.1:8000` for consistency
- Added console logging for debugging: `console.log("✅ Loaded buyers:", data.length)`

**Result:** ✅ Edit modal now displays all 10 buyers in dropdown (Aufderhar LLC, Pfannerstill PLC, etc.)

---

### 🐛 Fixed: Add New Contract Modal - "Failed to load form data"

**Problem:**

1. Modal displayed error: "Failed to load form data. Please try again."
2. Buyer dropdown was empty
3. Contract number field was not auto-populated
4. Create button did not work

**Root Causes:**

1. **API URL mismatch:** Code used `http://localhost:8000` but backend runs on `http://127.0.0.1:8000`
2. **Buyers data structure:** Same issue as Edit modal - tried to access `buyersData.buyers` when API returns array directly
3. **Environment variable fallback:** `import.meta.env.VITE_API_URL || "http://localhost:8000"` defaulted to wrong URL

**Fix Applied:**

```javascript
// Before - API URL issues
const [contractNoRes, buyersRes] = await Promise.all([
  fetch(
    `${
      import.meta.env.VITE_API_URL || "http://localhost:8000"
    }/api/contracts/next-number?year=${currentYear}`
  ),
  fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/buyers`
  ),
]);

// After - Fixed URLs
const [contractNoRes, buyersRes] = await Promise.all([
  fetch(`http://127.0.0.1:8000/api/contracts/next-number?year=${currentYear}`),
  fetch(`http://127.0.0.1:8000/api/buyers`),
]);

// Before - Buyers data handling
setBuyers(buyersData.buyers || buyersData);

// After - Correct array handling
setBuyers(Array.isArray(buyersData) ? buyersData : []);
```

**Files Modified:**

- `frontend/src/components/contracts/AddContractModal.jsx`
  - Fixed `fetchInitialData()` API URLs (2 endpoints)
  - Fixed `handleSubmit()` API URL (create contract endpoint)
  - Fixed buyers data extraction
  - Added console logging for debugging

**Result:** ✅ Add New Contract modal now:

- Opens without errors
- Auto-fills contract number: `IIC/AKCL/CON/2025/29`
- Shows 10 buyers in dropdown
- Successfully creates contracts via API

---

## Technical Notes

### API Endpoint Behavior

**Buyers Endpoint:** `GET /api/buyers`

```json
// Returns array directly (NOT wrapped in object)
[
  {"id": 1, "name": "Jerde Group"},
  {"id": 2, "name": "Aufderhar LLC"},
  {"id": 3, "name": "Pfannerstill PLC"},
  ...
]
```

### Server Configuration

- **Backend:** Runs on `http://127.0.0.1:8000` (not `localhost:8000`)
- **Frontend:** Runs on `http://localhost:5174` (port 5174, not default 5173)
- **CORS:** Backend configured to accept requests from `localhost:5174` and `127.0.0.1:5174`

### Files with Hardcoded URLs

All modal components now use `http://127.0.0.1:8000` directly instead of environment variable fallbacks:

- `frontend/src/components/contracts/AddContractModal.jsx`
- `frontend/src/components/contracts/EditContractModal.jsx`

Main API service still uses environment variable:

- `frontend/src/services/api.js` - Uses `VITE_API_URL` from `.env.local`

---

## Testing Checklist

- [x] Dashboard loads with full styling (blue header, colored cards, styled table)
- [x] "Add New Contract" button opens modal without errors
- [x] Add modal: Contract number auto-fills with next available number
- [x] Add modal: Buyer dropdown shows all 10 buyer names
- [x] Add modal: Can successfully create a new contract
- [x] Table: "Edit" button opens edit modal
- [x] Edit modal: Buyer dropdown shows all 10 buyer names
- [x] Edit modal: Form pre-populates with existing contract data
- [x] Edit modal: Can successfully update contract
- [x] Table: "Show" button opens view modal (read-only)

---

## Browser Developer Tools - Expected Console Output

When opening Add/Edit modals, you should see:

```
✅ Contract number: IIC/AKCL/CON/2025/29
✅ Buyers loaded: 10
🚀 [ContractsOverview] Fetching contracts with params: {page: 1, per_page: 15}
✅ [ContractsOverview] Received data: {contracts: Array(15), pagination: {...}, summary: {...}}
📊 [ContractsOverview] Contracts: 15 Summary: {total_contracts: 30, ...}
🎨 [ContractsOverview] Rendering with state: {loading: false, contractsLength: 15, hasError: false, hasSummary: true}
✅ [ContractsOverview] Rendering main dashboard
```

If you see errors (❌), check:

1. Backend is running on `http://127.0.0.1:8000`
2. Frontend is running on `http://localhost:5174`
3. Hard refresh browser with Ctrl+Shift+R
