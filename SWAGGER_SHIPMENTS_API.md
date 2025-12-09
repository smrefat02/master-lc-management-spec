# Swagger API Documentation - Shipments Module

**Date Added:** December 9, 2025  
**API Version:** 1.2.0  
**Status:** ✅ Complete

---

## 📋 Overview

Comprehensive Swagger/OpenAPI documentation for the Shipments Management module. All 5 CRUD endpoints are fully documented with interactive testing available via Swagger UI.

---

## 🔗 Access Swagger UI

**Local Development:**

- **Swagger UI:** http://127.0.0.1:8000/api/documentation
- **OpenAPI JSON:** http://127.0.0.1:8000/docs/api-docs.json

---

## 📡 Shipments API Endpoints

### 1. **GET /api/shipments**

**List Shipments**

- **Operation ID:** `getShipmentsList`
- **Tag:** Shipments
- **Description:** Returns paginated list of shipments with search capabilities and summary statistics

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| search | string | No | Search by buyer name, contract number, order number, or reference number | "Test Buyer" |
| page | integer | No | Page number for pagination (default: 1) | 1 |

**Response 200:**

```json
{
  "shipments": [
    {
      "id": 1,
      "contract_id": 1,
      "order_id": 1,
      "buyer_name": "Test Buyer bz6ua",
      "sales_contract": "MORD-1765279004085",
      "order_number": "GCOSTING-1765275998074",
      "shipping_date": "12/10/2025",
      "shipment_qty": 100,
      "shipment_value": "1000.00",
      "reference_no": "BL-12345",
      "remarks": "First shipment",
      "created_at": "2025-12-09T10:30:00.000000Z",
      "updated_at": "2025-12-09T10:30:00.000000Z"
    }
  ],
  "summary": {
    "total_shipments": 8,
    "total_shipped_qty": 450,
    "total_shipment_value": "5050.00",
    "avg_shipment_qty": "56.25"
  },
  "current_page": 1,
  "total_pages": 1
}
```

**Response Fields:**

**Shipment Object:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique shipment ID |
| contract_id | integer | Foreign key to contracts table |
| order_id | integer | Foreign key to orders table |
| buyer_name | string | Name of the buyer (auto-populated) |
| sales_contract | string | Contract number (auto-populated) |
| order_number | string | Order number (auto-populated) |
| shipping_date | string | Shipping date in MM/DD/YYYY format |
| shipment_qty | integer | Quantity shipped (whole numbers only) |
| shipment_value | string | Total shipment value in USD (2 decimals) |
| reference_no | string\|null | Reference number (BL/Invoice/Internal) |
| remarks | string\|null | Additional notes |
| created_at | string | ISO 8601 timestamp |
| updated_at | string | ISO 8601 timestamp |

**Summary Object:**
| Field | Type | Description |
|-------|------|-------------|
| total_shipments | integer | Total count of shipments |
| total_shipped_qty | integer | Sum of all shipment quantities |
| total_shipment_value | string | Sum of all shipment values (2 decimals) |
| avg_shipment_qty | string | Average shipment quantity (2 decimals) |

---

### 2. **POST /api/shipments**

**Create Shipment**

- **Operation ID:** `createShipment`
- **Tag:** Shipments
- **Description:** Creates a new shipment record with auto-population of buyer, contract, and order details

**Request Body (JSON):**

```json
{
  "salesContract": 1,
  "order": 1,
  "shippingDate": "2025-12-10",
  "shipmentQty": 100,
  "shipmentValue": 1000.0,
  "referenceNo": "BL-12345",
  "remarks": "First shipment of the order"
}
```

**Request Fields:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| salesContract | integer | ✅ Yes | exists:contracts,id | Contract ID (must exist in database) |
| order | integer | ✅ Yes | exists:orders,id | Order ID (must exist in database) |
| shippingDate | string | ❌ No | date format (YYYY-MM-DD) | Date of shipment |
| shipmentQty | integer | ❌ No | integer, min:0 | Quantity shipped (whole numbers) |
| shipmentValue | number | ❌ No | numeric, min:0 | Total value in USD (2 decimals) |
| referenceNo | string | ❌ No | string, max:255 | BL/Invoice/Internal reference |
| remarks | string | ❌ No | string | Additional notes |

**Response 201 - Created:**

```json
{
  "message": "Shipment created successfully",
  "shipment": {
    "id": 1,
    "contract_id": 1,
    "order_id": 1,
    "buyer_name": "Test Buyer bz6ua",
    "sales_contract": "MORD-1765279004085",
    "order_number": "GCOSTING-1765275998074",
    "shipping_date": "12/10/2025",
    "shipment_qty": 100,
    "shipment_value": "1000.00",
    "reference_no": "BL-12345",
    "remarks": "First shipment of the order",
    "created_at": "2025-12-09T10:30:00.000000Z",
    "updated_at": "2025-12-09T10:30:00.000000Z"
  }
}
```

