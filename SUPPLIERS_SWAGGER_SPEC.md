# Supplier Module - Swagger/OpenAPI Specification v1.0

```yaml
openapi: 3.0.3
info:
  title: Supplier Management API
  description: |
    RESTful API for managing supplier records in the B2B LC Management System.

    **Features:**
    - Complete CRUD operations for suppliers
    - Advanced search and filtering capabilities
    - Automatic code generation
    - Status management (active/inactive)
    - B2B-LC integration with delete protection
    - Pagination support

    **Authentication:**
    All endpoints require authentication via Laravel Sanctum token.
    Include the token in the Authorization header: `Bearer {token}`

  version: 1.0.0
  contact:
    name: API Support
    email: api@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:8000/api
    description: Local development server
  - url: https://staging.example.com/api
    description: Staging server
  - url: https://api.example.com/api
    description: Production server

tags:
  - name: Suppliers
    description: Supplier management operations
  - name: Utilities
    description: Utility endpoints for supplier operations

paths:
  /suppliers:
    get:
      tags:
        - Suppliers
      summary: List all suppliers
      description: |
        Retrieve a paginated list of suppliers with optional search and filtering.

        **Search:** Searches across name, code, country, and email fields.
        **Filter:** Filter by status (active/inactive).
        **Sort:** Sort by any field in ascending or descending order.
        **Pagination:** Default 15 items per page, maximum 100.

      operationId: listSuppliers
      parameters:
        - name: search
          in: query
          description: Search term to filter suppliers by name, code, country, or email
          required: false
          schema:
            type: string
            example: "Acme"

        - name: status
          in: query
          description: Filter suppliers by status
          required: false
          schema:
            type: string
            enum: [active, inactive]
            example: "active"

        - name: sort_by
          in: query
          description: Field to sort by
          required: false
          schema:
            type: string
            default: created_at
            enum: [id, name, code, country, status, created_at, updated_at]
            example: "name"

        - name: sort_order
          in: query
          description: Sort order
          required: false
          schema:
            type: string
            default: desc
            enum: [asc, desc]
            example: "asc"

        - name: page
          in: query
          description: Page number for pagination
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
            example: 1

        - name: per_page
          in: query
          description: Number of items per page
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 15
            example: 15

      responses:
        "200":
          description: Successful response with paginated supplier list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Supplier"
                  links:
                    type: object
                    properties:
                      first:
                        type: string
                        example: "http://localhost:8000/api/suppliers?page=1"
                      last:
                        type: string
                        example: "http://localhost:8000/api/suppliers?page=5"
                      prev:
                        type: string
                        nullable: true
                        example: null
                      next:
                        type: string
                        nullable: true
                        example: "http://localhost:8000/api/suppliers?page=2"
                  meta:
                    type: object
                    properties:
                      current_page:
                        type: integer
                        example: 1
                      from:
                        type: integer
                        example: 1
                      last_page:
                        type: integer
                        example: 5
                      per_page:
                        type: integer
                        example: 15
                      to:
                        type: integer
                        example: 15
                      total:
                        type: integer
                        example: 73
              examples:
                success:
                  summary: Successful supplier list retrieval
                  value:
                    data:
                      - id: 1
                        name: "Acme Corporation"
                        code: "SUP0001"
                        contact_person: "John Smith"
                        email: "john.smith@acme.com"
                        phone: "+1 (555) 123-4567"
                        country: "United States"
                        address: "123 Main Street, New York, NY 10001"
                        status: "active"
                        status_badge: "bg-green-100 text-green-800"
                        created_at: "2025-01-15T10:30:00.000000Z"
                        updated_at: "2025-01-15T10:30:00.000000Z"
                      - id: 2
                        name: "Global Supplies Ltd"
                        code: "SUP0002"
                        contact_person: "Jane Doe"
                        email: "jane.doe@globalsupplies.com"
                        phone: "+44 20 7123 4567"
                        country: "United Kingdom"
                        address: "456 Oxford Street, London, W1D 1BS"
                        status: "active"
                        status_badge: "bg-green-100 text-green-800"
                        created_at: "2025-01-16T14:20:00.000000Z"
                        updated_at: "2025-01-16T14:20:00.000000Z"
                    links:
                      first: "http://localhost:8000/api/suppliers?page=1"
                      last: "http://localhost:8000/api/suppliers?page=1"
                      prev: null
                      next: null
                    meta:
                      current_page: 1
                      from: 1
                      last_page: 1
                      per_page: 15
                      to: 2
                      total: 2

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

    post:
      tags:
        - Suppliers
      summary: Create a new supplier
      description: |
        Create a new supplier record with the provided information.

        **Required fields:** name, code, status
        **Optional fields:** contact_person, email, phone, country, address

        **Validation:**
        - Code must be unique and follow format: SUP####
        - Email must be unique and valid format
        - Status must be either 'active' or 'inactive'

      operationId: createSupplier
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SupplierInput"
            examples:
              minimal:
                summary: Minimal supplier creation
                value:
                  name: "Tech Supplies Inc"
                  code: "SUP0003"
                  status: "active"

              complete:
                summary: Complete supplier with all fields
                value:
                  name: "Premium Electronics Co"
                  code: "SUP0004"
                  contact_person: "Robert Johnson"
                  email: "robert.johnson@premiumelectronics.com"
                  phone: "+1 (555) 987-6543"
                  country: "United States"
                  address: "789 Tech Boulevard, San Francisco, CA 94105"
                  status: "active"

      responses:
        "201":
          description: Supplier created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Supplier created successfully"
                  data:
                    $ref: "#/components/schemas/Supplier"
              examples:
                success:
                  summary: Successful supplier creation
                  value:
                    success: true
                    message: "Supplier created successfully"
                    data:
                      id: 3
                      name: "Tech Supplies Inc"
                      code: "SUP0003"
                      contact_person: null
                      email: null
                      phone: null
                      country: null
                      address: null
                      status: "active"
                      status_badge: "bg-green-100 text-green-800"
                      created_at: "2025-01-17T09:15:00.000000Z"
                      updated_at: "2025-01-17T09:15:00.000000Z"

        "422":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidationError"
              examples:
                duplicateCode:
                  summary: Duplicate supplier code
                  value:
                    message: "The code has already been taken."
                    errors:
                      code:
                        - "The code has already been taken."

                duplicateEmail:
                  summary: Duplicate email
                  value:
                    message: "The email has already been taken."
                    errors:
                      email:
                        - "The email has already been taken."

                invalidCodeFormat:
                  summary: Invalid code format
                  value:
                    message: "The code format is invalid."
                    errors:
                      code:
                        - "The code format is invalid. Must be SUP followed by 4 digits (e.g., SUP0001)."

                missingRequired:
                  summary: Missing required fields
                  value:
                    message: "The name field is required."
                    errors:
                      name:
                        - "The name field is required."
                      code:
                        - "The code field is required."
                      status:
                        - "The status field is required."

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

  /suppliers/{id}:
    get:
      tags:
        - Suppliers
      summary: Get a specific supplier
      description: Retrieve detailed information about a specific supplier by ID
      operationId: getSupplier
      parameters:
        - name: id
          in: path
          description: Supplier ID
          required: true
          schema:
            type: integer
            example: 1

      responses:
        "200":
          description: Successful response with supplier details
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: "#/components/schemas/Supplier"
              examples:
                success:
                  summary: Successful supplier retrieval
                  value:
                    data:
                      id: 1
                      name: "Acme Corporation"
                      code: "SUP0001"
                      contact_person: "John Smith"
                      email: "john.smith@acme.com"
                      phone: "+1 (555) 123-4567"
                      country: "United States"
                      address: "123 Main Street, New York, NY 10001"
                      status: "active"
                      status_badge: "bg-green-100 text-green-800"
                      created_at: "2025-01-15T10:30:00.000000Z"
                      updated_at: "2025-01-15T10:30:00.000000Z"

        "404":
          description: Supplier not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Supplier not found"
              examples:
                notFound:
                  summary: Supplier not found
                  value:
                    message: "Supplier not found"

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

    put:
      tags:
        - Suppliers
      summary: Update a supplier
      description: |
        Update an existing supplier's information.

        **Validation:**
        - Code must be unique (excluding current supplier)
        - Email must be unique (excluding current supplier)
        - Code format must match SUP####

      operationId: updateSupplier
      parameters:
        - name: id
          in: path
          description: Supplier ID
          required: true
          schema:
            type: integer
            example: 1

      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SupplierInput"
            examples:
              updateName:
                summary: Update supplier name only
                value:
                  name: "Acme Corporation Ltd"
                  code: "SUP0001"
                  contact_person: "John Smith"
                  email: "john.smith@acme.com"
                  phone: "+1 (555) 123-4567"
                  country: "United States"
                  address: "123 Main Street, New York, NY 10001"
                  status: "active"

              deactivate:
                summary: Deactivate supplier
                value:
                  name: "Acme Corporation"
                  code: "SUP0001"
                  contact_person: "John Smith"
                  email: "john.smith@acme.com"
                  phone: "+1 (555) 123-4567"
                  country: "United States"
                  address: "123 Main Street, New York, NY 10001"
                  status: "inactive"

      responses:
        "200":
          description: Supplier updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Supplier updated successfully"
                  data:
                    $ref: "#/components/schemas/Supplier"
              examples:
                success:
                  summary: Successful supplier update
                  value:
                    success: true
                    message: "Supplier updated successfully"
                    data:
                      id: 1
                      name: "Acme Corporation Ltd"
                      code: "SUP0001"
                      contact_person: "John Smith"
                      email: "john.smith@acme.com"
                      phone: "+1 (555) 123-4567"
                      country: "United States"
                      address: "123 Main Street, New York, NY 10001"
                      status: "active"
                      status_badge: "bg-green-100 text-green-800"
                      created_at: "2025-01-15T10:30:00.000000Z"
                      updated_at: "2025-01-17T11:45:00.000000Z"

        "404":
          description: Supplier not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Supplier not found"

        "422":
          $ref: "#/components/responses/ValidationError"

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

    delete:
      tags:
        - Suppliers
      summary: Delete a supplier
      description: |
        Delete a supplier from the system.

        **Restrictions:**
        - Cannot delete a supplier that has associated B2B-LC records
        - Returns 409 Conflict if deletion is restricted

      operationId: deleteSupplier
      parameters:
        - name: id
          in: path
          description: Supplier ID
          required: true
          schema:
            type: integer
            example: 1

      responses:
        "200":
          description: Supplier deleted successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: "Supplier deleted successfully"
              examples:
                success:
                  summary: Successful deletion
                  value:
                    success: true
                    message: "Supplier deleted successfully"

        "404":
          description: Supplier not found
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Supplier not found"

        "409":
          description: Conflict - Cannot delete supplier with associated B2B-LCs
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Cannot delete supplier. This supplier has 3 associated B2B-LC records."
              examples:
                hasAssociations:
                  summary: Supplier has B2B-LC associations
                  value:
                    success: false
                    message: "Cannot delete supplier. This supplier has 3 associated B2B-LC records."

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

  /suppliers/generate-code:
    get:
      tags:
        - Utilities
      summary: Generate next supplier code
      description: |
        Generate the next available sequential supplier code.

        **Logic:**
        - If no suppliers exist, returns SUP0001
        - Otherwise, finds the highest existing code and increments
        - Returns code in format: SUP#### (4 digits with leading zeros)

      operationId: generateSupplierCode
      responses:
        "200":
          description: Successfully generated code
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    pattern: '^SUP\d{4}$'
                    example: "SUP0005"
              examples:
                firstCode:
                  summary: First supplier code
                  value:
                    code: "SUP0001"

                subsequentCode:
                  summary: Next sequential code
                  value:
                    code: "SUP0023"

        "401":
          $ref: "#/components/responses/Unauthorized"

        "500":
          $ref: "#/components/responses/InternalServerError"

      security:
        - bearerAuth: []

components:
  schemas:
    Supplier:
      type: object
      required:
        - id
        - name
        - code
        - status
        - created_at
        - updated_at
      properties:
        id:
          type: integer
          format: int64
          description: Unique identifier for the supplier
          example: 1

        name:
          type: string
          minLength: 2
          maxLength: 255
          description: Supplier company name
          example: "Acme Corporation"

        code:
          type: string
          pattern: '^SUP\d{4}$'
          description: Unique supplier code (format SUP####)
          example: "SUP0001"

        contact_person:
          type: string
          nullable: true
          maxLength: 255
          description: Name of the primary contact person
          example: "John Smith"

        email:
          type: string
          format: email
          nullable: true
          maxLength: 255
          description: Supplier contact email address
          example: "john.smith@acme.com"

        phone:
          type: string
          nullable: true
          maxLength: 50
          description: Supplier contact phone number
          example: "+1 (555) 123-4567"

        country:
          type: string
          nullable: true
          maxLength: 100
          description: Supplier's country of operation
          example: "United States"

        address:
          type: string
          nullable: true
          description: Supplier's physical address
          example: "123 Main Street, New York, NY 10001"

        status:
          type: string
          enum: [active, inactive]
          description: Current status of the supplier
          example: "active"

        status_badge:
          type: string
          description: Tailwind CSS classes for status badge display
          example: "bg-green-100 text-green-800"

        created_at:
          type: string
          format: date-time
          description: Timestamp when supplier was created
          example: "2025-01-15T10:30:00.000000Z"

        updated_at:
          type: string
          format: date-time
          description: Timestamp when supplier was last updated
          example: "2025-01-15T10:30:00.000000Z"

    SupplierInput:
      type: object
      required:
        - name
        - code
        - status
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 255
          description: Supplier company name
          example: "Tech Supplies Inc"

        code:
          type: string
          pattern: '^SUP\d{4}$'
          description: Unique supplier code (format SUP####)
          example: "SUP0003"

        contact_person:
          type: string
          nullable: true
          maxLength: 255
          description: Name of the primary contact person
          example: "Jane Doe"

        email:
          type: string
          format: email
          nullable: true
          maxLength: 255
          description: Supplier contact email address
          example: "jane.doe@techsupplies.com"

        phone:
          type: string
          nullable: true
          maxLength: 50
          description: Supplier contact phone number
          example: "+1 (555) 987-6543"

        country:
          type: string
          nullable: true
          maxLength: 100
          description: Supplier's country of operation
          example: "Canada"

        address:
          type: string
          nullable: true
          description: Supplier's physical address
          example: "456 Tech Boulevard, Toronto, ON M5H 2N2"

        status:
          type: string
          enum: [active, inactive]
          default: active
          description: Status of the supplier
          example: "active"

    ValidationError:
      type: object
      properties:
        message:
          type: string
          description: Summary of validation errors
          example: "The code has already been taken."

        errors:
          type: object
          description: Field-specific validation errors
          additionalProperties:
            type: array
            items:
              type: string
          example:
            code:
              - "The code has already been taken."
            email:
              - "The email must be a valid email address."

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false

        message:
          type: string
          example: "An error occurred"

  responses:
    Unauthorized:
      description: Authentication required or token invalid
      content:
        application/json:
          schema:
            type: object
            properties:
              message:
                type: string
                example: "Unauthenticated."

    ValidationError:
      description: Validation error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ValidationError"

    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
          examples:
            serverError:
              summary: Internal server error
              value:
                success: false
                message: "An unexpected error occurred. Please try again later."

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        Laravel Sanctum authentication token.

        **How to obtain:**
        1. Login via `/api/login` endpoint
        2. Receive token in response
        3. Include in Authorization header: `Bearer {token}`
```

