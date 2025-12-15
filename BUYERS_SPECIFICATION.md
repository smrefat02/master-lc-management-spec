# Buyers Module - Technical Specification

**Project:** LC Management System  
**Module:** Buyers Management  
**Version:** 1.0.0  
**Date:** December 11, 2025  
**Status:** 📋 Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [UI Specification](#ui-specification)
4. [Field Definitions](#field-definitions)
5. [Validation Rules](#validation-rules)
6. [API Specification](#api-specification)
7. [Error Handling](#error-handling)
8. [Edge Cases](#edge-cases)

---

## 🎯 Overview

The Buyers module manages buyer/customer records within the LC Management System. Buyers are standalone entities that can be linked to Contracts and Master LCs. This specification covers all functional requirements, API endpoints, validation rules, and UI components.

**Key Features:**

- View paginated list of buyers with search and filter
- Create new buyer via modal form
- Edit existing buyer via modal form
- Search by name, code, country, or email
- Filter by status (active/inactive)
- Status displayed as color-coded badges
- Unique code and email validation
- Modal-based CRUD operations (no separate pages)

---

## 📖 User Stories

### US-001: View Buyers List

**As a** trade finance user  
**I want to** see a list of all buyers with search and filter options  
**So that I** can quickly find and manage buyer records

**Acceptance Criteria:**

- [ ] List page displays all buyers in a table
- [ ] Table columns: Name, Code, Country, Contact Person, Email, Phone, Status, Action
- [ ] Search bar filters by name, code, country, or email (partial match)
- [ ] Status dropdown filters by: All status, active, inactive
- [ ] Pagination shows 10/20 items per page
- [ ] Total count displayed: "X / Y buyers shown"
- [ ] "+ Add New Buyer" button visible in header
- [ ] Status shown as colored badge (green=active, red=inactive)
- [ ] Edit button in Action column opens edit modal

---

### US-002: Add New Buyer

**As a** trade finance user  
**I want to** add a new buyer via a modal form  
**So that I** can register new customers in the system

**Acceptance Criteria:**

- [ ] "+ Add New Buyer" button opens modal
- [ ] Modal title: "Add New Buyer"
- [ ] Form fields: Buyer Name*, Code*, Contact Person, Email, Phone, Country, Address, Status\*
- [ ] Buyer Name is required
- [ ] Code is required and must be unique
- [ ] Status dropdown defaults to "active"
- [ ] Cancel button closes modal without saving
- [ ] Save button validates and submits form
- [ ] Success: Modal closes, list refreshes, success toast shown
- [ ] Error: Validation errors shown inline under fields

---

### US-003: Edit Buyer

**As a** trade finance user  
**I want to** edit an existing buyer via a modal form  
**So that I** can update customer information

**Acceptance Criteria:**

- [ ] Edit button opens modal with prefilled data
- [ ] Modal title: "Edit Buyer"
- [ ] All fields editable
- [ ] Code uniqueness validated (excluding current record)
- [ ] Cancel button closes modal without saving
- [ ] Save button validates and submits form
- [ ] Success: Modal closes, list refreshes with updated data
- [ ] Error: Validation errors shown inline

---

### US-004: Search Buyers

**As a** trade finance user  
**I want to** search buyers by multiple fields  
**So that I** can quickly find specific customers

**Acceptance Criteria:**

- [ ] Search input with placeholder: "Search name / code / country / email"
- [ ] Search triggers on Enter key or button click
- [ ] Partial match supported (contains)
- [ ] Case-insensitive search
- [ ] Results update table immediately
- [ ] Empty search returns all records
- [ ] Search works with status filter combined

---

### US-005: Filter by Status

**As a** trade finance user  
**I want to** filter buyers by their status  
**So that I** can view only active or inactive customers

**Acceptance Criteria:**

- [ ] Status dropdown with options: "All status", "active", "inactive"
- [ ] Default selection: "All status"
- [ ] Filter applies immediately on change
- [ ] Filter works with search combined
- [ ] Pagination resets to page 1 on filter change

---

## 🎨 UI Specification

### Buyers List Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LC Management                                          [User] [Viewer] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Buyers                                        [+ Add New Buyer] │   │
│  │ Manage all buyer/customer records                               │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ [🔍 Search name / code / country / email    ] [All status ▼]   │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ Name    │ Code  │ Country │ Contact  │ Email      │ Phone  │...│   │
│  ├─────────┼───────┼─────────┼──────────┼────────────┼────────┼───┤   │
│  │ ABC Co  │ ABC01 │ USA     │ John Doe │ j@abc.com  │ +1...  │...│   │
│  │ XYZ Ltd │ XYZ01 │ UK      │ Jane Doe │ j@xyz.com  │ +44... │...│   │
│  │ ...     │ ...   │ ...     │ ...      │ ...        │ ...    │...│   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ← Previous  [1] [2] [3]  Next →       10 / 25 buyers shown     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Table Columns Specification

| Column         | Width | Alignment | Content             |
| -------------- | ----- | --------- | ------------------- |
| Name           | 20%   | Left      | Buyer name (text)   |
| Code           | 10%   | Left      | Unique code (text)  |
| Country        | 12%   | Left      | Country name (text) |
| Contact Person | 15%   | Left      | Contact person name |
| Email          | 18%   | Left      | Email address       |
| Phone          | 12%   | Left      | Phone number        |
| Status         | 8%    | Center    | Badge (green/red)   |
| Action         | 5%    | Center    | Edit button         |

### Status Badge Styling

| Status   | Background    | Text Color       | Border             |
| -------- | ------------- | ---------------- | ------------------ |
| active   | `bg-green-50` | `text-green-700` | `border-green-200` |
| inactive | `bg-red-50`   | `text-red-700`   | `border-red-200`   |

### Add/Edit Buyer Modal Layout

```
┌──────────────────────────────────────────────────────────┐
│ Add New Buyer                                       [✕] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Buyer Name *                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Code *                        Contact Person            │
│  ┌────────────────────┐       ┌────────────────────┐    │
│  │                    │       │                    │    │
│  └────────────────────┘       └────────────────────┘    │
│                                                          │
│  Email                         Phone                     │
│  ┌────────────────────┐       ┌────────────────────┐    │
│  │                    │       │                    │    │
│  └────────────────────┘       └────────────────────┘    │
│                                                          │
│  Country                       Status *                  │
│  ┌────────────────────┐       ┌────────────────────┐    │
│  │                    │       │ active         ▼   │    │
│  └────────────────────┘       └────────────────────┘    │
│                                                          │
│  Address                                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                              [Cancel]  [Save Buyer]     │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Field Definitions

### Buyer Fields

| Field          | Type   | Required | Max Length | Validation           | Default |
| -------------- | ------ | -------- | ---------- | -------------------- | ------- |
| name           | String | Yes      | 255        | Not empty            | -       |
| code           | String | Yes      | 50         | Unique, alphanumeric | -       |
| contact_person | String | No       | 255        | -                    | null    |
| email          | String | No       | 255        | Valid email format   | null    |
| phone          | String | No       | 50         | -                    | null    |
| country        | String | No       | 100        | -                    | null    |
| address        | Text   | No       | 1000       | -                    | null    |
| status         | Enum   | Yes      | -          | active, inactive     | active  |

---

## ✅ Validation Rules

### Create Buyer Validation

```php
[
    'name' => 'required|string|max:255',
    'code' => 'required|string|max:50|unique:buyers,code',
    'contact_person' => 'nullable|string|max:255',
    'email' => 'nullable|email|max:255',
    'phone' => 'nullable|string|max:50',
    'country' => 'nullable|string|max:100',
    'address' => 'nullable|string|max:1000',
    'status' => 'required|in:active,inactive',
]
```

### Update Buyer Validation

```php
[
    'name' => 'required|string|max:255',
    'code' => 'required|string|max:50|unique:buyers,code,' . $id,
    'contact_person' => 'nullable|string|max:255',
    'email' => 'nullable|email|max:255',
    'phone' => 'nullable|string|max:50',
    'country' => 'nullable|string|max:100',
    'address' => 'nullable|string|max:1000',
    'status' => 'required|in:active,inactive',
]
```

### Validation Error Messages

| Field  | Rule     | Message                               |
| ------ | -------- | ------------------------------------- |
| name   | required | "Buyer name is required."             |
| code   | required | "Code is required."                   |
| code   | unique   | "This code already exists."           |
| email  | email    | "Please enter a valid email address." |
| status | required | "Status is required."                 |
| status | in       | "Status must be active or inactive."  |

---

## 🔌 API Specification

### GET /api/buyers

**Description:** List all buyers with search, filter, and pagination.

**Query Parameters:**

| Parameter  | Type    | Required | Description                          |
| ---------- | ------- | -------- | ------------------------------------ |
| search     | string  | No       | Search in name, code, country, email |
| status     | string  | No       | Filter by status (active/inactive)   |
| page       | integer | No       | Page number (default: 1)             |
| per_page   | integer | No       | Items per page (default: 10)         |
| sort_by    | string  | No       | Sort column (default: name)          |
| sort_order | string  | No       | asc or desc (default: asc)           |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ABC Trading Co.",
      "code": "ABC01",
      "contact_person": "John Smith",
      "email": "john@abctrading.com",
      "phone": "+1-555-0123",
      "country": "USA",
      "address": "123 Trade Street, New York, NY 10001",
      "status": "active",
      "created_at": "2025-12-01T10:30:00.000000Z",
      "updated_at": "2025-12-01T10:30:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 25,
    "last_page": 3
  }
}
```

---

### POST /api/buyers

**Description:** Create a new buyer.

**Request Body:**

```json
{
  "name": "ABC Trading Co.",
  "code": "ABC01",
  "contact_person": "John Smith",
  "email": "john@abctrading.com",
  "phone": "+1-555-0123",
  "country": "USA",
  "address": "123 Trade Street, New York, NY 10001",
  "status": "active"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Buyer created successfully",
  "data": {
    "id": 1,
    "name": "ABC Trading Co.",
    "code": "ABC01",
    "contact_person": "John Smith",
    "email": "john@abctrading.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Trade Street, New York, NY 10001",
    "status": "active",
    "created_at": "2025-12-11T10:30:00.000000Z",
    "updated_at": "2025-12-11T10:30:00.000000Z"
  }
}
```

**Response (422 - Validation Error):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Buyer name is required."],
    "code": ["This code already exists."]
  }
}
```

---

### GET /api/buyers/{id}

**Description:** Get a single buyer by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ABC Trading Co.",
    "code": "ABC01",
    "contact_person": "John Smith",
    "email": "john@abctrading.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Trade Street, New York, NY 10001",
    "status": "active",
    "created_at": "2025-12-01T10:30:00.000000Z",
    "updated_at": "2025-12-01T10:30:00.000000Z"
  }
}
```

**Response (404):**

```json
{
  "success": false,
  "message": "Buyer not found"
}
```

---

### PUT /api/buyers/{id}

**Description:** Update an existing buyer.

**Request Body:**

```json
{
  "name": "ABC Trading Corporation",
  "code": "ABC01",
  "contact_person": "John Smith Jr.",
  "email": "john.jr@abctrading.com",
  "phone": "+1-555-0124",
  "country": "USA",
  "address": "456 Commerce Ave, New York, NY 10002",
  "status": "active"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Buyer updated successfully",
  "data": {
    "id": 1,
    "name": "ABC Trading Corporation",
    "code": "ABC01",
    "contact_person": "John Smith Jr.",
    "email": "john.jr@abctrading.com",
    "phone": "+1-555-0124",
    "country": "USA",
    "address": "456 Commerce Ave, New York, NY 10002",
    "status": "active",
    "created_at": "2025-12-01T10:30:00.000000Z",
    "updated_at": "2025-12-11T14:45:00.000000Z"
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning               | Usage               |
| ---- | --------------------- | ------------------- |
| 200  | OK                    | Successful GET, PUT |
| 201  | Created               | Successful POST     |
| 400  | Bad Request           | Malformed request   |
| 404  | Not Found             | Buyer not found     |
| 422  | Unprocessable Entity  | Validation errors   |
| 500  | Internal Server Error | Server error        |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

---

## 🔄 Edge Cases

### EC-001: Duplicate Code on Create

**Scenario:** User tries to create buyer with existing code.  
**Expected:** 422 error with message "This code already exists."

### EC-002: Duplicate Code on Update

**Scenario:** User updates buyer code to match another buyer's code.  
**Expected:** 422 error with message "This code already exists."

### EC-003: Empty Search

**Scenario:** User clears search input.  
**Expected:** All buyers returned (respecting current filter).

### EC-004: No Results Found

**Scenario:** Search/filter returns no buyers.  
**Expected:** Empty table with message "No buyers found."

### EC-005: Invalid Email Format

**Scenario:** User enters invalid email format.  
**Expected:** 422 error with message "Please enter a valid email address."

### EC-006: Special Characters in Code

**Scenario:** User enters special characters in code field.  
**Expected:** Accept alphanumeric and common symbols (-, \_).

### EC-007: Long Address Text

**Scenario:** User enters very long address.  
**Expected:** Accept up to 1000 characters, truncate display if needed.

### EC-008: Pagination Beyond Last Page

**Scenario:** User navigates to page beyond available pages.  
**Expected:** Return last page of results.

### EC-009: Concurrent Edit

**Scenario:** Two users edit same buyer simultaneously.  
**Expected:** Last save wins, no data corruption.

### EC-010: Modal Close Without Save

**Scenario:** User fills form then clicks Cancel or X.  
**Expected:** Modal closes, no data saved, form resets.

---

**End of Specification Document**