**Response 422 - Validation Error:**

```json
{
  "message": "The sales contract field is required.",
  "errors": {
    "salesContract": ["The sales contract field is required."],
    "order": ["The order field is required."]
  }
}
```

**Auto-Population Logic:**

When a shipment is created, the system automatically:

1. Fetches the contract by `salesContract` ID
2. Retrieves `buyer.name` and stores as `buyer_name`
3. Retrieves `contract_no` and stores as `sales_contract`
4. Fetches the order by `order` ID
5. Retrieves `order_number` and stores as `order_number`

---

### 3. **GET /api/shipments/{id}**

**Get Single Shipment**

- **Operation ID:** `getShipmentById`
- **Tag:** Shipments
- **Description:** Retrieves detailed information for a specific shipment including related contract and order data

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | ✅ Yes | Shipment ID |

**Response 200 - Success:**

```json
{
  "id": 1,
  "contract_id": 1,
  "order_id": 1,
  "buyer_name": "Test Buyer bz6ua",
  "sales_contract": "MORD-1765279004085",
  "order_number": "GCOSTING-1765275998074",
  "shipping_date": "12/10/2025",
  "shipment_qty": 100,
  "shipment_value": "1000.00",
  "reference_no": "BL-12345",
  "remarks": "First shipment of the order",
  "created_at": "2025-12-09T10:30:00.000000Z",
  "updated_at": "2025-12-09T10:30:00.000000Z",
  "contract": {
    "id": 1,
    "contract_no": "MORD-1765279004085",
    "buyer": {
      "id": 1,
      "name": "Test Buyer bz6ua"
    }
  },
  "order": {
    "id": 1,
    "order_number": "GCOSTING-1765275998074",
    "order_qty": 5000,
    "order_value": "45000.00"
  }
}
```

**Response 404 - Not Found:**

```json
{
  "message": "Shipment not found"
}
```

**Relationships Loaded:**

- `contract.buyer` - Contract with associated buyer information
- `order` - Order details

---

### 4. **PUT /api/shipments/{id}**

**Update Shipment**

- **Operation ID:** `updateShipment`
- **Tag:** Shipments
- **Description:** Updates an existing shipment with new values. All fields are optional.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | ✅ Yes | Shipment ID to update |

**Request Body (JSON):**

```json
{
  "salesContract": 1,
  "order": 1,
  "shippingDate": "2025-12-15",
  "shipmentQty": 150,
  "shipmentValue": 1500.0,
  "referenceNo": "BL-12345-UPDATED",
  "remarks": "Updated shipment details"
}
```

**Request Fields:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| salesContract | integer | ❌ No | exists:contracts,id | Contract ID |
| order | integer | ❌ No | exists:orders,id | Order ID |
| shippingDate | string | ❌ No | date format (YYYY-MM-DD) | Shipping date |
| shipmentQty | integer | ❌ No | integer, min:0 | Quantity (whole numbers) |
| shipmentValue | number | ❌ No | numeric, min:0 | Value in USD |
| referenceNo | string | ❌ No | string, max:255 | Reference number |
| remarks | string | ❌ No | string | Notes |

**Field Mapping (Frontend → Backend):**

```
salesContract  →  contract_id
order         →  order_id
shippingDate  →  shipping_date
shipmentQty   →  shipment_qty
shipmentValue →  shipment_value
referenceNo   →  reference_no
remarks       →  remarks
```

**Response 200 - Success:**

```json
{
  "message": "Shipment updated successfully",
  "shipment": {
    "id": 1,
    "contract_id": 1,
    "order_id": 1,
    "buyer_name": "Test Buyer bz6ua",
    "sales_contract": "MORD-1765279004085",
    "order_number": "GCOSTING-1765275998074",
    "shipping_date": "12/15/2025",
    "shipment_qty": 150,
    "shipment_value": "1500.00",
    "reference_no": "BL-12345-UPDATED",
    "remarks": "Updated shipment details",
    "updated_at": "2025-12-09T11:45:00.000000Z"
  }
}
```

**Response 404 - Not Found:**

```json
{
  "message": "Shipment not found"
}
```

**Response 422 - Validation Error:**

```json
{
  "message": "The selected sales contract is invalid.",
  "errors": {
    "salesContract": ["The selected sales contract is invalid."]
  }
}
```

**Auto-Update Logic:**

When contract or order is changed:

1. System re-fetches contract data
2. Updates `buyer_name` and `sales_contract`
3. Re-fetches order data
4. Updates `order_number`

---

### 5. **DELETE /api/shipments/{id}**