---

## B2B-LC Integration Endpoints

### Updated B2B-LC Endpoints

The following B2B-LC endpoints are updated to include supplier integration:

```yaml
openapi: 3.0.3
info:
  title: B2B-LC API - Supplier Integration
  version: 1.0.0

paths:
  /b2b-lcs:
    get:
      summary: List B2B-LCs with supplier information
      parameters:
        - name: supplier_id
          in: query
          description: Filter by supplier ID
          schema:
            type: integer
            example: 1
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      allOf:
                        - $ref: "#/components/schemas/B2BLC"
                        - type: object
                          properties:
                            supplier:
                              $ref: "#/components/schemas/Supplier"

    post:
      summary: Create B2B-LC with supplier
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/B2BLCInput"
                - type: object
                  properties:
                    supplier_id:
                      type: integer
                      nullable: true
                      description: ID of the supplier
                      example: 1

  /b2b-lcs/{id}:
    get:
      summary: Get B2B-LC with supplier details
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    allOf:
                      - $ref: "#/components/schemas/B2BLC"
                      - type: object
                        properties:
                          supplier:
                            nullable: true
                            allOf:
                              - $ref: "#/components/schemas/Supplier"

    put:
      summary: Update B2B-LC including supplier
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/B2BLCInput"
                - type: object
                  properties:
                    supplier_id:
                      type: integer
                      nullable: true
                      description: ID of the supplier
                      example: 2

components:
  schemas:
    B2BLC:
      type: object
      properties:
        id:
          type: integer
        lc_number:
          type: string
        supplier_id:
          type: integer
          nullable: true
        supplier:
          nullable: true
          allOf:
            - $ref: "#/components/schemas/Supplier"
        # ... other B2B-LC fields

    B2BLCInput:
      type: object
      properties:
        lc_number:
          type: string
        supplier_id:
          type: integer
          nullable: true
          description: ID of the supplier
        # ... other B2B-LC input fields

    Supplier:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        code:
          type: string
        contact_person:
          type: string
          nullable: true
        email:
          type: string
          nullable: true
        phone:
          type: string
          nullable: true
        country:
          type: string
          nullable: true
        address:
          type: string
          nullable: true
        status:
          type: string
          enum: [active, inactive]
        status_badge:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
```

