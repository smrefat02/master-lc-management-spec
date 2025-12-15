# Master LC Management - OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Master LC Management API
  description: |
    Complete API specification for Master Letter of Credit management system.
    Implements full 8-step LC workflow with dual-bank architecture.
  version: 3.0.0
  contact:
    name: API Support
    email: api@example.com

servers:
  - url: http://127.0.0.1:8000/api
    description: Local development server
  - url: https://api.example.com/api
    description: Production server

tags:
  - name: Master LC
    description: Master LC CRUD operations
  - name: Workflow
    description: LC lifecycle workflow transitions
  - name: Banks
    description: Bank management
  - name: Suppliers
    description: Supplier management operations
  - name: Utilities
    description: Utility endpoints

security:
  - bearerAuth: []

paths:
  # ==========================================
  # MASTER LC CRUD
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
      summary: Update Master LC (draft only)
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
        "403":
          $ref: "#/components/responses/Forbidden"
        "422":
          $ref: "#/components/responses/ValidationError"

    delete:
      tags:
        - Master LC
      summary: Delete Master LC (draft only)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        "200":
          description: Deleted
        "403":
          $ref: "#/components/responses/Forbidden"
  /master-lc/{id}/status:
    post:
      tags:
        - Master LC
      summary: Change LC status (legacy)
      description: Change LC status - Note: Use workflow endpoints for v3.0
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
  # WORKFLOW TRANSITIONS
  # ==========================================

  /master-lc/{id}/apply:
    put:
      tags:
        - Workflow
      summary: Apply for LC (Step 2)
      description: Submit LC application to issuing bank
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
        - Workflow
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
        - Workflow
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
        - Workflow
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
        - Workflow
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
        - Workflow
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
        - Workflow
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
        - Workflow
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

  /master-lc/{id}/reject:
    put:
      tags:
        - Workflow
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
        - Workflow
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
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Supplier"

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
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Supplier"

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
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    $ref: "#/components/schemas/Supplier"

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
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  message:
                    type: string

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

  /banks/{id}:
    get:
      tags:
        - Banks
      summary: Get bank details
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
        business_license:
          type: string
        tax_id:
          type: string
        bank_name:
          type: string
        bank_account:
          type: string
        swift_code:
          type: string
        payment_terms:
          type: string
        currency:
          type: string
        status:
          type: string
          enum: [active, inactive]
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

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
        business_license:
          type: string
        tax_id:
          type: string
        bank_name:
          type: string
        bank_account:
          type: string
        swift_code:
          type: string
        payment_terms:
          type: string
        currency:
          type: string
        status:
          type: string
          enum: [active, inactive]
          default: active

    UpdateSupplierRequest:
      type: object
      properties:
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
        business_license:
          type: string
        tax_id:
          type: string
        bank_name:
          type: string
        bank_account:
          type: string
        swift_code:
          type: string
        payment_terms:
          type: string
        currency:
          type: string
        status:
          type: string
          enum: [active, inactive]

    TimelineEntry:
      type: object
      properties:
        id:
          type: integer
        action:
          type: string
        description:
          type: string
        performed_by:
          type: string
        performed_at:
          type: string
          format: date-time
        previous_status:
          type: string
        new_status:
          type: string
        metadata:
          type: object

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
```

**End of OpenAPI Specification**
