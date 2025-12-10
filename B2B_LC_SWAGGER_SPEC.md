# B2B LC Module - Swagger API Specification

**Project:** LC Management System  
**Module:** B2B LC Management API  
**Version:** 1.0.0  
**Date:** December 10, 2025  
**API Version:** 1.3.0

---

## 📋 Overview

Complete OpenAPI 3.0 specification for B2B LC module RESTful API endpoints.

**Base URL:** `http://localhost:8000/api`  
**Content-Type:** `application/json`  
**Authentication:** Bearer Token (Laravel Sanctum)

---

## 🏷️ API Tags

```php
/**
 * @OA\Tag(
 *     name="B2B LC",
 *     description="Back-to-Back Letter of Credit management endpoints"
 * )
 */
```

---

## 📦 Schema Definition

### B2BLC Schema

```php
/**
 * @OA\Schema(
 *     schema="B2BLC",
 *     type="object",
 *     title="B2B LC",
 *     description="Back-to-Back Letter of Credit model",
 *     required={"contract_id", "order_id", "costing_detail_id", "pi_number", "supplier", "order_qty", "fob_value", "post_pi_value"},
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         format="int64",
 *         description="Unique identifier",
 *         example=1
 *     ),
 *     @OA\Property(
 *         property="contract_id",
 *         type="integer",
 *         format="int64",
 *         description="Foreign key to contracts table",
 *         example=10
 *     ),
 *     @OA\Property(
 *         property="order_id",
 *         type="integer",
 *         format="int64",
 *         description="Foreign key to orders table",
 *         example=25
 *     ),
 *     @OA\Property(
 *         property="costing_detail_id",
 *         type="integer",
 *         format="int64",
 *         description="ID from orders.cost_details JSON array",
 *         example=3
 *     ),
 *     @OA\Property(
 *         property="pi_number",
 *         type="string",
 *         maxLength=255,
 *         description="Proforma Invoice number (unique)",
 *         example="PI-2025-001"
 *     ),
 *     @OA\Property(
 *         property="supplier",
 *         type="string",
 *         maxLength=255,
 *         description="Supplier/vendor name",
 *         example="ABC Textiles Ltd"
 *     ),
 *     @OA\Property(
 *         property="order_qty",
 *         type="integer",
 *         minimum=1,
 *         description="Order quantity in pieces",
 *         example=5000
 *     ),
 *     @OA\Property(
 *         property="fob_value",
 *         type="number",
 *         format="float",
 *         description="FOB price per piece in USD",
 *         example=2.50
 *     ),
 *     @OA\Property(
 *         property="order_value",
 *         type="number",
 *         format="float",
 *         description="Total order value (calculated: order_qty × fob_value)",
 *         example=12500.00
 *     ),
 *     @OA\Property(
 *         property="post_pi_value",
 *         type="number",
 *         format="float",
 *         description="Post-costing / Received PI value in USD",
 *         example=5625.00
 *     ),
 *     @OA\Property(
 *         property="b2b_percent",
 *         type="number",
 *         format="float",
 *         description="B2B percentage (calculated: (post_pi_value / order_value) × 100)",
 *         example=45.00
 *     ),
 *     @OA\Property(
 *         property="status",
 *         type="string",
 *         enum={"draft", "active", "completed", "cancelled"},
 *         description="Current status",
 *         example="active"
 *     ),
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         description="Creation timestamp",
 *         example="2025-12-10T10:30:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         description="Last update timestamp",
 *         example="2025-12-10T14:45:00.000000Z"
 *     ),
 *     @OA\Property(
 *         property="contract",
 *         ref="#/components/schemas/Contract",
 *         description="Related contract (eager loaded)"
 *     ),
 *     @OA\Property(
 *         property="order",
 *         ref="#/components/schemas/Order",
 *         description="Related order (eager loaded)"
 *     )
 * )
 */
```

---

## 🔗 API Endpoints

### 1. List B2B LCs (GET)

