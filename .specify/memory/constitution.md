<!--
SYNC IMPACT REPORT
==================
Version Change: 1.1.0 → 1.2.0
Change Type: MINOR - Added API Documentation (OpenAPI/Swagger) Principle
Date: 2025-12-08

Principles Modified:
- Added VIII. API Documentation (OpenAPI/Swagger) (NEW)
- Updated Technology Stack to include L5-Swagger
- Enhanced API Endpoints requirements with documentation mandate
- Updated Constitution Compliance Checklist

Principles Defined:
- I. Contract Number Format Enforcement (STRICT)
- II. Full-Stack Validation
- III. Component Modularity
- IV. End-to-End Testing (Playwright)
- V. Clean Architecture & Maintainability
- VI. Interactive UI Elements
- VII. Modal Management & State
- VIII. API Documentation (OpenAPI/Swagger) (NEW)

Implementation Status:
✅ darkaonline/l5-swagger ^8.6 installed
✅ All controllers annotated with @OA\ documentation
✅ Swagger UI accessible at /api/documentation
✅ Complete OpenAPI 3.0 schemas for Contract, Buyer, Pagination, Summary
✅ All 6 endpoints fully documented (GET/POST/PUT contracts, GET buyers)

Templates Status:
✅ plan-template.md - Aligned
✅ spec-template.md - Aligned
✅ tasks-template.md - Aligned
✅ All runtime fixes documented

Follow-up TODOs: None
-->

# LC Management System Constitution

## Core Principles

### I. Contract Number Format Enforcement (STRICT)

**MUST enforce the contract number format pattern across all layers:**

- **Format**: `ERT/AKCL/CON/YYYY/NN` (where YYYY = 4-digit year, NN = 2-digit running number per year starting at 01)
- **Validation Regex**: `^ERT\/AKCL\/CON\/\d{4}\/\d{2}$`
- Backend MUST validate and auto-generate contract numbers following this format
- Frontend MUST validate contract numbers before submission (pre-flight validation)
- Database MUST enforce uniqueness constraints on contract numbers
- Playwright tests MUST include both valid and invalid pattern test cases

**Rationale**: Contract number format is a business-critical requirement. Inconsistent formats would break reporting, auditing, and legal compliance. Multi-layer enforcement prevents data corruption at any entry point.

### II. Full-Stack Validation

**MUST implement validation at every system boundary:**

- Backend API endpoints MUST validate all incoming requests using Laravel validation rules
- Frontend forms MUST validate user input before submission to provide immediate feedback
- Database schema MUST enforce constraints (NOT NULL, UNIQUE, FOREIGN KEY) where applicable
- All validation errors MUST return clear, actionable error messages to users

**Rationale**: Defense in depth prevents invalid data from entering the system at any layer. User experience requires immediate frontend feedback, while backend validation prevents malicious or buggy clients from corrupting data.

### III. Component Modularity

**MUST structure frontend code as reusable, single-responsibility components:**

- Each component has one clear purpose (e.g., `ContractTable` displays contracts, does not handle API calls directly)
- Components MUST be testable in isolation
- Shared UI patterns (cards, modals, tables) MUST be extracted as reusable components
- Required components for this system:
  - `ContractsOverview` (page container)
  - `SummaryCard` (metric display)
  - `ContractTable` (data table with pagination)
  - `AddContractModal` (modal container)
  - `ContractForm` (form inputs & validation)

**Rationale**: Modular components improve testability, maintainability, and enable reuse across the application. Single-responsibility components are easier to debug and modify without unintended side effects.

### IV. End-to-End Testing (Playwright)

**MUST include Playwright tests covering critical user workflows:**

- Layout and navigation tests (dashboard loads, modal opens/closes)
- Form validation tests (contract number format, required fields)
- Functional workflow tests (create contract, search/filter, pagination)
- Test both happy paths and error scenarios
- Tests MUST run in CI/CD pipeline before deployment

