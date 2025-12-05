# Feature Specification: Sales Contract Management UI

**Feature Branch**: `001-contract-management-ui`  
**Created**: 2025-12-04  
**Status**: Draft  
**Input**: User description: "Convert UI Screens Into Engineering Requirements - React components, Laravel backend, Contract No validation, Playwright tests"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Contract Dashboard Overview (Priority: P1)

As a contract manager, I need to see an overview of all sales contracts with key metrics so I can quickly assess the current state of all contracts and identify which ones need attention.

**Why this priority**: This is the landing page and primary entry point. Users must be able to see existing data before creating new contracts. Provides immediate value by surfacing critical metrics.

**Independent Test**: Can be fully tested by loading the dashboard page and verifying that summary cards display aggregate data (Total Contracts, Total LC Value, Total Order Qty, Avg B2B %) and the table renders existing contract records with proper formatting.

**Acceptance Scenarios**:

1. **Given** I am logged into the system, **When** I navigate to the Sales Contracts page, **Then** I see four summary cards displaying Total Contracts count, Total LC Value in USD, Total Order Quantity, and Average B2B percentage
2. **Given** contracts exist in the database, **When** the dashboard loads, **Then** I see a table with columns for Buyer Name, Contract No, Amendment Date, Total Orders, Order Quantity, Master LC Value, B2B %, Status badge, and action buttons
3. **Given** the contracts table has data, **When** I view the table, **Then** each row displays accurate data from the backend and status badges are color-coded appropriately
4. **Given** there are more than 10 contracts, **When** I scroll to the bottom of the table, **Then** I see pagination controls allowing me to navigate to additional pages

---

### User Story 2 - Create New Sales Contract (Priority: P1)

As a contract manager, I need to create a new sales contract with validated contract numbers so that all contracts follow the required format and I can ensure data integrity.

**Why this priority**: Core functionality for data entry. Without the ability to create contracts, the system provides no value. Must work immediately for MVP.

**Independent Test**: Can be fully tested by clicking the "Add New Contract" button, filling in all required fields (with auto-generated contract number), saving the form, and verifying the new contract appears in the dashboard table.

**Acceptance Scenarios**:

1. **Given** I am on the Sales Contracts dashboard, **When** I click the "Add New Contract" button, **Then** a modal opens with a form containing fields for Buyer (dropdown), Contract No (auto-filled), Contract Date, Amendment Date, Total Orders, Order Quantity, Total Contract Value (USD), Overall B2B %, Status, and Remarks
2. **Given** the Add Contract modal is open, **When** the form loads, **Then** the Contract No field is automatically populated with the next available number in the format `IIC/AKCL/CON/YYYY/NN` (e.g., `IIC/AKCL/CON/2025/01`)
3. **Given** I have filled in all required fields with valid data, **When** I click "Save", **Then** the system validates the data, creates the contract via the backend API, closes the modal, displays a success message, and refreshes the dashboard to show the new contract
4. **Given** I am filling out the contract form, **When** I manually edit the Contract No field to an invalid format (e.g., missing year or incorrect prefix), **Then** I see an inline error message stating "Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN" and the Save button is disabled
5. **Given** I have entered all form data, **When** I click "Cancel", **Then** the modal closes without saving data and the dashboard remains unchanged

---

### User Story 3 - Search and Filter Contracts (Priority: P2)

As a contract manager, I need to search for specific contracts by buyer name or contract number and filter by status so I can quickly locate contracts without scrolling through the entire list.

**Why this priority**: Enhances usability once multiple contracts exist. Not critical for initial MVP but significantly improves user experience as data volume grows.

**Independent Test**: Can be fully tested by entering text in the search field (buyer name or contract number) and selecting a status filter, then verifying the table updates to show only matching records.

**Acceptance Scenarios**:

1. **Given** I am viewing the contracts dashboard, **When** I type a buyer name in the search field, **Then** the table updates in real-time to show only contracts matching that buyer name
2. **Given** I am viewing the contracts dashboard, **When** I type a contract number in the search field, **Then** the table updates to show only contracts with matching contract numbers
3. **Given** I am viewing the contracts dashboard, **When** I select a status from the filter dropdown (e.g., "Active", "Pending", "Completed"), **Then** the table updates to show only contracts with the selected status
4. **Given** I have applied both search and filter criteria, **When** I clear the search field and reset the filter, **Then** the table displays all contracts again

---

### User Story 4 - View and Edit Existing Contract (Priority: P3)

As a contract manager, I need to view detailed information about a contract and make edits when amendments are needed so I can keep contract data up-to-date.

**Why this priority**: Important for data maintenance but not required for initial MVP. Users can create and view contracts first, then add editing capability in a subsequent iteration.

**Independent Test**: Can be fully tested by clicking the "Show" or "Edit" button on a contract row, viewing the details in a modal or form, making changes, saving, and verifying the updates appear in the dashboard table.

**Acceptance Scenarios**:

1. **Given** I am viewing the contracts table, **When** I click the "Show" action button for a contract, **Then** a modal or detail view opens displaying all contract information in read-only format
2. **Given** I am viewing the contracts table, **When** I click the "Edit" action button for a contract, **Then** a modal opens with the contract form pre-populated with existing data, allowing me to modify fields
3. **Given** I am editing a contract, **When** I change the Amendment Date and click "Save", **Then** the system updates the contract in the database and reflects the change in the dashboard table
4. **Given** I am editing a contract, **When** I attempt to change the Contract No to a number that already exists, **Then** I receive an error message stating "Contract number already exists" and the save is prevented

---

### Edge Cases

- What happens when the Contract No field is manually edited to a valid format but the number already exists in the database? System must display backend validation error "Contract number already exists" and prevent duplicate creation.
- How does the system handle the first contract of a new year (no previous NN exists)? System defaults to NN=01 (e.g., `IIC/AKCL/CON/2026/01`).
- What happens if the backend API is unavailable when loading the dashboard? Display user-friendly error message: "Unable to load contracts. Please try again later."
- How does the system handle leap years or date validation for Contract Date and Amendment Date? Use standard date validation; Amendment Date must be equal to or later than Contract Date.
- What happens when pagination is active and a user searches? Reset to page 1 and apply pagination to filtered results.
- How does the system handle very large B2B percentages (e.g., >100%) or negative values? Frontend validation ensures 0-100 range; backend rejects values outside this range.

## Requirements _(mandatory)_

### Functional Requirements

**Contract Number Management:**

- **FR-001**: System MUST auto-generate contract numbers following the format `IIC/AKCL/CON/YYYY/NN` when the Add Contract modal opens, where YYYY is the current year and NN is a zero-padded 2-digit running number starting at 01 per year
- **FR-002**: System MUST provide an API endpoint `GET /contracts/next-number?year=YYYY` that returns the next available contract number for the specified year by querying the highest NN value and incrementing it
- **FR-003**: System MUST validate contract numbers against the regex pattern `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$` on both frontend (live validation) and backend (API validation)
- **FR-004**: System MUST allow users to manually edit the auto-generated contract number, but only accept values matching the required format
- **FR-005**: System MUST enforce uniqueness of contract numbers at the database level and return a clear error message if a duplicate is attempted
- **FR-006**: System MUST display an inline error message "Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN" when manual edits fail validation

**Dashboard Overview:**

- **FR-007**: System MUST display four summary cards at the top of the dashboard showing: Total Contracts (count), Total LC Value (sum in USD with currency formatting), Total Order Quantity (sum), and Average B2B % (calculated average)
- **FR-008**: System MUST load summary card data from the backend API endpoint `GET /contracts` with aggregation calculations
- **FR-009**: System MUST display a contracts table with columns: Buyer Name, Contract No, Amendment Date, Total Orders, Order Quantity, Master LC Value, B2B %, Status (as color-coded badge), and Actions (Show/Edit buttons)
- **FR-010**: System MUST paginate the contracts table, displaying a configurable number of records per page (default: 10) with controls to navigate between pages