```php
/**
 * @OA\Get(
 *     path="/api/b2b-lc",
 *     operationId="getB2BLCList",
 *     tags={"B2B LC"},
 *     summary="Get list of B2B LCs with filters and pagination",
 *     description="Returns paginated list of B2B LC records with optional search filters",
 *     @OA\Parameter(
 *         name="pi_number",
 *         in="query",
 *         description="Filter by PI Number (partial match)",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Parameter(
 *         name="supplier",
 *         in="query",
 *         description="Filter by Supplier name (partial match)",
 *         required=false,
 *         @OA\Schema(type="string")
 *     ),
 *     @OA\Parameter(
 *         name="status",
 *         in="query",
 *         description="Filter by status",
 *         required=false,
 *         @OA\Schema(
 *             type="string",
 *             enum={"draft", "active", "completed", "cancelled"}
 *         )
 *     ),
 *     @OA\Parameter(
 *         name="page",
 *         in="query",
 *         description="Page number for pagination",
 *         required=false,
 *         @OA\Schema(type="integer", default=1)
 *     ),
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Items per page",
 *         required=false,
 *         @OA\Schema(type="integer", default=15)
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful operation",
 *         @OA\JsonContent(
 *             type="object",
 *             @OA\Property(
 *                 property="data",
 *                 type="array",
 *                 @OA\Items(ref="#/components/schemas/B2BLC")
 *             ),
 *             @OA\Property(property="current_page", type="integer", example=1),
 *             @OA\Property(property="per_page", type="integer", example=15),
 *             @OA\Property(property="total", type="integer", example=45),
 *             @OA\Property(property="last_page", type="integer", example=3)
 *         )
 *     ),
 *     @OA\Response(
 *         response=400,
 *         description="Bad request"
 *     )
 * )
 */
public function index(Request $request): JsonResponse
{
    // Implementation in controller
}
```

**Example Request:**

```http
GET /api/b2b-lc?pi_number=PI-2025&supplier=ABC&status=active&page=1
```

**Example Response:**

```json
{
  "data": [
    {
      "id": 1,
      "contract_id": 10,
      "order_id": 25,
      "costing_detail_id": 3,
      "pi_number": "PI-2025-001",
      "supplier": "ABC Textiles Ltd",
      "order_qty": 5000,
      "fob_value": "2.50",
      "order_value": "12500.00",
      "post_pi_value": "5625.00",
      "b2b_percent": "45.00",
      "status": "active",
      "created_at": "2025-12-10T10:30:00.000000Z",
      "updated_at": "2025-12-10T10:30:00.000000Z",
      "contract": {
        "id": 10,
        "contract_no": "SC-001",
        "buyer": {
          "name": "XYZ Corp"
        }
      },
      "order": {
        "id": 25,
        "order_number": "ORD-025"
      }
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 1,
  "last_page": 1
}
```

---

### 2. Create B2B LC (POST)

```php
/**
 * @OA\Post(
 *     path="/api/b2b-lc",
 *     operationId="createB2BLC",
 *     tags={"B2B LC"},
 *     summary="Create new B2B LC record",
 *     description="Creates a new B2B LC with automatic calculations for order_value and b2b_percent",
 *     @OA\RequestBody(
 *         required=true,
 *         description="B2B LC data",
 *         @OA\JsonContent(
 *             required={"contract_id", "order_id", "costing_detail_id", "pi_number", "supplier", "order_qty", "fob_value", "post_pi_value"},
 *             @OA\Property(property="contract_id", type="integer", example=10),
 *             @OA\Property(property="order_id", type="integer", example=25),
 *             @OA\Property(property="costing_detail_id", type="integer", example=3),
 *             @OA\Property(property="pi_number", type="string", example="PI-2025-001"),
 *             @OA\Property(property="supplier", type="string", example="ABC Textiles Ltd"),
 *             @OA\Property(property="order_qty", type="integer", example=5000),
 *             @OA\Property(property="fob_value", type="number", format="float", example=2.50),
 *             @OA\Property(property="order_value", type="number", format="float", example=12500.00, description="Optional - calculated if not provided"),
 *             @OA\Property(property="post_pi_value", type="number", format="float", example=5625.00),
 *             @OA\Property(property="b2b_percent", type="number", format="float", example=45.00, description="Optional - calculated if not provided"),
 *             @OA\Property(property="status", type="string", enum={"draft", "active"}, example="draft", description="Optional - defaults to 'draft'")
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="B2B LC created successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="B2B LC created successfully"),
 *             @OA\Property(property="data", ref="#/components/schemas/B2BLC")
 *         )
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="The given data was invalid."),
 *             @OA\Property(
 *                 property="errors",
 *                 type="object",
 *                 @OA\Property(
 *                     property="pi_number",
 *                     type="array",
 *                     @OA\Items(type="string", example="The pi number has already been taken.")
 *                 )
 *             )
 *         )
 *     )
 * )
 */
public function store(StoreB2BLCRequest $request): JsonResponse
{
    // Implementation in controller
}
```

