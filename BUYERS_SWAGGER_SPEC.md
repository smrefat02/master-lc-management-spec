# Buyers Module - Swagger/OpenAPI Specification

**Project:** LC Management System  
**Module:** Buyers Management  
**Version:** 1.0.0  
**Date:** December 11, 2025  
**OpenAPI Version:** 3.0.0

---

## 📋 API Overview

This document provides the complete OpenAPI 3.0 specification for the Buyers Management module API endpoints.

---

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Buyers Management API
  description: API for managing buyers/customers in the LC Management System
  version: 1.0.0
  contact:
    name: API Support
    email: support@lcmanagement.com

servers:
  - url: http://localhost:8000/api
    description: Local Development Server
  - url: https://api.lcmanagement.com/api
    description: Production Server

tags:
  - name: Buyers
    description: Buyer management operations

paths:
  /buyers:
    get:
      tags:
        - Buyers
      summary: List all buyers
      description: |
        Retrieves a paginated list of buyers with optional search and status filtering.
        Results are ordered by name ascending by default.
      operationId: getBuyers
      parameters:
        - name: search
          in: query
          description: Search term to filter buyers by name, code, country, or email
          required: false
          schema:
            type: string
            example: "ABC Trading"
        - name: status
          in: query
          description: Filter buyers by status
          required: false
          schema:
            type: string
            enum:
              - active
              - inactive
            example: active
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
        - name: page
          in: query
          description: Page number
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
            example: 1
      responses:
        "200":
          description: Successful response with paginated list of buyers
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/BuyerPaginatedResponse"
              example:
                data:
                  - id: 1
                    name: "ABC Trading Co. Ltd"
                    code: "ABC01"
                    contact_person: "John Smith"
                    email: "john@abctrading.com"
                    phone: "+1-555-0123"
                    country: "USA"
                    address: "123 Trade Street, New York, NY 10001"
                    status: "active"
                    created_at: "2025-12-01T10:30:00.000000Z"
                    updated_at: "2025-12-01T10:30:00.000000Z"
                  - id: 2
                    name: "XYZ International Ltd"
                    code: "XYZ01"
                    contact_person: "Jane Doe"
                    email: "jane@xyzint.com"
                    phone: "+44-20-7946-0958"
                    country: "UK"
                    address: "456 Commerce Road, London EC1A 1BB"
                    status: "active"
                    created_at: "2025-12-02T14:15:00.000000Z"
                    updated_at: "2025-12-02T14:15:00.000000Z"
                current_page: 1
                last_page: 5
                per_page: 15
                total: 72
                from: 1
                to: 15
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

    post:
      tags:
        - Buyers
      summary: Create a new buyer
      description: Creates a new buyer record with the provided data
      operationId: createBuyer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BuyerCreateRequest"
            example:
              name: "New Trading Company"
              code: "NTC01"
              contact_person: "Bob Wilson"
              email: "bob@newtradingco.com"
              phone: "+1-555-9876"
              country: "Canada"
              address: "789 Business Blvd, Toronto, ON M5V 2H1"
              status: "active"
      responses:
        "201":
          description: Buyer created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Buyer"
              example:
                id: 10
                name: "New Trading Company"
                code: "NTC01"
                contact_person: "Bob Wilson"
                email: "bob@newtradingco.com"
                phone: "+1-555-9876"
                country: "Canada"
                address: "789 Business Blvd, Toronto, ON M5V 2H1"
                status: "active"
                created_at: "2025-12-11T15:30:00.000000Z"
                updated_at: "2025-12-11T15:30:00.000000Z"
        "422":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidationErrorResponse"
              examples:
                missing_name:
                  summary: Missing name
                  value:
                    message: "The name field is required."
                    errors:
                      name:
                        - "The name field is required."
                duplicate_code:
                  summary: Duplicate code
                  value:
                    message: "The code has already been taken."
                    errors:
                      code:
                        - "The code has already been taken."
                invalid_email:
                  summary: Invalid email format
                  value:
                    message: "The email must be a valid email address."
                    errors:
                      email:
                        - "The email must be a valid email address."
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

  /buyers/{id}:
    get:
      tags:
        - Buyers
      summary: Get a single buyer
      description: Retrieves detailed information about a specific buyer
      operationId: getBuyer
      parameters:
        - name: id
          in: path
          description: Buyer ID
          required: true
          schema:
            type: integer
            example: 1
      responses:
        "200":
          description: Successful response with buyer details
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Buyer"
              example:
                id: 1
                name: "ABC Trading Co. Ltd"
                code: "ABC01"
                contact_person: "John Smith"
                email: "john@abctrading.com"
                phone: "+1-555-0123"
                country: "USA"
                address: "123 Trade Street, New York, NY 10001"
                status: "active"
                created_at: "2025-12-01T10:30:00.000000Z"
                updated_at: "2025-12-01T10:30:00.000000Z"
        "404":
          description: Buyer not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                message: "Buyer not found"
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

    put:
      tags:
        - Buyers
      summary: Update a buyer
      description: Updates an existing buyer with the provided data
      operationId: updateBuyer
      parameters:
        - name: id
          in: path
          description: Buyer ID
          required: true
          schema:
            type: integer
            example: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/BuyerUpdateRequest"
            example:
              name: "ABC Trading Co. Ltd (Updated)"
              code: "ABC01"
              contact_person: "John Smith Jr."
              email: "johnsmith@abctrading.com"
              phone: "+1-555-0199"
              country: "USA"
              address: "456 New Trade Street, New York, NY 10002"
              status: "active"
      responses:
        "200":
          description: Buyer updated successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Buyer"
              example:
                id: 1
                name: "ABC Trading Co. Ltd (Updated)"
                code: "ABC01"
                contact_person: "John Smith Jr."
                email: "johnsmith@abctrading.com"
                phone: "+1-555-0199"
                country: "USA"
                address: "456 New Trade Street, New York, NY 10002"
                status: "active"
                created_at: "2025-12-01T10:30:00.000000Z"
                updated_at: "2025-12-11T16:00:00.000000Z"
        "404":
          description: Buyer not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                message: "Buyer not found"
        "422":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidationErrorResponse"
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

    delete:
      tags:
        - Buyers
      summary: Delete a buyer
      description: |
        Deletes a buyer record. This operation will fail if the buyer is 
        referenced by other records (e.g., contracts).
      operationId: deleteBuyer
      parameters:
        - name: id
          in: path
          description: Buyer ID
          required: true
          schema:
            type: integer
            example: 1
      responses:
        "204":
          description: Buyer deleted successfully (no content)
        "404":
          description: Buyer not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                message: "Buyer not found"
        "409":
          description: Conflict - Buyer is referenced by other records
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                message: "Cannot delete buyer. It is referenced by existing contracts."
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"