**Contract Creation:**

- **FR-011**: System MUST provide an "Add New Contract" button that opens a modal containing a form with the following fields: Buyer (dropdown populated from database), Contract No (auto-filled, editable), Contract Date (date picker), Amendment Date (date picker), Total Orders (number input), Order Quantity (number input), Total Contract Value in USD (number input), Overall B2B % (percentage input 0-100), Status (dropdown), Remarks (textarea)
- **FR-012**: System MUST mark the following fields as required: Buyer, Contract No, Contract Date, Total Orders, Order Quantity, Total Contract Value, Status
- **FR-013**: System MUST send a POST request to `/contracts` endpoint with all form data when the user clicks "Save"
- **FR-014**: System MUST validate all fields before submission and display inline error messages for validation failures
- **FR-015**: System MUST close the modal and refresh the dashboard table upon successful contract creation, displaying a success toast notification

**Search and Filter:**

- **FR-016**: System MUST provide a search input field that filters contracts by Buyer Name or Contract No in real-time as the user types
- **FR-017**: System MUST provide a status filter dropdown that filters contracts by their status value
- **FR-018**: System MUST allow search and filter criteria to be combined (e.g., search for buyer name AND filter by status)
- **FR-019**: System MUST provide a "Clear" or "Reset" option to remove all search and filter criteria

**Backend API:**

- **FR-020**: System MUST provide a `GET /contracts` endpoint that returns all contracts with summary statistics for the dashboard
- **FR-021**: System MUST provide a `POST /contracts` endpoint that validates and creates new contracts, enforcing all validation rules defined in the Laravel validation rules
- **FR-022**: System MUST provide a `GET /contracts/next-number?year=YYYY` endpoint that calculates and returns the next available contract number for the specified year
- **FR-023**: Backend MUST implement Laravel validation rules for contract creation including: required fields, regex validation for contract_no, uniqueness check for contract_no, numeric validation for quantities and values, percentage range validation (0-100) for B2B %
- **FR-024**: Backend MUST return appropriate HTTP status codes: 200 for success, 201 for resource creation, 400 for validation errors, 404 for not found, 500 for server errors
- **FR-025**: Backend MUST return clear error messages in JSON format for all validation failures, structured as `{ "message": "Error description", "errors": { "field": ["Error detail"] } }`

**Testing:**

- **FR-026**: System MUST include Playwright end-to-end tests covering: dashboard loads successfully, summary cards display data, contract table renders rows, pagination controls work, modal opens and closes, form fields accept input, contract number validation (valid and invalid formats), successful contract creation, search functionality, filter functionality, error handling for invalid data
- **FR-027**: Playwright tests MUST verify that invalid contract number formats are rejected with appropriate error messages before API submission
- **FR-028**: Playwright tests MUST verify that duplicate contract numbers trigger backend validation errors
- **FR-029**: Playwright tests MUST run in CI/CD pipeline before deployment to catch regressions

### Key Entities

- **Contract**: Represents a sales contract with attributes including contract number (unique identifier formatted as IIC/AKCL/CON/YYYY/NN), buyer reference (foreign key to Buyer entity), contract date, amendment date, total number of orders, aggregate order quantity, total contract value in USD, overall B2B percentage, current status, and optional remarks. Contracts must have unique contract numbers and belong to one buyer.