**Example Request:**

```http
POST /api/b2b-lc
Content-Type: application/json

{
  "contract_id": 10,
  "order_id": 25,
  "costing_detail_id": 3,
  "pi_number": "PI-2025-001",
  "supplier": "ABC Textiles Ltd",
  "order_qty": 5000,
  "fob_value": 2.50,
  "post_pi_value": 5625.00,
  "status": "draft"
}
```

**Example Response:**

```json
{
  "message": "B2B LC created successfully",
  "data": {
    "id": 1,
    "contract_id": 10,
    "order_id": 25,
    "costing_detail_id": 3,
    "pi_number": "PI-2025-001",
    "supplier": "ABC Textiles Ltd",
    "order_qty": 5000,
    "fob_value": "2.50",
    "order_value": "12500.00",
    "post_pi_value": "5625.00",
    "b2b_percent": "45.00",
    "status": "draft",
    "created_at": "2025-12-10T10:30:00.000000Z",
    "updated_at": "2025-12-10T10:30:00.000000Z",
    "contract": {
      "id": 10,
      "contract_no": "SC-001"
    },
    "order": {
      "id": 25,
      "order_number": "ORD-025"
    }
  }
}
```

---

### 3. Get Single B2B LC (GET)

```php
/**
 * @OA\Get(
 *     path="/api/b2b-lc/{id}",
 *     operationId="getB2BLCById",
 *     tags={"B2B LC"},
 *     summary="Get single B2B LC by ID",
 *     description="Returns detailed information about a specific B2B LC record",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="B2B LC ID",
 *         required=true,
 *         @OA\Schema(type="integer", format="int64")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Successful operation",
 *         @OA\JsonContent(ref="#/components/schemas/B2BLC")
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="B2B LC not found",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="B2B LC not found")
 *         )
 *     )
 * )
 */
public function show(B2BLC $b2bLC): JsonResponse
{
    // Implementation in controller
}
```

**Example Request:**

```http
GET /api/b2b-lc/1
```

**Example Response:**

```json
{
  "id": 1,
  "contract_id": 10,
  "order_id": 25,
  "costing_detail_id": 3,
  "pi_number": "PI-2025-001",
  "supplier": "ABC Textiles Ltd",
  "order_qty": 5000,
  "fob_value": "2.50",
  "order_value": "12500.00",
  "post_pi_value": "5625.00",
  "b2b_percent": "45.00",
  "status": "active",
  "created_at": "2025-12-10T10:30:00.000000Z",
  "updated_at": "2025-12-10T14:45:00.000000Z",
  "contract": {
    "id": 10,
    "contract_no": "SC-001",
    "buyer": {
      "id": 5,
      "name": "XYZ Corp"
    }
  },
  "order": {
    "id": 25,
    "order_number": "ORD-025",
    "order_qty": 5000,
    "order_value": "12500.00"
  }
}
```

---

### 4. Update B2B LC (PUT)

```php
/**
 * @OA\Put(
 *     path="/api/b2b-lc/{id}",
 *     operationId="updateB2BLC",
 *     tags={"B2B LC"},
 *     summary="Update existing B2B LC",
 *     description="Updates B2B LC with automatic recalculation of order_value and b2b_percent if relevant fields change",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="B2B LC ID",
 *         required=true,
 *         @OA\Schema(type="integer", format="int64")
 *     ),
 *     @OA\RequestBody(
 *         required=true,
 *         description="Updated B2B LC data (all fields optional)",
 *         @OA\JsonContent(
 *             @OA\Property(property="contract_id", type="integer", example=10),
 *             @OA\Property(property="order_id", type="integer", example=25),
 *             @OA\Property(property="costing_detail_id", type="integer", example=3),
 *             @OA\Property(property="pi_number", type="string", example="PI-2025-001-UPDATED"),
 *             @OA\Property(property="supplier", type="string", example="ABC Textiles Ltd"),
 *             @OA\Property(property="order_qty", type="integer", example=6000),
 *             @OA\Property(property="fob_value", type="number", format="float", example=2.75),
 *             @OA\Property(property="post_pi_value", type="number", format="float", example=6750.00),
 *             @OA\Property(property="status", type="string", enum={"draft", "active", "completed", "cancelled"}, example="active")
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="B2B LC updated successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="B2B LC updated successfully"),
 *             @OA\Property(property="data", ref="#/components/schemas/B2BLC")
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="B2B LC not found"
 *     ),
 *     @OA\Response(
 *         response=422,
 *         description="Validation error"
 *     )
 * )
 */
public function update(UpdateB2BLCRequest $request, B2BLC $b2bLC): JsonResponse
{
    // Implementation in controller
}
```