---

## Testing Examples

### cURL Examples

#### 1. List Suppliers

```bash
curl -X GET "http://localhost:8000/api/suppliers" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### 2. Search Suppliers

```bash
curl -X GET "http://localhost:8000/api/suppliers?search=Acme&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### 3. Create Supplier

```bash
curl -X POST "http://localhost:8000/api/suppliers" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "New Supplier Inc",
    "code": "SUP0005",
    "contact_person": "Alice Johnson",
    "email": "alice@newsupplier.com",
    "phone": "+1 (555) 111-2222",
    "country": "Canada",
    "address": "789 Innovation Drive, Vancouver, BC V6B 4Y8",
    "status": "active"
  }'
```

#### 4. Update Supplier

```bash
curl -X PUT "http://localhost:8000/api/suppliers/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Acme Corporation Ltd",
    "code": "SUP0001",
    "contact_person": "John Smith",
    "email": "john.smith@acme.com",
    "phone": "+1 (555) 123-4567",
    "country": "United States",
    "address": "123 Main Street, New York, NY 10001",
    "status": "active"
  }'
```

#### 5. Delete Supplier

```bash
curl -X DELETE "http://localhost:8000/api/suppliers/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### 6. Generate Code

```bash
curl -X GET "http://localhost:8000/api/suppliers/generate-code" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