**Rationale**: Unit tests verify individual components, but only end-to-end tests verify the complete user experience. Playwright tests catch integration issues, UI regressions, and ensure business workflows function correctly across the entire stack.

### V. Clean Architecture & Maintainability

**MUST follow clean code and architecture principles:**

- Use Tailwind CSS for consistent, utility-first styling (no custom CSS unless necessary)
- Laravel API endpoints follow RESTful conventions and resource controllers
- Code MUST be readable and self-documenting (clear variable names, logical structure)
- Follow React best practices (hooks, functional components, proper state management)
- Separate concerns: UI components, business logic, API communication, data models

**Rationale**: Clean architecture reduces technical debt, accelerates feature development, and makes the codebase accessible to new developers. Consistent patterns reduce cognitive load and prevent bugs.

### VI. Interactive UI Elements

**ALL UI buttons and interactive elements MUST be fully functional, never static or placeholder:**

- "Add New Contract" button MUST open a working modal with auto-generated contract number
- "Show" button MUST open a modal/drawer displaying full contract details via `GET /api/contracts/{id}`
- "Edit" button MUST open a pre-filled modal loading data via `GET /api/contracts/{id}` and updating via `PUT /api/contracts/{id}`
- After any create/update/delete action, the contract list MUST refresh automatically
- No button may be disabled or non-functional in production code
- All modals MUST support proper open/close state management and onSubmit callbacks

**Rationale**: Users expect all visible UI elements to be functional. Static or placeholder buttons create confusion, frustration, and erode trust. Full functionality ensures the system meets business requirements and provides a professional user experience.

### VII. Modal Management & State

**MUST implement proper modal lifecycle and state management:**

- Each modal type (Add, Show, Edit) MUST have:
  - `open()` function to display modal
  - `close()` function to hide modal
  - `onSubmit()` callback to handle form submission
  - Proper cleanup on close (reset form state, clear errors)
- ContractsOverview page MUST manage:
  - `openCreateModal()` - opens empty form for new contract
  - `openShowModal(contractId)` - fetches and displays contract details
  - `openEditModal(contractId)` - fetches contract data and opens edit form
  - `refreshList()` - reloads contract list after mutations
- ContractForm MUST support:
  - **Create mode**: Empty form with auto-generated contract number
  - **Edit mode**: Pre-populated form with disabled contract number field
  - Mode detection via props or context
- Modal state MUST NOT leak between opens (each open starts fresh)

**Rationale**: Proper modal management prevents state bugs, memory leaks, and UI glitches. Clear lifecycle management ensures predictable behavior and maintainability. Supporting both create and edit modes in a single form component reduces code duplication.

### VIII. API Documentation (OpenAPI/Swagger)

**ALL backend API endpoints MUST be documented using OpenAPI 3.0 annotations:**