components:
  schemas:
    Buyer:
      type: object
      properties:
        id:
          type: integer
          description: Unique identifier
          example: 1
        name:
          type: string
          description: Company/buyer name
          maxLength: 255
          example: "ABC Trading Co. Ltd"
        code:
          type: string
          description: Unique short code for the buyer
          maxLength: 50
          example: "ABC01"
        contact_person:
          type: string
          nullable: true
          description: Primary contact person's name
          maxLength: 255
          example: "John Smith"
        email:
          type: string
          format: email
          nullable: true
          description: Contact email address
          maxLength: 255
          example: "john@abctrading.com"
        phone:
          type: string
          nullable: true
          description: Contact phone number
          maxLength: 50
          example: "+1-555-0123"
        country:
          type: string
          nullable: true
          description: Country name
          maxLength: 100
          example: "USA"
        address:
          type: string
          nullable: true
          description: Full address
          example: "123 Trade Street, New York, NY 10001"
        status:
          type: string
          enum:
            - active
            - inactive
          description: Current status of the buyer
          example: "active"
        created_at:
          type: string
          format: date-time
          description: Record creation timestamp
          example: "2025-12-01T10:30:00.000000Z"
        updated_at:
          type: string
          format: date-time
          description: Last update timestamp
          example: "2025-12-01T10:30:00.000000Z"
      required:
        - id
        - name
        - code
        - status
        - created_at
        - updated_at

    BuyerCreateRequest:
      type: object
      properties:
        name:
          type: string
          description: Company/buyer name (required)
          maxLength: 255
          example: "New Trading Company"
        code:
          type: string
          description: Unique short code (required)
          maxLength: 50
          example: "NTC01"
        contact_person:
          type: string
          nullable: true
          description: Primary contact person's name
          maxLength: 255
          example: "Bob Wilson"
        email:
          type: string
          format: email
          nullable: true
          description: Contact email address
          maxLength: 255
          example: "bob@newtradingco.com"
        phone:
          type: string
          nullable: true
          description: Contact phone number
          maxLength: 50
          example: "+1-555-9876"
        country:
          type: string
          nullable: true
          description: Country name
          maxLength: 100
          example: "Canada"
        address:
          type: string
          nullable: true
          description: Full address
          example: "789 Business Blvd, Toronto, ON M5V 2H1"
        status:
          type: string
          enum:
            - active
            - inactive
          description: Buyer status (required)
          example: "active"
      required:
        - name
        - code
        - status

    BuyerUpdateRequest:
      type: object
      properties:
        name:
          type: string
          description: Company/buyer name (required)
          maxLength: 255
          example: "Updated Trading Company"
        code:
          type: string
          description: Unique short code (required, unique excluding current)
          maxLength: 50
          example: "UTC01"
        contact_person:
          type: string
          nullable: true
          description: Primary contact person's name
          maxLength: 255
          example: "Jane Wilson"
        email:
          type: string
          format: email
          nullable: true
          description: Contact email address
          maxLength: 255
          example: "jane@updatedco.com"
        phone:
          type: string
          nullable: true
          description: Contact phone number
          maxLength: 50
          example: "+1-555-1234"
        country:
          type: string
          nullable: true
          description: Country name
          maxLength: 100
          example: "USA"
        address:
          type: string
          nullable: true
          description: Full address
          example: "999 Commerce Ave, Miami, FL 33101"
        status:
          type: string
          enum:
            - active
            - inactive
          description: Buyer status (required)
          example: "active"
      required:
        - name
        - code
        - status

    BuyerPaginatedResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: "#/components/schemas/Buyer"
          description: Array of buyer objects
        current_page:
          type: integer
          description: Current page number
          example: 1
        last_page:
          type: integer
          description: Last page number
          example: 5
        per_page:
          type: integer
          description: Items per page
          example: 15
        total:
          type: integer
          description: Total number of records
          example: 72
        from:
          type: integer
          nullable: true
          description: Starting record number on current page
          example: 1
        to:
          type: integer
          nullable: true
          description: Ending record number on current page
          example: 15
        first_page_url:
          type: string
          format: uri
          description: URL to first page
          example: "http://localhost:8000/api/buyers?page=1"
        last_page_url:
          type: string
          format: uri
          description: URL to last page
          example: "http://localhost:8000/api/buyers?page=5"
        next_page_url:
          type: string
          format: uri
          nullable: true
          description: URL to next page
          example: "http://localhost:8000/api/buyers?page=2"
        prev_page_url:
          type: string
          format: uri
          nullable: true
          description: URL to previous page
          example: null
        path:
          type: string
          format: uri
          description: Base URL path
          example: "http://localhost:8000/api/buyers"

    ErrorResponse:
      type: object
      properties:
        message:
          type: string
          description: Error message
          example: "An error occurred"
      required:
        - message

    ValidationErrorResponse:
      type: object
      properties:
        message:
          type: string
          description: Summary error message
          example: "The given data was invalid."
        errors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
          description: Field-specific error messages
          example:
            name:
              - "The name field is required."
            code:
              - "The code field is required."
              - "The code has already been taken."
      required:
        - message
        - errors
