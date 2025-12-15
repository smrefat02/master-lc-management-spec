# Complete LC Management System - OpenAPI 3.0 Specification

## Comprehensive API Documentation

This document contains the complete OpenAPI specification for all modules in the LC Management System.

```yaml
openapi: 3.0.0
info:
  title: LC Management System - Complete API
  description: |
    Complete API specification for the Letter of Credit Management System.

    ## Modules
    - **Contracts**: Sales contract management
    - **Buyers**: Buyer/customer management
    - **Suppliers**: Supplier management
    - **Orders**: Purchase order management
    - **Shipments**: Shipment tracking
    - **B2B LC**: Back-to-back Letter of Credit
    - **Master LC**: Master Letter of Credit with 8-step workflow
    - **Banks**: Banking institution management

    ## Authentication
    All endpoints require Bearer token authentication (JWT).

    ## Version History
    - v3.0.0 (Current): Master LC 8-step workflow with dual-bank architecture
    - v2.0.0: Basic workflow implementation
    - v1.0.0: Initial release

  version: 3.0.0
  contact:
    name: API Support
    email: api@lcmanagement.com

servers:
  - url: http://127.0.0.1:8000/api
    description: Local development server
  - url: https://api.lcmanagement.com/api
    description: Production server

tags:
  - name: Contracts
    description: Sales contract management operations
  - name: Buyers
    description: Buyer/customer management
  - name: Suppliers
    description: Supplier management operations
  - name: Orders
    description: Purchase order management
  - name: Shipments
    description: Shipment tracking and management
  - name: B2B LC
    description: Back-to-back Letter of Credit operations
  - name: Master LC
    description: Master LC CRUD operations
  - name: Master LC Workflow
    description: LC lifecycle workflow transitions (8-step process)
  - name: Banks
    description: Bank management
  - name: Utilities
    description: Utility endpoints and helpers

security:
  - bearerAuth: []

paths:
  # ==========================================
  # CONTRACTS
  # ==========================================

  /contracts:
    get:
      tags:
        - Contracts
      summary: List all contracts
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 20
        - name: search
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Contract"

    post:
      tags:
        - Contracts
      summary: Create new contract
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateContractRequest"
      responses:
        "201":
          description: Contract created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Contract"

  /contracts/next-number:
    get:
      tags:
        - Contracts
      summary: Generate next contract number
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      contract_number:
                        type: string
                        example: "CTR-2025-0042"

  /contracts/{id}:
    get:
      tags:
        - Contracts
      summary: Get contract details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Contract"

    put:
      tags:
        - Contracts
      summary: Update contract
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateContractRequest"
      responses:
        "200":
          description: Contract updated
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Contract"

  # ==========================================
  # BUYERS
  # ==========================================

  /buyers:
    get:
      tags:
        - Buyers
      summary: List all buyers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: per_page
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Buyer"

    post:
      tags:
        - Buyers
      summary: Create new buyer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateBuyerRequest"
      responses:
        "201":
          description: Buyer created

  /buyers/dropdown:
    get:
      tags:
        - Buyers
      summary: Get buyers for dropdown
      description: Returns simplified buyer list for form dropdowns
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        name:
                          type: string
                        country:
                          type: string

  /buyers/{buyer}:
    get:
      tags:
        - Buyers
      summary: Get buyer details
      parameters:
        - name: buyer
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success

    put:
      tags:
        - Buyers
      summary: Update buyer
      parameters:
        - name: buyer
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateBuyerRequest"
      responses:
        "200":
          description: Buyer updated

    delete:
      tags:
        - Buyers
      summary: Delete buyer
      parameters:
        - name: buyer
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Buyer deleted

  # ==========================================
  # SUPPLIERS
  # ==========================================

  /suppliers:
    get:
      tags:
        - Suppliers
      summary: List all suppliers
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 20
        - name: search
          in: query
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive]
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Supplier"

    post:
      tags:
        - Suppliers
      summary: Create new supplier
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateSupplierRequest"
      responses:
        "201":
          description: Supplier created

  /suppliers/generate-code:
    get:
      tags:
        - Suppliers
      summary: Generate supplier code
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      supplier_code:
                        type: string
                        example: "SUP-2025-0042"

  /suppliers/{supplier}:
    get:
      tags:
        - Suppliers
      summary: Get supplier details
      parameters:
        - name: supplier
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success

    put:
      tags:
        - Suppliers
      summary: Update supplier
      parameters:
        - name: supplier
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateSupplierRequest"
      responses:
        "200":
          description: Supplier updated

    delete:
      tags:
        - Suppliers
      summary: Delete supplier
      parameters:
        - name: supplier
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Supplier deleted

  # ==========================================
  # ORDERS
  # ==========================================

  /orders:
    get:
      tags:
        - Orders
      summary: List all orders
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Order"

    post:
      tags:
        - Orders
      summary: Create new order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateOrderRequest"
      responses:
        "201":
          description: Order created

  /orders/{id}:
    get:
      tags:
        - Orders
      summary: Get order details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success

    put:
      tags:
        - Orders
      summary: Update order
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateOrderRequest"
      responses:
        "200":
          description: Order updated

    delete:
      tags:
        - Orders
      summary: Delete order
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Order deleted

  # ==========================================
  # SHIPMENTS
  # ==========================================

  /shipments:
    get:
      tags:
        - Shipments
      summary: List all shipments
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Shipment"

    post:
      tags:
        - Shipments
      summary: Create new shipment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateShipmentRequest"
      responses:
        "201":
          description: Shipment created

  /shipments/{id}:
    get:
      tags:
        - Shipments
      summary: Get shipment details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success

    put:
      tags:
        - Shipments
      summary: Update shipment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateShipmentRequest"
      responses:
        "200":
          description: Shipment updated

    delete:
      tags:
        - Shipments
      summary: Delete shipment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Shipment deleted

  # ==========================================
  # B2B LC
  # ==========================================

  /b2b-lc:
    get:
      tags:
        - B2B LC
      summary: List all B2B LCs
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/B2BLC"

    post:
      tags:
        - B2B LC
      summary: Create new B2B LC
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateB2BLCRequest"
      responses:
        "201":
          description: B2B LC created

  /b2b-lc/{b2bLc}:
    get:
      tags:
        - B2B LC
      summary: Get B2B LC details
      parameters:
        - name: b2bLc
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success

    put:
      tags:
        - B2B LC
      summary: Update B2B LC
      parameters:
        - name: b2bLc
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateB2BLCRequest"
      responses:
        "200":
          description: B2B LC updated

    delete:
      tags:
        - B2B LC
      summary: Delete B2B LC
      parameters:
        - name: b2bLc
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: B2B LC deleted

  # ==========================================
  # MASTER LC - CRUD
  # ==========================================

  /master-lc:
    get:
      tags:
        - Master LC
      summary: List all Master LCs
      description: Get paginated list of Master LCs with optional filters
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: per_page
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum:
              [
                draft,
                applied,
                issued_by_issuing_bank,
                verified_by_advising_bank,
                goods_shipped,
                documents_received,
                documents_forwarded,
                documents_verified,
                active,
                expired,
                rejected,
              ]
        - name: search
          in: query
          schema:
            type: string
          description: Search by LC number or buyer name
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/MasterLCList"
                  pagination:
                    $ref: "#/components/schemas/Pagination"

    post:
      tags:
        - Master LC
      summary: Create new Master LC
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateMasterLCRequest"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"
        "422":
          $ref: "#/components/responses/ValidationError"

  /master-lc/{id}:
    get:
      tags:
        - Master LC
      summary: Get Master LC details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"
        "404":
          $ref: "#/components/responses/NotFound"

    put:
      tags:
        - Master LC
      summary: Update Master LC (Draft only)
      description: Only draft LCs can be updated
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateMasterLCRequest"
      responses:
        "200":
          description: Updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"
        "422":
          $ref: "#/components/responses/ValidationError"

    delete:
      tags:
        - Master LC
      summary: Delete Master LC (Draft only)
      description: Only draft LCs can be deleted
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Deleted
        "404":
          $ref: "#/components/responses/NotFound"

  /master-lc/{id}/status:
    post:
      tags:
        - Master LC
      summary: Change LC status (legacy)
      description: Change LC status - Note Use workflow endpoints for v3.0
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - status
              properties:
                status:
                  type: string
                remarks:
                  type: string
      responses:
        "200":
          description: Status updated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"

  /master-lc/{id}/upload:
    post:
      tags:
        - Master LC
      summary: Upload LC attachment
      description: Upload a file attachment to the LC
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
              properties:
                file:
                  type: string
                  format: binary
                type:
                  type: string
                  description: Document type (invoice, packing_list, etc.)
                description:
                  type: string
      responses:
        "200":
          description: File uploaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string
                  data:
                    type: object
                    properties:
                      id:
                        type: integer
                      filename:
                        type: string
                      path:
                        type: string
                      size:
                        type: integer

  /master-lc/{id}/attachment/{attachmentId}:
    delete:
      tags:
        - Master LC
      summary: Delete LC attachment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
        - name: attachmentId
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Attachment deleted
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string

  /master-lc/{id}/attachment/{attachmentId}/download:
    get:
      tags:
        - Master LC
      summary: Download LC attachment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
        - name: attachmentId
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: File download
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary

  # ==========================================
  # MASTER LC - WORKFLOW (8-Step Process)
  # ==========================================

  /master-lc/{id}/apply:
    put:
      tags:
        - Master LC Workflow
      summary: Apply for LC (Step 2)
      description: Importer applies for LC after agreeing on contract
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                applicant_remarks:
                  type: string
                  maxLength: 1000
      responses:
        "200":
          description: Applied successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"
        "422":
          $ref: "#/components/responses/ValidationError"

  /master-lc/{id}/issue:
    put:
      tags:
        - Master LC Workflow
      summary: Issue LC (Step 3)
      description: Issuing bank issues LC
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - issuing_bank_id
                - issuing_bank_reference_no
                - issuing_bank_issue_date
              properties:
                issuing_bank_id:
                  type: integer
                issuing_bank_reference_no:
                  type: string
                  maxLength: 100
                issuing_bank_issue_date:
                  type: string
                  format: date
                issuer_remarks:
                  type: string
                  maxLength: 1000
      responses:
        "200":
          description: Issued successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"

  /master-lc/{id}/advise:
    put:
      tags:
        - Master LC Workflow
      summary: Advise/Verify LC (Step 4)
      description: Advising bank verifies LC
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - advising_bank_id
                - advising_bank_verification_status
              properties:
                advising_bank_id:
                  type: integer
                advising_bank_verification_status:
                  type: string
                  enum: [verified, rejected]
                advisor_remarks:
                  type: string
                  maxLength: 1000
      responses:
        "200":
          description: Advised successfully

  /master-lc/{id}/ship-goods:
    put:
      tags:
        - Master LC Workflow
      summary: Ship Goods (Step 5)
      description: Record goods shipment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - shipping_date
                - carrier
                - bill_of_lading_no
              properties:
                shipment_id:
                  type: integer
                shipping_date:
                  type: string
                  format: date
                carrier:
                  type: string
                vessel_name:
                  type: string
                bill_of_lading_no:
                  type: string
                port_of_loading:
                  type: string
                port_of_discharge:
                  type: string
                shipper_remarks:
                  type: string
      responses:
        "200":
          description: Goods shipment recorded

  /master-lc/{id}/documents/receive:
    put:
      tags:
        - Master LC Workflow
      summary: Receive Documents (Step 6)
      description: Record document receipt from exporter
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - received_documents
              properties:
                received_documents:
                  type: array
                  items:
                    type: string
                  example:
                    ["commercial_invoice", "packing_list", "bill_of_lading"]
                receiver_remarks:
                  type: string
      responses:
        "200":
          description: Documents received

  /master-lc/{id}/documents/forward:
    put:
      tags:
        - Master LC Workflow
      summary: Forward Documents (Step 7)
      description: Forward documents to issuing bank
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                forwarder_remarks:
                  type: string
      responses:
        "200":
          description: Documents forwarded

  /master-lc/{id}/documents/verify:
    put:
      tags:
        - Master LC Workflow
      summary: Verify Documents (Step 8)
      description: Issuing bank verifies documents
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - verification_status
              properties:
                verification_status:
                  type: string
                  enum: [approved, rejected]
                discrepancies:
                  type: array
                  items:
                    type: string
                verifier_remarks:
                  type: string
      responses:
        "200":
          description: Documents verified

  /master-lc/{id}/activate:
    put:
      tags:
        - Master LC Workflow
      summary: Activate LC (Final Step)
      description: Activate LC after successful document verification
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: LC activated
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/MasterLCResponse"

  /master-lc/{id}/reject:
    put:
      tags:
        - Master LC Workflow
      summary: Reject LC
      description: Reject LC at any stage
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - rejection_reason
              properties:
                rejection_reason:
                  type: string
                  minLength: 10
                  maxLength: 1000
      responses:
        "200":
          description: LC rejected

  /master-lc/{id}/timeline:
    get:
      tags:
        - Master LC Workflow
      summary: Get LC timeline
      description: Retrieve complete workflow history
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/TimelineEntry"

  # ==========================================
  # BANKS
  # ==========================================

  /banks:
    get:
      tags:
        - Banks
      summary: List all active banks
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, inactive]
            default: active
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/Bank"

  /banks/{bank}:
    get:
      tags:
        - Banks
      summary: Get bank details
      parameters:
        - name: bank
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Bank"

  # ==========================================
  # UTILITIES
  # ==========================================

  /master-lc-generate-number:
    get:
      tags:
        - Utilities
      summary: Generate LC number
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      lc_number:
                        type: string
                        example: "LC-2025-0042"

  /master-lc-dropdown-data:
    get:
      tags:
        - Utilities
      summary: Get dropdown data for form
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      contracts:
                        type: array
                      banks:
                        type: array
                      currencies:
                        type: array
                      document_types:
                        type: array

  /master-lc-statistics:
    get:
      tags:
        - Utilities
      summary: Get LC statistics
      responses:
        "200":
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      total_lcs:
                        type: integer
                      by_status:
                        type: object
                      total_amount:
                        type: number
                      by_currency:
                        type: object

# ==========================================
# COMPONENTS
# ==========================================

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    # Contract Schemas
    Contract:
      type: object
      properties:
        id:
          type: integer
        contract_number:
          type: string
        buyer_id:
          type: integer
        date:
          type: string
          format: date
        status:
          type: string
        total_amount:
          type: number
        buyer:
          $ref: "#/components/schemas/Buyer"

    CreateContractRequest:
      type: object
      required:
        - buyer_id
        - contract_number
        - date
      properties:
        buyer_id:
          type: integer
        contract_number:
          type: string
        date:
          type: string
          format: date
        terms:
          type: string

    UpdateContractRequest:
      type: object
      properties:
        status:
          type: string
        terms:
          type: string

    # Buyer Schemas
    Buyer:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        country:
          type: string
        contact_person:
          type: string
        email:
          type: string
        phone:
          type: string
        address:
          type: string

    CreateBuyerRequest:
      type: object
      required:
        - name
        - country
        - email
      properties:
        name:
          type: string
        country:
          type: string
        contact_person:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        address:
          type: string

    UpdateBuyerRequest:
      type: object
      properties:
        name:
          type: string
        country:
          type: string
        contact_person:
          type: string
        email:
          type: string
        phone:
          type: string
        address:
          type: string

    # Supplier Schemas
    Supplier:
      type: object
      properties:
        id:
          type: integer
        supplier_code:
          type: string
        name:
          type: string
        contact_person:
          type: string
        email:
          type: string
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        country:
          type: string
        status:
          type: string

    CreateSupplierRequest:
      type: object
      required:
        - name
        - contact_person
        - email
        - country
      properties:
        supplier_code:
          type: string
        name:
          type: string
        contact_person:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        address:
          type: string
        city:
          type: string
        country:
          type: string
        bank_name:
          type: string
        bank_account:
          type: string
        swift_code:
          type: string

    UpdateSupplierRequest:
      type: object
      properties:
        name:
          type: string
        contact_person:
          type: string
        email:
          type: string
        phone:
          type: string
        address:
          type: string
        status:
          type: string

    # Order Schemas
    Order:
      type: object
      properties:
        id:
          type: integer
        order_number:
          type: string
        contract_id:
          type: integer
        supplier_id:
          type: integer
        order_date:
          type: string
          format: date
        status:
          type: string
        total_amount:
          type: number

    CreateOrderRequest:
      type: object
      required:
        - order_number
        - contract_id
        - supplier_id
        - order_date
      properties:
        order_number:
          type: string
        contract_id:
          type: integer
        supplier_id:
          type: integer
        order_date:
          type: string
          format: date
        items:
          type: array

    UpdateOrderRequest:
      type: object
      properties:
        status:
          type: string
        items:
          type: array

    # Shipment Schemas
    Shipment:
      type: object
      properties:
        id:
          type: integer
        shipment_number:
          type: string
        order_id:
          type: integer
        shipping_date:
          type: string
          format: date
        status:
          type: string
        carrier:
          type: string

    CreateShipmentRequest:
      type: object
      required:
        - shipment_number
        - order_id
        - shipping_date
        - carrier
      properties:
        shipment_number:
          type: string
        order_id:
          type: integer
        shipping_date:
          type: string
          format: date
        carrier:
          type: string
        tracking_number:
          type: string

    UpdateShipmentRequest:
      type: object
      properties:
        status:
          type: string
        tracking_number:
          type: string

    # B2B LC Schemas
    B2BLC:
      type: object
      properties:
        id:
          type: integer
        lc_number:
          type: string
        master_lc_id:
          type: integer
        supplier_id:
          type: integer
        amount:
          type: number
        currency:
          type: string
        status:
          type: string

    CreateB2BLCRequest:
      type: object
      required:
        - lc_number
        - master_lc_id
        - supplier_id
        - amount
        - currency
      properties:
        lc_number:
          type: string
        master_lc_id:
          type: integer
        supplier_id:
          type: integer
        amount:
          type: number
        currency:
          type: string

    UpdateB2BLCRequest:
      type: object
      properties:
        amount:
          type: number
        status:
          type: string

    # Master LC Schemas
    MasterLCList:
      type: object
      properties:
        id:
          type: integer
        lc_number:
          type: string
        lc_status:
          type: string
        issue_date:
          type: string
          format: date
        expiry_date:
          type: string
          format: date
        buyer_info:
          type: object
        amount:
          type: number
        currency:
          type: string
        created_at:
          type: string
          format: date-time

    MasterLCResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          $ref: "#/components/schemas/MasterLC"

    MasterLC:
      type: object
      properties:
        id:
          type: integer
        contract_id:
          type: integer
          nullable: true
        lc_number:
          type: string
        lc_number_mode:
          type: string
          enum: [auto, manual]
        issue_date:
          type: string
          format: date
        expiry_date:
          type: string
          format: date
        buyer_info:
          type: object
        beneficiary_info:
          type: object
        amount:
          type: number
        currency:
          type: string
        required_documents:
          type: array
          items:
            type: string
        terms_and_conditions:
          type: string
        issuing_bank_id:
          type: integer
          nullable: true
        issuing_bank_reference_no:
          type: string
          nullable: true
        issuing_bank_issue_date:
          type: string
          format: date
          nullable: true
        advising_bank_id:
          type: integer
          nullable: true
        advising_bank_verification_status:
          type: string
          enum: [pending, verified, rejected]
        lc_status:
          type: string
          enum:
            [
              draft,
              applied,
              issued_by_issuing_bank,
              verified_by_advising_bank,
              goods_shipped,
              documents_received,
              documents_forwarded,
              documents_verified,
              active,
              expired,
              rejected,
            ]
        applied_at:
          type: string
          format: date-time
          nullable: true
        issued_at:
          type: string
          format: date-time
          nullable: true
        goods_shipped_at:
          type: string
          format: date-time
          nullable: true
        documents_received_at:
          type: string
          format: date-time
          nullable: true
        documents_forwarded_at:
          type: string
          format: date-time
          nullable: true
        documents_verified_at:
          type: string
          format: date-time
          nullable: true
        activated_at:
          type: string
          format: date-time
          nullable: true
        rejection_reason:
          type: string
          nullable: true
        issuing_bank:
          $ref: "#/components/schemas/Bank"
        advising_bank:
          $ref: "#/components/schemas/Bank"
        timeline:
          type: array
          items:
            $ref: "#/components/schemas/TimelineEntry"
        allowed_transitions:
          type: array
          items:
            type: string
        next_action:
          type: string
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    CreateMasterLCRequest:
      type: object
      required:
        - lc_number_mode
        - issue_date
        - expiry_date
        - buyer_info
        - beneficiary_info
        - amount
        - currency
      properties:
        contract_id:
          type: integer
        lc_number_mode:
          type: string
          enum: [auto, manual]
        lc_number:
          type: string
        issue_date:
          type: string
          format: date
        expiry_date:
          type: string
          format: date
        buyer_info:
          type: object
          required:
            - name
            - country
            - contact_person
            - address
        beneficiary_info:
          type: object
          required:
            - bank_name
            - bank_address
            - swift_code
            - account_number
            - account_name
        amount:
          type: number
        currency:
          type: string
        required_documents:
          type: array
          items:
            type: string
        terms_and_conditions:
          type: string

    UpdateMasterLCRequest:
      type: object
      properties:
        expiry_date:
          type: string
          format: date
        amount:
          type: number
        terms_and_conditions:
          type: string

    # Bank Schema
    Bank:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        swift_code:
          type: string
        address:
          type: string
        country:
          type: string
        contact_person:
          type: string
        phone:
          type: string
        email:
          type: string
        status:
          type: string

    # Timeline Schema
    TimelineEntry:
      type: object
      properties:
        id:
          type: integer
        action:
          type: string
        action_label:
          type: string
        description:
          type: string
        performed_by:
          type: string
        performed_at:
          type: string
          format: date-time
        performed_at_formatted:
          type: string
        time_ago:
          type: string
        previous_status:
          type: string
        new_status:
          type: string
        remarks:
          type: string
        metadata:
          type: object

    # Pagination Schema
    Pagination:
      type: object
      properties:
        current_page:
          type: integer
        per_page:
          type: integer
        total:
          type: integer
        last_page:
          type: integer
        from:
          type: integer
        to:
          type: integer

    # Error Schema
    Error:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        errors:
          type: object

  responses:
    ValidationError:
      description: Validation failed
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"

    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
```