#### 7. Create B2B-LC with Supplier

```bash
curl -X POST "http://localhost:8000/api/b2b-lcs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "lc_number": "LC-2025-0010",
    "supplier_id": 1,
    "buyer_id": 5,
    "contract_id": 3,
    "amount": 250000.00,
    "currency": "USD"
  }'
```

---

## PowerShell Examples

#### 1. List Suppliers

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Accept" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/suppliers" `
    -Method Get `
    -Headers $headers | ConvertTo-Json -Depth 10
```

#### 2. Create Supplier

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

$body = @{
    name = "PowerShell Supplier"
    code = "SUP0006"
    contact_person = "Bob Wilson"
    email = "bob@powershellsupplier.com"
    phone = "+1 (555) 333-4444"
    country = "United States"
    address = "321 Script Avenue, Seattle, WA 98101"
    status = "active"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/suppliers" `
    -Method Post `
    -Headers $headers `
    -Body $body | ConvertTo-Json -Depth 10
```

#### 3. Filter B2B-LCs by Supplier

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Accept" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/b2b-lcs?supplier_id=1" `
    -Method Get `
    -Headers $headers | ConvertTo-Json -Depth 10
```

---

## JavaScript/Axios Examples

#### 1. List Suppliers with Search

```javascript
import axios from "axios";

const listSuppliers = async (search = "", status = "") => {
  try {
    const response = await axios.get("/api/suppliers", {
      params: { search, status, page: 1, per_page: 15 },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    });

    console.log("Suppliers:", response.data.data);
    console.log("Total:", response.data.meta.total);
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error.response?.data);
    throw error;
  }
};
```

