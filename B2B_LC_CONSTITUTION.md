# B2B LC Module - Constitution Document

**Project:** LC Management System  
**Module:** B2B LC (Back-to-Back Letter of Credit)  
**Version:** 1.0.0  
**Date:** December 10, 2025  
**Status:** 📋 Planning Phase

---

## 🎯 Module Purpose

The B2B LC module manages Back-to-Back Letter of Credit records, tracking post-costing PI values against order values to calculate B2B percentages. It provides complete CRUD operations with dependent dropdown selections and automatic calculations.

---

## 🏗️ Module Architecture

### Core Components

```
B2B LC Module
├── Frontend (React + Tailwind)
│   ├── B2BLCList.jsx          // List page with filters and table
│   ├── CreateB2BLC.jsx         // Create page with dropdowns and form
│   └── B2BLCDetail.jsx         // View/Edit detail page
│
├── Backend (Laravel 11)
│   ├── Models
│   │   └── B2BLC.php           // Eloquent model with relationships
│   ├── Controllers
│   │   └── B2BLCController.php // CRUD operations
│   ├── Requests
│   │   ├── StoreB2BLCRequest.php
│   │   └── UpdateB2BLCRequest.php
│   └── Migrations
│       └── create_b2b_lcs_table.php
│
└── Database
    └── b2b_lcs table            // Main table with foreign keys
```

---

## 📊 Data Relationships

```
contracts (1) ──→ (n) orders
orders (1) ──→ (n) cost_details
cost_details (1) ──→ (1) b2b_lcs

B2B LC stores:
- Selected contract_id
- Selected order_id
- Selected costing_detail_id (from orders.cost_details JSON)
- PI details and calculations
```

---

## 🎨 UI Design Specifications

### List Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ B2B LC List                    [+ Create B2B LC] Button │
├─────────────────────────────────────────────────────────┤
│ Filters:                                                 │
│ [PI Number Input]  [Supplier Input]  [Search Button]    │
├─────────────────────────────────────────────────────────┤
│ Table:                                                   │
│ # │ PI Number │ Supplier │ Amount ($) │ B2B % │ ...     │
│───┼───────────┼──────────┼───────────┼───────┼─────    │
│ 1 │ PI-001    │ ABC Ltd  │ 10,000    │ 45%   │ [Show] │
└─────────────────────────────────────────────────────────┘
```

### Create Page Layout

```
┌──────────────────────┐  ┌──────────────────────────────┐
│ Contract Selection   │  │ B2B LC Information           │
│ [Contract Dropdown▼] │  │                              │
├──────────────────────┤  │ Order Qty: [Auto-filled]     │
│ Order Selection      │  │ FOB Value/piece: [Input]     │
│ [Order Dropdown▼]    │  │ Order Value ($): [Calculated]│
├──────────────────────┤  │                              │
│ Costing Detail       │  │ PI Number: [Input]           │
│ [Costing Dropdown▼]  │  │ Supplier: [Input]            │
└──────────────────────┘  │ Post PI Value: [Input]       │
                          │ B2B %: [Calculated]          │
                          │                              │
                          │         [Save B2B LC Button] │
                          └──────────────────────────────┘
