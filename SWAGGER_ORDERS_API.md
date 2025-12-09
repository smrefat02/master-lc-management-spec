# Swagger API Documentation - Orders Module

**Date Added:** December 9, 2025  
**API Version:** 1.1.0  
**Status:** ✅ Complete

---

## 📋 Overview

Added comprehensive Swagger/OpenAPI documentation for the Orders Management module. All 5 CRUD endpoints are now fully documented with interactive testing available via Swagger UI.

---

## 🔗 Access Swagger UI

**Local Development:**

- **Swagger UI:** http://127.0.0.1:8000/api/documentation
- **OpenAPI JSON:** http://127.0.0.1:8000/docs/api-docs.json

---

## 📡 Orders API Endpoints

### 1. **GET /api/orders**

**List Orders**

- **Operation ID:** `getOrdersList`
- **Tag:** Orders
- **Description:** Returns paginated list of orders with search and filter capabilities

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| search | string | No | Search by order number, buyer name, or contract number | "122" |
| status | string | No | Filter by status (draft, on_process, completed, cancelled) | "draft" |
| page | integer | No | Page number for pagination | 1 |
| per_page | integer | No | Items per page (default: 15) | 15 |

**Response 200:**

```json
{
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-000123",
      "buyer_name": "ABC Corp",
      "contract_no": "IIC/AKCL/CON/2025/01",
      "order_qty": 5000,
      "order_value": 45000.0,
      "shipment_date": "2025-12-15",
      "status": "draft",
      "contract": {
        "id": 1,
        "buyer": {
          "id": 1,
          "name": "ABC Corp"
        }
      }
    }
  ],
  "total": 50,
  "current_page": 1,
  "last_page": 4
}
```

---

### 2. **POST /api/orders**

**Create Order**

- **Operation ID:** `createOrder`
- **Tag:** Orders
- **Description:** Creates a new order with cost details and totals

**Request Body (JSON):**

```json
{
  "salesContract": 1, // Required - Contract ID
  "orderNumber": "ORD-000123", // Optional - Auto-generated if empty
  "buyerName": "ABC Corp",
  "masterLCValue": 50000.0,
  "budgetNo": "3",
  "orderValue": 45000.0,
  "description": "Winter collection order",
  "contractNo": "IIC/AKCL/CON/2025/01",
  "status": "draft", // draft | on_process | completed | cancelled
  "style": "CASUAL-001",
  "fobValue": 12.5,
  "orderQty": 5000,
  "shipmentDate": "2025-12-15",
  "actualShipment": "2025-12-13", // Optional
  "fabricsDetails": "100% Cotton, 180 GSM",
  "notes": "Rush order",
  "costDetails": [
    {
      "id": 1,
      "name": "YARN",
      "preCosting": 0.5,
      "budget": 0.45,
      "budgetPercent": 5.5,
      "postCosting": 0.48,
      "b2bPercent": 6.0,
      "status": "draft"
    }
    // ... more cost items
  ],
  "totals": {
    "fabricsPreCosting": 3.5,
    "fabricsBudget": 3.15,
    "accessoriesPreCosting": 2.0,
    "accessoriesBudget": 1.85,
    "totalPreCosting": 5.5,
    "totalBudget": 5.0
  }
}
```

**Response 201:**

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-000123"
    // ... complete order object
  }
}
```

**Response 422:** Validation Error

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "salesContract": ["The sales contract field is required."]
  }
}
```

---

### 3. **GET /api/orders/{id}**

**Get Order by ID**

- **Operation ID:** `getOrderById`
- **Tag:** Orders
- **Description:** Returns a single order with all details including cost breakdown

**Path Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | Order ID | 1 |

**Response 200:**

```json
{
  "id": 1,
  "contract_id": 1,
  "order_number": "ORD-000123",
  "buyer_name": "ABC Corp",
  "master_lc_value": 50000.0,
  "budget_no": "3",
  "order_value": 45000.0,
  "description": "Winter collection order",
  "contract_no": "IIC/AKCL/CON/2025/01",
  "status": "draft",
  "style": "CASUAL-001",
  "fob_value": 12.5,
  "order_qty": 5000,
  "shipment_date": "2025-12-15",
  "actual_shipment": "2025-12-13",
  "fabrics_details": "100% Cotton, 180 GSM",
  "notes": "Rush order",
  "cost_details": [
    {
      "id": 1,
      "name": "YARN",
      "preCosting": 0.5,
      "budget": 0.45,
      "budgetPercent": 5.5,
      "postCosting": 0.48,
      "b2bPercent": 6.0,
      "status": "draft"
    }
  ],
  "totals": {
    "fabricsPreCosting": 3.5,
    "fabricsBudget": 3.15,
    "accessoriesPreCosting": 2.0,
    "accessoriesBudget": 1.85,
    "totalPreCosting": 5.5,
    "totalBudget": 5.0
  },
  "created_at": "2025-12-09T10:30:00Z",
  "updated_at": "2025-12-09T14:45:00Z",
  "contract": {
    "id": 1,
    "contract_no": "IIC/AKCL/CON/2025/01",
    "buyer": {
      "id": 1,
      "name": "ABC Corp"
    }
  }
}
```