- **Buyer**: Represents a company or individual purchasing entity with attributes including buyer name, contact information, and other relevant buyer details. One buyer can have multiple contracts (one-to-many relationship with Contract entity).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view the dashboard with summary cards and contract table loading within 2 seconds under normal network conditions
- **SC-002**: Users can create a new contract in under 3 minutes by filling out the form with auto-generated contract number and submitting
- **SC-003**: Contract number validation provides immediate feedback (within 300ms) when users manually edit the field
- **SC-004**: 100% of contract numbers created by the system follow the required format `IIC/AKCL/CON/YYYY/NN` and pass regex validation
- **SC-005**: Search functionality returns filtered results within 1 second of user input for datasets up to 1000 contracts
- **SC-006**: Pagination controls allow navigation through contract lists of any size without performance degradation
- **SC-007**: All Playwright end-to-end tests pass successfully, covering layout, validation, and functional workflows
- **SC-008**: Modal animations and interactions maintain 60fps performance and do not block user input
- **SC-009**: Backend API validation prevents 100% of invalid or duplicate contract numbers from being saved to the database
- **SC-010**: Users receive clear, actionable error messages for all validation failures (contract number format, duplicate numbers, required fields, value ranges)

## Scope

**In Scope:**

- React frontend with five components: `ContractsOverview`, `SummaryCard`, `ContractTable`, `AddContractModal`, `ContractForm`
- Tailwind CSS styling matching design specifications with responsive layout
- Laravel backend with RESTful API endpoints: `GET /contracts`, `POST /contracts`, `GET /contracts/next-number`
- Contract number auto-generation logic that queries the database for the highest NN value per year and increments
- Full-stack validation: frontend live validation, backend Laravel validation rules, database uniqueness constraints
- Dashboard with summary cards, searchable/filterable contract table, and pagination
- Add New Contract modal with all specified fields and controlled form inputs
- Playwright end-to-end tests covering layout, validation (valid/invalid patterns), contract creation workflow, search/filter functionality, and error handling
- Error handling with inline validation messages, toast notifications, and backend error responses
- Database schema with Contract and Buyer tables including all specified fields and constraints

**Out of Scope:**

- Edit contract functionality (deferred to User Story 4, Priority P3 - can be added in a future iteration)
- View contract details (read-only modal) (deferred to User Story 4, Priority P3)
- User authentication and authorization (assumed to be handled by existing system or separate feature)
- Bulk import/export of contracts
- Contract approval workflows or multi-step processes
- Historical audit trail or version tracking for contract changes
- Advanced reporting or analytics beyond summary cards
- Email notifications for contract creation or updates
- Mobile-specific UI optimizations (responsive design included, but not native mobile app)
- Integration with external systems (ERP, CRM, etc.)
- Document attachment or file upload for contracts

## Assumptions

- The system already has a Buyer table/entity with existing buyer records that can be loaded into the dropdown
- Users have appropriate permissions to view and create contracts (authentication/authorization is handled separately)
- The backend database supports relational constraints (UNIQUE, FOREIGN KEY, NOT NULL)
- The current year is used for auto-generating contract numbers (no need to select a different year during creation)
- Running numbers (NN) start at 01 each calendar year and increment sequentially
- If no contracts exist for a given year, the first number will be 01 (e.g., IIC/AKCL/CON/2025/01)
- Amendment Date can be equal to or later than Contract Date; the frontend will provide basic date validation
- B2B percentage is a whole number or decimal between 0 and 100 (inclusive)
- Status values are predefined in the backend (e.g., "Draft", "Active", "Pending", "Completed", "Cancelled")
- Currency for Total Contract Value is always USD (no currency conversion needed)
- The system uses a modern browser with JavaScript enabled (Chrome, Firefox, Safari, Edge)
- API responses return JSON format
- The React frontend uses functional components with hooks (not class components)
- Tailwind CSS is already configured in the React project
- Laravel version is 9.x or higher with built-in validation support
- Playwright tests run in a dedicated test environment with a seeded database
- Network latency for API calls is within normal range (< 500ms for most requests)
- The database can handle up to 10,000 contracts without significant performance degradation (pagination helps with this)
- Toast notifications are implemented using an existing notification library or custom component
- The "Show" and "Edit" actions in the table are placeholder buttons for future functionality (initially non-functional or showing "Coming Soon" message)