**Example Request:**

```http
PUT /api/b2b-lc/1
Content-Type: application/json

{
  "order_qty": 6000,
  "fob_value": 2.75,
  "post_pi_value": 6750.00,
  "status": "active"
}
```

**Example Response:**

```json
{
  "message": "B2B LC updated successfully",
  "data": {
    "id": 1,
    "contract_id": 10,
    "order_id": 25,
    "costing_detail_id": 3,
    "pi_number": "PI-2025-001",
    "supplier": "ABC Textiles Ltd",
    "order_qty": 6000,
    "fob_value": "2.75",
    "order_value": "16500.00",
    "post_pi_value": "6750.00",
    "b2b_percent": "40.91",
    "status": "active",
    "created_at": "2025-12-10T10:30:00.000000Z",
    "updated_at": "2025-12-10T15:20:00.000000Z",
    "contract": {
      "id": 10,
      "contract_no": "SC-001"
    },
    "order": {
      "id": 25,
      "order_number": "ORD-025"
    }
  }
}
```

---

### 5. Delete B2B LC (DELETE)

```php
/**
 * @OA\Delete(
 *     path="/api/b2b-lc/{id}",
 *     operationId="deleteB2BLC",
 *     tags={"B2B LC"},
 *     summary="Delete B2B LC",
 *     description="Permanently deletes a B2B LC record",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="B2B LC ID to delete",
 *         required=true,
 *         @OA\Schema(type="integer", format="int64")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="B2B LC deleted successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="B2B LC deleted successfully")
 *         )
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="B2B LC not found"
 *     )
 * )
 */
public function destroy(B2BLC $b2bLC): JsonResponse
{
    // Implementation in controller
}
```

**Example Request:**

```http
DELETE /api/b2b-lc/1
```

**Example Response:**

```json
{
  "message": "B2B LC deleted successfully"
}
```

---

## 🧮 Automatic Calculations

### Order Value Calculation

**Triggered when:**

- Creating new record
- Updating `order_qty` or `fob_value`

**Formula:**

```
order_value = order_qty × fob_value
```

**Backend Implementation:**

```php
if (isset($validated['order_qty']) || isset($validated['fob_value'])) {
    $orderQty = $validated['order_qty'] ?? $b2bLC->order_qty;
    $fobValue = $validated['fob_value'] ?? $b2bLC->fob_value;
    $validated['order_value'] = $orderQty * $fobValue;
}
```

---

### B2B Percentage Calculation

**Triggered when:**

- Creating new record
- Updating `post_pi_value` or `order_value`

**Formula:**

```
b2b_percent = (post_pi_value ÷ order_value) × 100
```

**Backend Implementation:**

```php
if (isset($validated['post_pi_value']) || isset($validated['order_value'])) {
    $postPIValue = $validated['post_pi_value'] ?? $b2bLC->post_pi_value;
    $orderValue = $validated['order_value'] ?? $b2bLC->order_value;

    if ($orderValue > 0) {
        $validated['b2b_percent'] = ($postPIValue / $orderValue) * 100;
    }
}
```

---

## 📝 Validation Rules

### Store Request Validation

```php
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
```

### Update Request Validation

```php
'contract_id' => 'sometimes|exists:contracts,id',
'order_id' => 'sometimes|exists:orders,id',
'costing_detail_id' => 'sometimes|integer',
'pi_number' => 'sometimes|string|unique:b2b_lcs,pi_number,{id}|max:255',
'supplier' => 'sometimes|string|min:2|max:255',
'order_qty' => 'sometimes|integer|min:1',
'fob_value' => 'sometimes|numeric|min:0',
'order_value' => 'sometimes|numeric|min:0',
'post_pi_value' => 'sometimes|numeric|min:0',
'b2b_percent' => 'sometimes|numeric|min:0|max:100',
'status' => 'sometimes|in:draft,active,completed,cancelled',
```