**Response 404:** Order not found

---

### 4. **PUT /api/orders/{id}**

**Update Order**

- **Operation ID:** `updateOrder`
- **Tag:** Orders
- **Description:** Updates an existing order with new data

**Path Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | Order ID | 1 |

**Request Body (JSON):** Same as POST /api/orders (all fields optional)

**Response 200:**

```json
{
  "message": "Order updated successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-000123"
    // ... complete updated order object
  }
}
```

**Response 404:** Order not found  
**Response 422:** Validation Error

---

### 5. **DELETE /api/orders/{id}**

**Delete Order**

- **Operation ID:** `deleteOrder`
- **Tag:** Orders
- **Description:** Deletes an order permanently

**Path Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | Order ID | 1 |

**Response 200:**

```json
{
  "message": "Order deleted successfully"
}
```

**Response 404:** Order not found

---

## 📊 Data Schemas

### Order Schema

Complete order object with all fields including:

- Basic info (order_number, buyer_name, order_value, etc.)
- Dates (shipment_date, actual_shipment)
- Status tracking (draft, on_process, completed, cancelled)
- Cost breakdown (cost_details array)
- Calculated totals (totals object)
- Relationships (contract with buyer)

### CostDetail Schema

Individual cost item structure:

```json
{
  "id": 1,
  "name": "YARN",
  "preCosting": 0.5,
  "budget": 0.45,
  "budgetPercent": 5.5,
  "postCosting": 0.48,
  "b2bPercent": 6.0,
  "status": "draft"
}
```

**Standard Cost Items:**

1. YARN
2. Knitting
3. Dyeing
4. Y/D (Yarn Dyed)
5. Lycra
6. Brush Wash
7. AOP (All Over Print)
8. Accessories
9. Testing
10. Printing
11. Embroidery
12. Courier & Inspector
13. DC & BC (Discount)
14. Penalty & C.A

### OrderTotals Schema

Calculated totals for cost analysis:

```json
{
  "fabricsPreCosting": 3.5,
  "fabricsBudget": 3.15,
  "accessoriesPreCosting": 2.0,
  "accessoriesBudget": 1.85,
  "totalPreCosting": 5.5,
  "totalBudget": 5.0
}
```

---

## 🔐 Field Mapping

The API uses camelCase in requests but stores data in snake_case in the database.

**Automatic Field Mapping:**
| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| orderNumber | order_number |
| buyerName | buyer_name |
| masterLCValue | master_lc_value |
| budgetNo | budget_no |
| orderValue | order_value |
| contractNo | contract_no |
| fobValue | fob_value |
| orderQty | order_qty |
| shipmentDate | shipment_date |
| actualShipment | actual_shipment |
| fabricsDetails | fabrics_details |
| costDetails | cost_details |

---

## 🎨 Status Values

| Status     | Description            | Color |
| ---------- | ---------------------- | ----- |
| draft      | Initial creation state | Gray  |
| on_process | Order in progress      | Blue  |
| completed  | Order fulfilled        | Green |
| cancelled  | Order cancelled        | Red   |

---

## 📝 Usage Examples

### Using cURL

**List Orders:**

```bash
curl -X GET "http://127.0.0.1:8000/api/orders?search=122&status=draft&page=1" \
  -H "Accept: application/json"
```

**Create Order:**

```bash
curl -X POST "http://127.0.0.1:8000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "salesContract": 1,
    "orderNumber": "ORD-000123",
    "buyerName": "ABC Corp",
    "orderValue": 45000.00,
    "status": "draft"
  }'
```

**Get Order:**

```bash
curl -X GET "http://127.0.0.1:8000/api/orders/1" \
  -H "Accept: application/json"
```

**Update Order:**

```bash
curl -X PUT "http://127.0.0.1:8000/api/orders/1" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "status": "on_process",
    "orderValue": 46000.00
  }'
```

**Delete Order:**

```bash
curl -X DELETE "http://127.0.0.1:8000/api/orders/1" \
  -H "Accept: application/json"
```

### Using JavaScript/Fetch

**Create Order:**