#### 2. Create Supplier

```javascript
const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post("/api/suppliers", supplierData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Created:", response.data.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 422) {
      console.error("Validation errors:", error.response.data.errors);
    }
    throw error;
  }
};

// Usage
await createSupplier({
  name: "JavaScript Supplier",
  code: "SUP0007",
  contact_person: "Carol Smith",
  email: "carol@jssupplier.com",
  status: "active",
});
```

#### 3. Generate Code

```javascript
const generateSupplierCode = async () => {
  try {
    const response = await axios.get("/api/suppliers/generate-code", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    });

    return response.data.code; // e.g., "SUP0008"
  } catch (error) {
    console.error("Error generating code:", error.response?.data);
    throw error;
  }
};
```

---

## Error Code Reference

| HTTP Status | Code                  | Description                              | Solution                         |
| ----------- | --------------------- | ---------------------------------------- | -------------------------------- |
| 200         | OK                    | Request successful                       | -                                |
| 201         | Created               | Resource created successfully            | -                                |
| 401         | Unauthorized          | Authentication required or token invalid | Provide valid Bearer token       |
| 404         | Not Found             | Supplier not found                       | Check supplier ID exists         |
| 409         | Conflict              | Cannot delete supplier with B2B-LCs      | Remove B2B-LC associations first |
| 422         | Unprocessable Entity  | Validation failed                        | Fix validation errors in request |
| 500         | Internal Server Error | Server-side error                        | Contact support, check logs      |