**Delete Shipment**

- **Operation ID:** `deleteShipment`
- **Tag:** Shipments
- **Description:** Permanently deletes a shipment record from the database

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | ✅ Yes | Shipment ID to delete |

**Response 200 - Success:**

```json
{
  "message": "Shipment deleted successfully"
}
```

**Response 404 - Not Found:**

```json
{
  "message": "Shipment not found"
}
```

**⚠️ Important Notes:**

- This is a permanent deletion (not soft delete)
- No undo functionality
- UI does not currently expose this endpoint
- Recommended for admin users only in production

---

## 🔧 Implementation Details

### Backend Files

**Controller:** `backend/app/Http/Controllers/ShipmentController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Contract;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShipmentController extends Controller
{
    // All 5 CRUD methods implemented
    public function index(Request $request)
    public function store(Request $request)
    public function show($id)
    public function update(Request $request, $id)
    public function destroy($id)
}
```

**Model:** `backend/app/Models/Shipment.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'contract_id',
        'order_id',
        'buyer_name',
        'sales_contract',
        'order_number',
        'shipping_date',
        'shipment_qty',
        'shipment_value',
        'reference_no',
        'remarks',
    ];

    protected $casts = [
        'shipping_date' => 'date',
        'shipment_qty' => 'integer',
        'shipment_value' => 'decimal:2',
    ];

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
```

**Routes:** `backend/routes/api.php`

```php
use App\Http\Controllers\ShipmentController;

Route::get('/shipments', [ShipmentController::class, 'index']);
Route::post('/shipments', [ShipmentController::class, 'store']);
Route::get('/shipments/{id}', [ShipmentController::class, 'show']);
Route::put('/shipments/{id}', [ShipmentController::class, 'update']);
Route::delete('/shipments/{id}', [ShipmentController::class, 'destroy']);
```

**Migration:** `backend/database/migrations/2025_12_09_110121_create_shipments_table.php`

```php
Schema::create('shipments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('contract_id')->constrained()->onDelete('cascade');
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->string('buyer_name');
    $table->string('sales_contract');
    $table->string('order_number');
    $table->date('shipping_date')->nullable();
    $table->integer('shipment_qty')->default(0); // Integer only
    $table->decimal('shipment_value', 15, 2)->default(0);
    $table->string('reference_no')->nullable();
    $table->text('remarks')->nullable();
    $table->timestamps();
});
```

---

## 📊 Data Models

### Shipment Model

**Table:** `shipments`

| Column         | Type            | Nullable | Default | Description                      |
| -------------- | --------------- | -------- | ------- | -------------------------------- |
| id             | bigint unsigned | No       | auto    | Primary key                      |
| contract_id    | bigint unsigned | No       | -       | FK to contracts                  |
| order_id       | bigint unsigned | No       | -       | FK to orders                     |
| buyer_name     | varchar(255)    | No       | -       | Buyer name (auto-populated)      |
| sales_contract | varchar(255)    | No       | -       | Contract number (auto-populated) |
| order_number   | varchar(255)    | No       | -       | Order number (auto-populated)    |
| shipping_date  | date            | Yes      | null    | Date of shipment                 |
| shipment_qty   | integer         | No       | 0       | Quantity shipped (whole numbers) |
| shipment_value | decimal(15,2)   | No       | 0.00    | Total value in USD               |
| reference_no   | varchar(255)    | Yes      | null    | BL/Invoice/Internal ref          |
| remarks        | text            | Yes      | null    | Additional notes                 |
| created_at     | timestamp       | Yes      | null    | Creation timestamp               |
| updated_at     | timestamp       | Yes      | null    | Last update timestamp            |

**Indexes:**

- Primary: `id`
- Foreign Key: `contract_id` → `contracts(id)` ON DELETE CASCADE
- Foreign Key: `order_id` → `orders(id)` ON DELETE CASCADE

**Relationships:**

- `belongsTo` Contract (contract_id)
- `belongsTo` Order (order_id)

---

## 🧪 Testing with cURL

### List All Shipments

```bash
curl -X GET "http://127.0.0.1:8000/api/shipments" \
  -H "Accept: application/json"
```

### Search Shipments

```bash
curl -X GET "http://127.0.0.1:8000/api/shipments?search=Test+Buyer" \
  -H "Accept: application/json"
```

### Create Shipment

```bash
curl -X POST "http://127.0.0.1:8000/api/shipments" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "salesContract": 1,
    "order": 1,
    "shippingDate": "2025-12-10",
    "shipmentQty": 100,
    "shipmentValue": 1000.00,
    "referenceNo": "BL-12345",
    "remarks": "First shipment"
  }'
```

### Get Single Shipment