```javascript
const response = await fetch("http://127.0.0.1:8000/api/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    salesContract: 1,
    orderNumber: "ORD-000123",
    buyerName: "ABC Corp",
    orderValue: 45000.0,
    costDetails: [
      {
        id: 1,
        name: "YARN",
        preCosting: 0.5,
        budget: 0.45,
      },
    ],
    totals: {
      totalPreCosting: 5.5,
      totalBudget: 5.0,
    },
  }),
});

const data = await response.json();
console.log(data);
```

---

## 🧪 Testing with Swagger UI

### Step-by-Step Testing:

1. **Access Swagger UI:**

   - Open: http://127.0.0.1:8000/api/documentation

2. **Test GET /api/orders:**

   - Expand "Orders" section
   - Click "GET /api/orders"
   - Click "Try it out"
   - Enter search parameters (optional)
   - Click "Execute"
   - View response

3. **Test POST /api/orders:**

   - Click "POST /api/orders"
   - Click "Try it out"
   - Modify the request body JSON
   - Ensure `salesContract` has a valid contract ID
   - Click "Execute"
   - Check 201 response with created order

4. **Test GET /api/orders/{id}:**

   - Click "GET /api/orders/{id}"
   - Click "Try it out"
   - Enter order ID from previous step
   - Click "Execute"
   - View full order details

5. **Test PUT /api/orders/{id}:**

   - Click "PUT /api/orders/{id}"
   - Click "Try it out"
   - Enter order ID
   - Modify fields in request body
   - Click "Execute"
   - Check 200 response with updated order

6. **Test DELETE /api/orders/{id}:**
   - Click "DELETE /api/orders/{id}"
   - Click "Try it out"
   - Enter order ID
   - Click "Execute"
   - Check 200 response with success message

---

## 📦 Complete API Summary

**Total Endpoints:** 11 (6 previous + 5 new)

### By Tag:

- **Contracts:** 4 endpoints

  - GET /api/contracts
  - POST /api/contracts
  - GET /api/contracts/{id}
  - GET /api/contracts/next-number

- **Buyers:** 1 endpoint

  - GET /api/buyers

- **Orders:** 5 endpoints ⭐ NEW
  - GET /api/orders
  - POST /api/orders
  - GET /api/orders/{id}
  - PUT /api/orders/{id}
  - DELETE /api/orders/{id}

---

## 🔄 Data Relationships

```
Contract (1) ──────> (Many) Orders
    │
    └──> Buyer (1)

Order includes:
├── contract_id (Foreign Key)
├── buyer_name (Denormalized for quick access)
├── contract_no (Denormalized for quick access)
├── cost_details (JSON array of 14 items)
└── totals (JSON object with 6 calculations)
```

---

## ✅ Validation Rules

### POST /api/orders

- **salesContract:** Required, must exist in contracts table
- **orderNumber:** Optional, unique if provided, auto-generated if empty
- All other fields: Optional (nullable)

### PUT /api/orders/{id}

- All fields: Optional
- Field name mapping: camelCase → snake_case
- Validates uniqueness for orderNumber if changed

---

## 🚀 Performance Considerations

- **Eager Loading:** `contract.buyer` relationship loaded to avoid N+1 queries
- **Pagination:** Default 15 items per page, customizable
- **Indexing:** order_number, contract_id indexed for fast queries
- **JSON Columns:** cost_details and totals stored as JSON for flexibility
- **Search:** Uses LIKE queries on order_number, buyer_name, contract_no

---

## 📖 Additional Documentation

For complete implementation details, see:

- **ORDERS_SPECIFICATION.md** - Full orders module specification
- **SWAGGER-IMPLEMENTATION.md** - Original Swagger setup guide

---

## 🔧 Maintenance

### Regenerate Documentation After Changes:

```bash
php artisan l5-swagger:generate
```

### Clear Generated Docs:

```bash
rm storage/api-docs/api-docs.json
php artisan l5-swagger:generate
```

### View Raw OpenAPI JSON:

```bash
cat storage/api-docs/api-docs.json
```

---

## 📊 Changelog

### Version 1.1.0 - December 9, 2025

- ✅ Added complete Orders API documentation
- ✅ Added 3 new schemas (Order, CostDetail, OrderTotals)
- ✅ Added "Orders" tag with 5 endpoints
- ✅ Updated API info to version 1.1.0
- ✅ Enhanced API description to include orders functionality
- ✅ Documented all request/response examples
- ✅ Added field mapping documentation

---

**Documentation Status:** ✅ Complete  
**API Version:** 1.1.0  
**Last Updated:** December 9, 2025  
**Total Endpoints Documented:** 11