---

## Validation Rules Summary

| Field          | Rules                                                | Example Valid Value |
| -------------- | ---------------------------------------------------- | ------------------- |
| name           | required, string, min:2, max:255                     | "Acme Corporation"  |
| code           | required, string, max:50, regex:/^SUP\d{4}$/, unique | "SUP0001"           |
| contact_person | nullable, string, max:255                            | "John Smith"        |
| email          | nullable, email:rfc,dns, max:255, unique             | "john@acme.com"     |
| phone          | nullable, string, max:50                             | "+1 (555) 123-4567" |
| country        | nullable, string, max:100                            | "United States"     |
| address        | nullable, string                                     | "123 Main St, NY"   |
| status         | required, in:active,inactive                         | "active"            |

---

## Rate Limiting

**Default Limits:**

- 60 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

**Headers:**

- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Timestamp when limit resets

**Response when exceeded:**

```json
{
  "message": "Too many requests. Please try again later.",
  "retry_after": 45
}
```

---

## Changelog

### Version 1.0.0 (2025-01-15)

- Initial API specification
- CRUD operations for suppliers
- Search and filtering
- Code generation endpoint
- B2B-LC integration
- Delete protection

---

**Specification Version:** 1.0.0  
**Last Updated:** December 12, 2025  
**Status:** Production Ready  
**Format:** OpenAPI 3.0.3