```

---

## 🔄 User Workflows

### Create B2B LC Workflow

1. **Navigate:** Click "Create B2B LC" button on list page
2. **Select Contract:** Choose from dropdown → Loads related orders
3. **Select Order:** Choose order → Loads costing details + auto-fills Order Qty
4. **Select Costing Detail:** Choose costing item → Auto-fills Post PI value
5. **Enter PI Info:** Input PI Number, Supplier, FOB Value
6. **Calculations:**
   - Order Value = Order Qty × FOB Value/piece
   - B2B % = (Post PI Value / Order Value) × 100
7. **Save:** Submit form → Creates B2B LC record

### List & Filter Workflow

1. **View List:** See all B2B LC records in table
2. **Filter:** Search by PI Number or Supplier name
3. **View Detail:** Click "Show" → Opens detail page
4. **Edit:** Modify existing record
5. **Status Updates:** Change status via dropdown

---

## 📐 Calculation Formulas

### Order Value Calculation

```
Order Value ($) = Order Qty (Pcs) × FOB Value/piece ($)
```

### B2B Percentage Calculation

```
B2B % = (Post Costing / Received PI Value ($) / Order Value ($)) × 100
```

**Example:**

- Order Qty: 5,000 pcs
- FOB Value/piece: $2.50
- Order Value: 5,000 × $2.50 = $12,500
- Post PI Value: $5,625
- B2B %: ($5,625 / $12,500) × 100 = 45%

---

## 🔒 Validation Rules

### Required Fields

- Contract (must select valid contract)
- Order (must select valid order)
- Costing Detail (must select valid costing item)
- PI Number (unique, alphanumeric)
- Supplier (text, min 2 characters)
- FOB Value/piece (numeric, > 0)
- Post PI Value (numeric, ≥ 0)

### Business Rules

- Cannot create B2B LC without selecting all dropdowns
- Order Value must be > 0 for B2B% calculation
- PI Number must be unique across system
- Status must be valid enum value

---

## 🎨 UI Component Specifications

### List Page Components

**Filters Section:**

- 2 text inputs (PI Number, Supplier)
- Search button (indigo-600)
- Clear filters option

**Table Component:**

- Sticky header
- Sortable columns
- Pagination (15 items/page)
- Status badges (color-coded)
- Action buttons (Show/Edit/Delete)

### Create Page Components

**Left Panel - Dropdowns:**

- Contract dropdown (loads from `/api/contracts`)
- Order dropdown (dependent, loads from selected contract)
- Costing Detail dropdown (dependent, loads from selected order)
- All dropdowns use Tailwind select styling

**Right Panel - Form Card:**

- White background, shadow-sm
- Organized in 2-column grid
- Readonly fields: gray background
- Calculated fields: blue text
- Input fields: white with border

**Save Button:**

- Position: Bottom-right of card
- Style: Indigo-600 background, white text
- Hover: Indigo-700

---

## 📱 Responsive Design

### Desktop (≥1024px)

- Two-column layout (dropdowns left, form right)
- Table shows all columns
- Filters in single row

### Tablet (768px - 1023px)

- Single column, dropdowns above form
- Table horizontally scrollable
- Filters in single row

### Mobile (<768px)

- Stacked vertical layout
- Table with horizontal scroll
- Filters stacked vertically

---

## 🔐 Security & Permissions

### Access Control

- **View List:** All authenticated users
- **Create:** Managers and above
- **Edit:** Managers and above
- **Delete:** Admins only

### Data Validation

- Server-side validation (Laravel Request classes)
- Client-side validation (React form validation)
- CSRF protection on all mutations
- SQL injection prevention (Eloquent ORM)

---

## 🚀 Performance Requirements

### Response Times

- List page load: < 500ms
- Create form load: < 300ms
- Save operation: < 1s
- Search/filter: < 200ms

### Optimization

- Lazy loading for dropdowns
- Debounced search inputs
- Paginated results
- Indexed database columns

---

## 📊 Success Metrics

### User Experience

- Form completion time: < 2 minutes
- Error rate: < 5%
- User satisfaction: > 90%

### System Performance

- API response time: < 500ms (95th percentile)
- Database queries: < 100ms average
- Uptime: > 99.5%

---

## 🔄 Integration Points

### Internal Systems

- Contracts module (dropdown data)
- Orders module (dropdown data, calculations)
- Cost Details (from Orders module)

### External Systems

- None (standalone module)

---

## 📝 Data Retention

### Active Records

- Stored indefinitely
- Full history maintained

### Audit Trail

- All create/update/delete operations logged
- User ID and timestamp recorded
- Previous values stored for updates

---

## 🎯 Success Criteria

### Module Completion

✅ All CRUD operations functional  
✅ Dependent dropdowns working correctly  
✅ Automatic calculations accurate  
✅ UI matches design specifications exactly  
✅ Form validation preventing invalid data  
✅ Search and filter operational  
✅ Responsive design implemented  
✅ API endpoints documented in Swagger

---

## 📚 Documentation Deliverables

1. ✅ B2B_LC_CONSTITUTION.md (this file)
2. ⏳ B2B_LC_SPECIFICATION.md
3. ⏳ B2B_LC_PLAN.md
4. ⏳ B2B_LC_TASKS.md
5. ⏳ B2B_LC_IMPLEMENTATION_CHECKLIST.md
6. ⏳ B2B_LC_DATA_MODEL.md
7. ⏳ B2B_LC_SWAGGER_SPEC.md

---

**Document Status:** ✅ Complete and Ready for Implementation  
**Next Step:** Proceed to B2B_LC_SPECIFICATION.md for detailed technical specifications