- Every controller method MUST include complete `@OA\` annotations with:
  - Operation summary and description
  - All parameters (path, query, body) with types, validation rules, and examples
  - Request body schemas for POST/PUT endpoints
  - Response schemas for all status codes (200, 201, 400, 404, 422, 500)
  - Tags for logical grouping of endpoints
- Schema definitions MUST be defined once and reused via `$ref` references
- Swagger UI MUST be accessible at `/api/documentation` for live API testing
- Documentation MUST be regenerated via `php artisan l5-swagger:generate` after any API changes
- All validation rules, formats, and constraints MUST be reflected in OpenAPI schemas

**Required Annotations:**

- **Controller**: `@OA\Info` with API title, version, description, contact
- **Routes**: `@OA\Server` definitions for development/production
- **Models**: `@OA\Schema` for all data transfer objects (Contract, Buyer, Pagination, Summary)
- **Endpoints**: `@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Delete` with complete metadata
- **Validation**: `@OA\Property` with type, format, pattern, minimum, maximum, enum, required
- **Errors**: `@OA\Response` for ValidationError (422) and ErrorResponse (404, 500)

**Rationale**: OpenAPI documentation serves as the single source of truth for API contracts. It enables frontend developers to understand API behavior without reading backend code, supports automated client generation, facilitates API testing via Swagger UI, and prevents API breaking changes by making contracts explicit. Complete, accurate documentation reduces integration bugs and accelerates development velocity.

## Technical Standards

### Technology Stack

- **Frontend**: React 18+ with Vite, Tailwind CSS v4, Axios for API calls
- **Backend**: Laravel 12 with RESTful API design and resource controllers
- **API Documentation**: L5-Swagger (darkaonline/l5-swagger) for OpenAPI 3.0 documentation
- **Testing**: Playwright for end-to-end tests, PHPUnit for backend tests
- **Database**: MySQL/MariaDB with foreign keys and constraints

### Required API Endpoints

**Contracts API:**

- `GET /api/contracts` - List contracts with pagination, search, and filters
- `GET /api/contracts/{id}` - Retrieve single contract with buyer details (MANDATORY for Show & Edit)
- `POST /api/contracts` - Create new contract with validation
- `PUT /api/contracts/{id}` - Update existing contract (MANDATORY for Edit functionality)
- `GET /api/contracts/next-number?year={year}` - Get next available contract number

**Buyers API:**

- `GET /api/buyers` - List all buyers for dropdown selection

**All endpoints MUST:**

- Return proper HTTP status codes (200, 201, 400, 404, 422, 500)
- Include validation errors in consistent format
- Support CORS for frontend access
- Return JSON responses with appropriate headers
- Be fully documented with OpenAPI 3.0 annotations
- Be testable via Swagger UI at `/api/documentation`

### Required React Components

**Pages:**

- `ContractsOverview` - Main dashboard page managing all modals and state

**Modals:**

- `AddContractModal` - Modal for creating new contracts
- `ShowContractModal` - Read-only modal displaying contract details
- `EditContractModal` - Modal for editing existing contracts

**Shared Components:**

- `ContractForm` - Reusable form supporting both create and edit modes
- `SummaryCard` - Metric display cards for dashboard
- `ContractTable` - Data table with Show/Edit buttons per row
- `Pagination` - Pagination controls for contract list

**All modals MUST:**

- Support controlled open/close state
- Fetch data when opened (for Show/Edit)
- Refresh parent list on successful submission
- Handle loading and error states
- Provide clear user feedback

### Required Features (Implementation Complete)

**Dashboard (Contracts Overview):**

- ✅ Summary cards displaying: Total Contracts, Total LC Value, Total Order Qty, Avg B2B %
- ✅ Search functionality: Buyer name or Contract No
- ✅ Filter functionality: Status (draft, active, completed, cancelled)
- ✅ Data table with columns: Buyer Name, Contract No, Amendment Date, Total Orders, Order Quantity, Master LC Value, B2B %, Status Badge
- ✅ Actions column with Show & Edit buttons (both fully functional)
- ✅ Pagination controls (15 records per page)

**Add New Contract (Fully Functional):**

- ✅ Opens modal with auto-generated contract number (editable)
- ✅ Fields: Buyer (dropdown), Contract No, Contract Date, Amendment Date, Total Orders, Order Quantity, Total Contract Value (USD), Overall B2B %, Status, Remarks
- ✅ Frontend validation before submission
- ✅ Backend validation with clear error messages
- ✅ List refreshes after successful creation

**Show Contract Details (Fully Functional):**

- ✅ Opens modal displaying all contract fields in read-only format
- ✅ Fetches data via `GET /api/contracts/{id}`
- ✅ Shows buyer contact information
- ✅ Proper loading and error states

**Edit Contract (Fully Functional):**

- ✅ Opens modal with pre-populated form
- ✅ Fetches current data via `GET /api/contracts/{id}`
- ✅ Contract number field disabled (cannot be changed)
- ✅ All other fields editable
- ✅ Updates via `PUT /api/contracts/{id}`
- ✅ List refreshes after successful update
- ✅ Validation enforced (frontend and backend)

### Performance & UX Standards

- Form validation feedback MUST appear within 300ms of user input
- Dashboard data loads MUST complete within 2 seconds under normal conditions
- Modal animations MUST be smooth (60fps) and not block user interaction
- API responses MUST include appropriate HTTP status codes and error messages

## Development Workflow

### Feature Development Process

1. **Specification**: Create detailed feature spec using `.specify/templates/spec-template.md`
2. **Planning**: Generate implementation plan using `/speckit.plan` command
3. **Task Breakdown**: Create task list using `/speckit.tasks` command, organized by user story
4. **Implementation**: Build features incrementally, one user story at a time (P1 → P2 → P3...)
5. **Testing**: Write and execute Playwright tests for each completed user story
6. **Review**: Verify compliance with all constitutional principles before merging

### Constitution Compliance Checks

Before completing any feature:

- [ ] Contract number validation enforced at frontend, backend, and database layers
- [ ] All API endpoints include input validation and return proper error messages
- [ ] All API endpoints documented with complete OpenAPI 3.0 annotations
- [ ] Swagger UI accessible at `/api/documentation` with working examples
- [ ] Components are modular, single-purpose, and reusable
- [ ] Playwright tests cover layout, validation, and functional workflows
- [ ] Code follows clean architecture principles and uses Tailwind CSS consistently
- [ ] All UI buttons are fully functional (no static/placeholder buttons)
- [ ] Show button fetches and displays contract details via API
- [ ] Edit button fetches data, allows editing, and updates via API
- [ ] All modals support proper open/close/submit lifecycle
- [ ] Contract list refreshes after create/update/delete operations

## Governance

This constitution supersedes all other development practices and guidelines. All implementation decisions MUST align with these core principles.

**Amendment Process:**

- Amendments require documentation of rationale and impact analysis
- Version number MUST be incremented following semantic versioning:
  - **MAJOR**: Backward-incompatible principle removals or redefinitions
  - **MINOR**: New principles added or existing principles materially expanded
  - **PATCH**: Clarifications, wording improvements, non-semantic refinements
- All dependent templates and documentation MUST be updated to reflect amendments
- Sync Impact Report MUST be included in the constitution file after amendments

**Compliance Review:**

- All pull requests MUST verify compliance with constitutional principles
- Any deviations MUST be explicitly justified and approved
- Feature specifications MUST include constitution compliance checklist

**Related Documentation:**

- Feature specifications: `.specify/templates/spec-template.md`
- Implementation plans: `.specify/templates/plan-template.md`
- Task lists: `.specify/templates/tasks-template.md`

**Version**: 1.2.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-08

---

## Implementation Notes

### Critical Runtime Fixes (2025-12-05)

During initial deployment, the following issues were identified and resolved:

1. **Laravel 12 API Route Registration**:

   - Issue: API routes not automatically registered (breaking change from Laravel 11)
   - Fix: Added `api: __DIR__.'/../routes/api.php'` to `bootstrap/app.php` withRouting() method
   - Impact: All API endpoints now accessible

2. **CORS Configuration**:

   - Issue: Frontend (port 5174) blocked by CORS
   - Fix: Added port 5174 to allowed origins in `config/cors.php`
   - Config: `supports_credentials: true` for future Sanctum integration

3. **Axios withCredentials**:

   - Issue: CORS errors when credentials enabled without Sanctum
   - Fix: Temporarily disabled `withCredentials` in axios config
   - Future: Re-enable when implementing authentication

4. **API Function Signatures**:

   - Issue: `getContracts()` expected individual params but received object
   - Fix: Updated to accept params object `{page, per_page, search, status}`
   - Impact: Search and filter functionality now working

5. **Import Statement Mismatch**:

   - Issue: EditContractModal used default import for named export
   - Fix: Changed to `import { ContractForm } from "./ContractForm"`

6. **Tailwind CSS v4 PostCSS**:
   - Issue: Direct tailwindcss plugin no longer supported
   - Fix: Installed `@tailwindcss/postcss` package and updated config

These fixes ensure all constitutional principles are upheld in the deployed application.