```bash
curl -X GET "http://127.0.0.1:8000/api/shipments/1" \
  -H "Accept: application/json"
```

### Update Shipment

```bash
curl -X PUT "http://127.0.0.1:8000/api/shipments/1" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "salesContract": 1,
    "order": 1,
    "shippingDate": "2025-12-15",
    "shipmentQty": 150,
    "shipmentValue": 1500.00,
    "referenceNo": "BL-12345-UPDATED",
    "remarks": "Updated shipment"
  }'
```

### Delete Shipment

```bash
curl -X DELETE "http://127.0.0.1:8000/api/shipments/1" \
  -H "Accept: application/json"
```

---

## 🔐 Validation Rules

### Create Shipment

```php
$rules = [
    'salesContract' => 'required|exists:contracts,id',
    'order' => 'required|exists:orders,id',
    'shippingDate' => 'nullable|date',
    'shipmentQty' => 'nullable|integer|min:0',
    'shipmentValue' => 'nullable|numeric|min:0',
    'referenceNo' => 'nullable|string|max:255',
    'remarks' => 'nullable|string',
];
```

### Update Shipment

```php
$rules = [
    'salesContract' => 'sometimes|exists:contracts,id',
    'order' => 'sometimes|exists:orders,id',
    'shippingDate' => 'nullable|date',
    'shipmentQty' => 'nullable|integer|min:0',
    'shipmentValue' => 'nullable|numeric|min:0',
    'referenceNo' => 'nullable|string|max:255',
    'remarks' => 'nullable|string',
];
```

**Key Differences:**

- Create: `required` on salesContract and order
- Update: `sometimes` (optional) on all fields
- Both: Integer validation on shipmentQty (no decimals)

---

## 📱 Frontend Integration

### API Base URL

```javascript
const API_BASE_URL = "http://127.0.0.1:8000/api";
```

### Fetch Shipments with Search

```javascript
const fetchShipments = async (searchTerm = "", page = 1) => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("search", searchTerm);
  params.append("page", page);

  const response = await fetch(
    `${API_BASE_URL}/shipments?${params.toString()}`
  );
  const data = await response.json();
  return data;
};
```

### Create Shipment

```javascript
const createShipment = async (shipmentData) => {
  const response = await fetch(`${API_BASE_URL}/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(shipmentData),
  });
  return await response.json();
};
```

### Update Shipment

```javascript
const updateShipment = async (id, shipmentData) => {
  const response = await fetch(`${API_BASE_URL}/shipments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(shipmentData),
  });
  return await response.json();
};
```

---

## 🎯 Summary Statistics

The `GET /api/shipments` endpoint returns summary statistics:

```json
{
  "summary": {
    "total_shipments": 8, // Count of all shipments
    "total_shipped_qty": 450, // Sum of shipment_qty
    "total_shipment_value": "5050.00", // Sum of shipment_value
    "avg_shipment_qty": "56.25" // Average qty (2 decimals)
  }
}
```

**Calculation Logic:**

```php
$allShipments = Shipment::all();

$summary = [
    'total_shipments' => $allShipments->count(),
    'total_shipped_qty' => (int) $allShipments->sum('shipment_qty'),
    'total_shipment_value' => number_format(
        $allShipments->sum('shipment_value'),
        2,
        '.',
        ''
    ),
    'avg_shipment_qty' => $allShipments->count() > 0
        ? number_format(
            round($allShipments->sum('shipment_qty') / $allShipments->count(), 2),
            2,
            '.',
            ''
        )
        : '0.00',
];
```

---

## 🚨 Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "message": "Invalid request format"
}
```

**404 Not Found:**

```json
{
  "message": "Shipment not found"
}
```

**422 Unprocessable Entity (Validation Error):**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "salesContract": ["The sales contract field is required."],
    "order": ["The order field is required."],
    "shipmentQty": ["The shipment qty must be an integer."]
  }
}
```

**500 Internal Server Error:**

```json
{
  "message": "Server error occurred"
}
```

---

## 📝 Change Log

### Version 1.2.0 (December 9, 2025)

**Added:**

- Complete shipments CRUD API
- Summary statistics endpoint
- Search functionality across multiple fields
- Auto-population of buyer/contract/order details
- Foreign key relationships with cascade delete
- Comprehensive validation rules
- Changed shipment_qty to integer (no decimals)

**Updated:**

- API version to 1.2.0
- Documentation with shipments module
- Database schema with shipments table

---

## 🔗 Related Documentation

- [Shipments Specification](./SHIPMENTS_SPECIFICATION.md)
- [Orders API Documentation](./SWAGGER_ORDERS_API.md)
- [README](./README.md)

---

**Last Updated:** December 9, 2025  
**API Version:** 1.2.0  
**Status:** ✅ Production Ready