---

## 🔍 Query Examples

### List with Filters

```bash
# Filter by PI Number
GET /api/b2b-lc?pi_number=PI-2025

# Filter by Supplier
GET /api/b2b-lc?supplier=ABC

# Filter by Status
GET /api/b2b-lc?status=active

# Multiple filters
GET /api/b2b-lc?pi_number=PI-2025&supplier=ABC&status=active

# Pagination
GET /api/b2b-lc?page=2&per_page=10
```

---

## 🔒 Error Responses

### 400 Bad Request

```json
{
  "message": "Invalid request parameters"
}
```

### 404 Not Found

```json
{
  "message": "B2B LC not found"
}
```

### 422 Unprocessable Entity (Validation Error)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "pi_number": ["The pi number has already been taken."],
    "supplier": ["The supplier field must be at least 2 characters."],
    "order_qty": ["The order qty must be at least 1."]
  }
}
```

### 500 Internal Server Error

```json
{
  "message": "Server error",
  "error": "Error details here"
}
```

---

## 🛠️ Generating Swagger Documentation

### Command

```bash
php artisan l5-swagger:generate
```

### Accessing Swagger UI

```
http://localhost:8000/api/documentation
```

### Testing Endpoints in Swagger

1. Open Swagger UI
2. Find "B2B LC" tag
3. Expand endpoint
4. Click "Try it out"
5. Fill in parameters/body
6. Click "Execute"
7. View response

---

## 📊 API Version History

### Version 1.3.0 (Current)

- Added B2B LC module endpoints
- Added automatic calculations for order_value and b2b_percent
- Added filter parameters for list endpoint
- Added pagination support

### Version 1.2.0

- Added Shipments module endpoints

### Version 1.1.0

- Added Orders module endpoints

### Version 1.0.0

- Initial release with Contracts and Buyers modules

---

## 🔗 Related Endpoints

### Helper Endpoints

**Get Orders for Contract:**

```
GET /api/contracts/{id}/orders
```

**Get Order Details (including cost_details):**

```
GET /api/orders/{id}
```

These endpoints are used by the frontend to populate dependent dropdowns.

---

## 📖 Usage Examples

### Complete Workflow Example

**Step 1: Fetch Contracts**

```http
GET /api/contracts
```

**Step 2: Fetch Orders for Selected Contract**

```http
GET /api/contracts/10/orders
```

**Step 3: Fetch Order Details (get cost_details)**

```http
GET /api/orders/25
```

**Step 4: Create B2B LC**

```http
POST /api/b2b-lc
Content-Type: application/json

{
  "contract_id": 10,
  "order_id": 25,
  "costing_detail_id": 3,
  "pi_number": "PI-2025-001",
  "supplier": "ABC Textiles Ltd",
  "order_qty": 5000,
  "fob_value": 2.50,
  "post_pi_value": 5625.00
}
```

**Step 5: Verify Creation**

```http
GET /api/b2b-lc/1
```

---

## 🎯 Best Practices

### API Usage

1. **Always eager load relationships** when displaying lists
2. **Use pagination** to limit data transfer
3. **Implement search debounce** on frontend (300ms)
4. **Cache dropdown data** if static
5. **Handle errors gracefully** with user-friendly messages

### Performance

1. **Index frequently queried fields** (pi_number, supplier, status)
2. **Use composite indexes** for multi-column queries
3. **Limit API response size** with pagination
4. **Use SELECT specific columns** instead of SELECT \*

### Security

1. **Validate all inputs** with Laravel Request classes
2. **Sanitize user input** to prevent XSS
3. **Use parameterized queries** (Eloquent ORM handles this)
4. **Implement rate limiting** to prevent abuse
5. **Require authentication** for all endpoints

---

**Document Status:** ✅ Complete Swagger API Specification  
**API Version:** 1.3.0  
**Test Coverage:** All endpoints documented and testable via Swagger UI  
**Next Step:** Generate Swagger docs and test endpoints: `php artisan l5-swagger:generate`