```

---

## 📊 API Endpoints Summary

| Method | Endpoint           | Description             | Auth Required |
| ------ | ------------------ | ----------------------- | ------------- |
| GET    | `/api/buyers`      | List buyers (paginated) | No            |
| POST   | `/api/buyers`      | Create new buyer        | No            |
| GET    | `/api/buyers/{id}` | Get single buyer        | No            |
| PUT    | `/api/buyers/{id}` | Update buyer            | No            |
| DELETE | `/api/buyers/{id}` | Delete buyer            | No            |

---

## 🔍 Query Parameters

### GET /api/buyers

| Parameter  | Type    | Required | Default | Description                          |
| ---------- | ------- | -------- | ------- | ------------------------------------ |
| `search`   | string  | No       | -       | Search by name, code, country, email |
| `status`   | string  | No       | -       | Filter by status (active/inactive)   |
| `per_page` | integer | No       | 15      | Items per page (1-100)               |
| `page`     | integer | No       | 1       | Page number                          |

---

## ✅ Response Codes

| Code | Description           | Usage                        |
| ---- | --------------------- | ---------------------------- |
| 200  | OK                    | Successful GET, PUT requests |
| 201  | Created               | Successful POST request      |
| 204  | No Content            | Successful DELETE request    |
| 404  | Not Found             | Resource not found           |
| 409  | Conflict              | Delete blocked by references |
| 422  | Unprocessable Entity  | Validation errors            |
| 500  | Internal Server Error | Server error                 |

---

## 🛡️ Validation Rules

### Create/Update Buyer

| Field            | Rules                            |
| ---------------- | -------------------------------- |
| `name`           | Required, string, max 255        |
| `code`           | Required, string, max 50, unique |
| `contact_person` | Nullable, string, max 255        |
| `email`          | Nullable, valid email, max 255   |
| `phone`          | Nullable, string, max 50         |
| `country`        | Nullable, string, max 100        |
| `address`        | Nullable, string                 |
| `status`         | Required, in: active, inactive   |

---

## 📝 Usage Examples

### List Buyers with Search

```bash
GET /api/buyers?search=ABC&status=active&per_page=10&page=1
```

### Create Buyer

```bash
POST /api/buyers
Content-Type: application/json

{
  "name": "New Company Ltd",
  "code": "NCL01",
  "contact_person": "John Doe",
  "email": "john@newcompany.com",
  "phone": "+1-555-1234",
  "country": "USA",
  "address": "123 Main St, New York, NY 10001",
  "status": "active"
}
```

### Update Buyer

```bash
PUT /api/buyers/1
Content-Type: application/json

{
  "name": "Updated Company Ltd",
  "code": "NCL01",
  "contact_person": "Jane Doe",
  "email": "jane@updatedcompany.com",
  "phone": "+1-555-5678",
  "country": "Canada",
  "address": "456 Commerce Blvd, Toronto, ON M5V 2H1",
  "status": "inactive"
}
```

### Delete Buyer

```bash
DELETE /api/buyers/1
```

---

**End of Swagger Specification**