---

## Quick Reference

### Master LC Workflow Steps

1. **Draft** → Create LC
2. **Apply** (`PUT /master-lc/{id}/apply`) → Importer applies
3. **Issue** (`PUT /master-lc/{id}/issue`) → Issuing bank issues
4. **Advise** (`PUT /master-lc/{id}/advise`) → Advising bank verifies
5. **Ship Goods** (`PUT /master-lc/{id}/ship-goods`) → Exporter ships
6. **Receive Docs** (`PUT /master-lc/{id}/documents/receive`) → Bank receives docs
7. **Forward Docs** (`PUT /master-lc/{id}/documents/forward`) → Forward to issuing bank
8. **Verify Docs** (`PUT /master-lc/{id}/documents/verify`) → Issuing bank verifies
9. **Activate** (`PUT /master-lc/{id}/activate`) → LC activated

### LC Status Values

- `draft` - Initial creation
- `applied` - Application submitted
- `issued_by_issuing_bank` - LC issued
- `verified_by_advising_bank` - LC verified
- `goods_shipped` - Goods shipped
- `documents_received` - Documents received
- `documents_forwarded` - Documents forwarded
- `documents_verified` - Documents verified
- `active` - LC active (final)
- `rejected` - LC rejected (terminal)
- `expired` - LC expired (terminal)

---

## Implementation Notes

### Authentication

All endpoints require JWT Bearer token authentication. Include in header:

```
Authorization: Bearer {token}
```

### Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["validation error message"]
  }
}
```

### Date Formats

- Dates: `YYYY-MM-DD`
- Timestamps: ISO 8601 format

### Testing

Use the Swagger UI at `/api/documentation` for interactive API testing.

---

**End of Complete API Specification**
