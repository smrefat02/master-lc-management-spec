# Implementation Plan: Sales Contract Management UI

**Branch**: `001-contract-management-ui` | **Date**: 2025-12-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-contract-management-ui/spec.md`

## Summary

Build a full-stack sales contract management system with React frontend, Laravel backend, and Playwright E2E tests. The system enables contract managers to view contract dashboards with summary metrics, create new contracts with auto-generated contract numbers following strict format validation (`IIC/AKCL/CON/YYYY/NN`), and search/filter contracts. Core value delivery: Multi-layer validation ensures data integrity, modular React components enable rapid development, and comprehensive E2E testing prevents regressions.

**Technical Approach**: Web application architecture with React frontend communicating via REST API with Laravel backend. Contract number generation uses database queries to find the highest running number per year and auto-increments. Validation enforced at three layers (frontend regex, backend Laravel rules, database constraints) per constitutional requirements.

## Technical Context

**Language/Version**:

- Frontend: JavaScript/TypeScript with React 18+
- Backend: PHP 8.1+ with Laravel 9.x or 10.x

**Primary Dependencies**:

- Frontend: React 18+, Tailwind CSS 3+, Axios (HTTP client), React Hook Form or native state management
- Backend: Laravel 9.x/10.x, Laravel Sanctum (CORS/API tokens), L5-Swagger (darkaonline/l5-swagger) for OpenAPI documentation, MySQL/PostgreSQL driver
- Testing: Playwright for E2E testing, Laravel's built-in testing tools (PHPUnit)

**Storage**:

- Relational database (MySQL 8+ or PostgreSQL 13+)
- Tables: `contracts`, `buyers` with foreign key relationships
- Constraints: UNIQUE on contract_no, NOT NULL on required fields, CHECK constraints for B2B percentage (0-100)

**Testing**:

- Frontend: Playwright for E2E tests (layout, validation, workflows)
- Backend: PHPUnit for unit tests, Laravel HTTP tests for API endpoints
- Test database seeding for consistent test data

**Target Platform**:

- Web browsers (Chrome, Firefox, Safari, Edge - modern versions)
- Server: Linux/Unix-based web server with PHP and database support
- Development: Local development environment (Laravel Valet, Laragon, Docker, etc.)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:

- Dashboard load time: < 2 seconds for initial page load with up to 1000 contracts
- API response time: < 500ms for GET requests, < 1000ms for POST requests
- Contract number validation feedback: < 300ms from user input to display
- Modal animations: 60fps (16.67ms per frame)
- Search/filter: < 1 second response time for datasets up to 1000 contracts

**Constraints**:

- Contract number format MUST match `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$` (strict requirement)
- No duplicate contract numbers allowed (enforced at database level)
- B2B percentage constrained to 0-100 range
- Amendment Date must be >= Contract Date
- All validation errors must return user-friendly messages
- Modal must not block UI rendering during animations

**Scale/Scope**:

- Expected users: 10-50 concurrent contract managers
- Initial dataset: Up to 10,000 contracts
- Components: 5 React components (ContractsOverview, SummaryCard, ContractTable, AddContractModal, ContractForm)
- API endpoints: 3 primary endpoints (GET /contracts, POST /contracts, GET /contracts/next-number)
- Test coverage: 10+ Playwright E2E test scenarios

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Principle I: Contract Number Format Enforcement (STRICT)

**Compliance**: PASS

- ✅ FR-001: Auto-generation follows `IIC/AKCL/CON/YYYY/NN` format
- ✅ FR-003: Frontend live validation using `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$` regex
- ✅ FR-003: Backend Laravel validation using same regex
- ✅ FR-005: Database UNIQUE constraint on contract_no column
- ✅ FR-027, FR-028: Playwright tests for valid/invalid patterns and duplicates

**Evidence**: All functional requirements explicitly mandate multi-layer enforcement. No violations detected.

### ✅ Principle II: Full-Stack Validation

**Compliance**: PASS

- ✅ FR-003, FR-014: Frontend validation before submission with inline error messages
- ✅ FR-023: Backend Laravel validation rules (required, regex, unique, numeric, range)
- ✅ FR-024, FR-025: Backend returns structured error responses with HTTP status codes
- ✅ Database constraints: UNIQUE, NOT NULL, CHECK (implied by backend validation)

**Evidence**: Defense-in-depth validation specified at all system boundaries. No violations detected.

### ✅ Principle III: Component Modularity

**Compliance**: PASS

- ✅ ContractsOverview: Page container (single responsibility: orchestrate child components)
- ✅ SummaryCard: Metric display (single responsibility: render summary statistics)
- ✅ ContractTable: Data table (single responsibility: display and paginate contract rows)
- ✅ AddContractModal: Modal container (single responsibility: manage modal state)
- ✅ ContractForm: Form inputs (single responsibility: handle form state and validation)

**Evidence**: Five components defined with clear, single responsibilities. Each testable in isolation. No violations detected.

### ✅ Principle IV: End-to-End Testing (Playwright)

**Compliance**: PASS

- ✅ FR-026: Comprehensive Playwright test coverage specified
  - Layout tests: dashboard loads, modal opens/closes
  - Validation tests: contract number patterns (valid/invalid)
  - Functional tests: contract creation, search/filter, pagination
  - Error handling: invalid data, backend errors
- ✅ FR-027: Invalid format rejection tests
- ✅ FR-028: Duplicate number validation tests
- ✅ FR-029: CI/CD integration required

**Evidence**: End-to-end testing coverage explicitly mandated for all critical workflows. No violations detected.

### ✅ Principle V: Clean Architecture & Maintainability

**Compliance**: PASS

- ✅ Tailwind CSS for utility-first styling (FR-011, Scope section)
- ✅ Laravel RESTful conventions (FR-020, FR-021, FR-022)
- ✅ React functional components with hooks (Assumptions section)
- ✅ Separation of concerns: UI components, API communication, business logic, data models
- ✅ Clear naming conventions: components match their purpose

**Evidence**: Clean architecture principles embedded throughout specification. No violations detected.

### Gate Status: ✅ ALL PRINCIPLES SATISFIED - PROCEED TO PHASE 0

No constitutional violations detected. All core principles have corresponding functional requirements. No complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-contract-management-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-endpoints.yaml         # OpenAPI spec for REST endpoints
│   └── contract-number.schema.json # JSON schema for contract number format
├── checklists/
│   └── requirements.md  # Quality checklist (already created)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── ContractController.php    # index, store, show, update, nextNumber
│   │   ├── Requests/
│   │   │   ├── StoreContractRequest.php  # Form request validation
│   │   │   └── UpdateContractRequest.php
│   │   └── Resources/
│   │       └── ContractResource.php      # API response transformation
│   ├── Models/
│   │   ├── Contract.php                  # Eloquent model
│   │   └── Buyer.php                     # Eloquent model
│   └── Services/
│       └── ContractNumberService.php     # Contract number generation logic
├── database/
│   ├── migrations/
│   │   ├── xxxx_create_buyers_table.php
│   │   ├── xxxx_create_contracts_table.php
│   │   └── xxxx_add_contract_indexes.php
│   ├── factories/
│   │   ├── BuyerFactory.php
│   │   └── ContractFactory.php
│   └── seeders/
│       ├── BuyerSeeder.php
│       └── ContractSeeder.php
├── routes/
│   └── api.php                           # API route definitions
├── tests/
│   ├── Feature/
│   │   ├── ContractApiTest.php           # API endpoint tests
│   │   └── ContractNumberGenerationTest.php
│   └── Unit/
│       └── ContractNumberServiceTest.php
└── config/
    ├── cors.php                          # CORS configuration
    └── sanctum.php                       # API token configuration

frontend/
├── src/
│   ├── components/
│   │   ├── contracts/
│   │   │   ├── ContractsOverview.jsx     # Main dashboard page
│   │   │   ├── SummaryCard.jsx           # Metric card component
│   │   │   ├── ContractTable.jsx         # Data table with pagination
│   │   │   ├── AddContractModal.jsx      # Modal container
│   │   │   └── ContractForm.jsx          # Form inputs and validation
│   │   └── shared/
│   │       ├── Button.jsx                # Reusable button component
│   │       ├── Input.jsx                 # Reusable input component
│   │       └── StatusBadge.jsx           # Status badge component
│   ├── services/
│   │   ├── api.js                        # Axios instance configuration
│   │   └── contractService.js            # Contract API calls
│   ├── utils/
│   │   ├── validation.js                 # Contract number regex validation
│   │   └── formatters.js                 # Currency, date formatting
│   ├── hooks/
│   │   ├── useContracts.js               # Custom hook for contract data
│   │   └── useContractForm.js            # Custom hook for form state
│   └── App.jsx                           # Main app component
├── tests/
│   └── e2e/
│       ├── dashboard.spec.js             # Dashboard layout and loading tests
│       ├── contract-creation.spec.js     # Contract creation workflow tests
│       ├── contract-validation.spec.js   # Validation tests (valid/invalid)
│       ├── search-filter.spec.js         # Search and filter tests
│       └── pagination.spec.js            # Pagination tests
├── public/
│   └── index.html
├── tailwind.config.js                    # Tailwind CSS configuration
├── vite.config.js                        # Vite bundler configuration
├── playwright.config.js                  # Playwright configuration
└── package.json

shared/
└── docs/
    └── api-documentation.md              # API usage examples
```

**Structure Decision**: Web application (Option 2) selected. This feature requires both a React frontend and Laravel backend communicating via REST API. The backend/ directory contains Laravel application with MVC structure, services for business logic, and database migrations. The frontend/ directory contains React application with component-based architecture, service layer for API communication, and E2E tests. Separation enables independent deployment and scaling of frontend/backend tiers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - this section is not applicable. All constitutional principles are satisfied by the current design.

## Phase 0: Outline & Research

### Research Tasks

Based on Technical Context, the following areas require research to ensure best practices:

1. **Contract Number Generation Patterns**

   - Task: Research Laravel patterns for auto-incrementing formatted identifiers
   - Focus: How to handle concurrent requests, race conditions, database locking strategies
   - Output: Document recommended approach (pessimistic locking vs. optimistic locking vs. database sequences)

2. **React Form Validation Best Practices**

   - Task: Research React form validation libraries and patterns for real-time validation
   - Focus: React Hook Form vs. Formik vs. native state management for controlled inputs
   - Output: Recommend approach with code examples for contract number regex validation

3. **Laravel API Validation Patterns**

   - Task: Research Laravel Form Request validation for complex rules (regex + unique combination)
   - Focus: Custom validation rules, error message formatting, HTTP response standards
   - Output: Document Laravel validation rule structure for contract_no field

4. **Tailwind CSS Modal and Animation Patterns**

   - Task: Research Tailwind CSS modal implementations with smooth animations (60fps requirement)
   - Focus: Headless UI vs. custom modal, transition classes, accessibility (focus trap, ESC key)
   - Output: Recommend modal implementation approach with animation examples

5. **Playwright Test Organization**

   - Task: Research Playwright best practices for organizing E2E tests by user story
   - Focus: Page Object Model pattern, test data seeding, API mocking vs. real backend
   - Output: Document recommended test structure and fixture patterns

6. **Laravel CORS and Sanctum Configuration**

   - Task: Research Laravel Sanctum setup for SPA authentication and CORS configuration
   - Focus: Token-based auth vs. cookie-based, CORS headers for local development
   - Output: Document configuration steps for frontend-backend communication

7. **OpenAPI/Swagger API Documentation**
   - Task: Research L5-Swagger setup and OpenAPI 3.0 annotation patterns for Laravel
   - Focus: `@OA\` annotation syntax, schema definitions, request/response examples, Swagger UI configuration
   - Output: Document annotation patterns for controllers and models, setup steps for `/api/documentation` endpoint

### Research Output Location

All research findings will be documented in `specs/001-contract-management-ui/research.md` with the following structure:

```markdown
# Research: Sales Contract Management UI

## 1. Contract Number Generation

- Decision: [Chosen approach]
- Rationale: [Why chosen]
- Alternatives considered: [What else evaluated]
- Implementation notes: [Key details]

## 2. React Form Validation

[Same structure]

## 3. Laravel API Validation

[Same structure]

## 4. Tailwind CSS Modals

[Same structure]

## 5. Playwright Testing

[Same structure]

## 6. CORS and Sanctum

[Same structure]
```

_Note: Research phase will dispatch sub-agents to investigate each area and consolidate findings into research.md before proceeding to Phase 1._

## Phase 1: Design & Contracts

### Prerequisites

- `research.md` completed with all research tasks resolved
- Best practices documented for all technology choices

### Deliverables

#### 1. Data Model (`data-model.md`)

Extract entities from feature spec and research findings:

**Entities to document:**

- **Buyer**

  - Fields: id, name, contact_email, contact_phone, address, created_at, updated_at
  - Relationships: has many Contracts
  - Validation: name required, email format, phone format

- **Contract**
  - Fields: id, buyer_id (FK), contract_no (UNIQUE), contract_date, amendment_date, total_orders, order_quantity, value_usd, b2b_percent, status, remarks, created_at, updated_at
  - Relationships: belongs to Buyer
  - Validation: All required fields per FR-012, regex on contract_no, unique constraint on contract_no, CHECK constraint on b2b_percent (0-100), amendment_date >= contract_date
  - State transitions: Status values (Draft → Active → Completed/Cancelled)

**Data model will include:**

- Entity relationship diagram (ERD) in Mermaid format
- Field definitions with types and constraints
- Relationship descriptions (one-to-many, foreign keys)
- Validation rules mapped to database constraints
- State machine for contract status transitions

#### 2. API Contracts (`contracts/`)

Generate API contracts from functional requirements:

**Files to create:**

1. **`api-endpoints.yaml`** (OpenAPI 3.0 specification)

   - `GET /api/contracts` - List all contracts with summary statistics

     - Query params: search (string), status (enum), page (int), per_page (int)
     - Response: { data: Contract[], summary: { total_contracts, total_lc_value, total_order_qty, avg_b2b }, pagination: { current_page, last_page, per_page, total } }

   - `POST /api/contracts` - Create new contract

     - Request body: { buyer_id, contract_no, contract_date, amendment_date, total_orders, order_quantity, value_usd, b2b_percent, status, remarks }
     - Response 201: { message, data: Contract }
     - Response 400: { message, errors: { field: [error_messages] } }

   - `GET /api/contracts/{id}` - Get single contract (for future edit functionality)

     - Response 200: { data: Contract }
     - Response 404: { message: "Contract not found" }

   - `PUT /api/contracts/{id}` - Update contract (for future edit functionality)

     - Request body: Same as POST
     - Response 200: { message, data: Contract }
     - Response 400/404: Error responses

   - `GET /api/contracts/next-number?year=YYYY` - Get next available contract number

     - Query param: year (required, 4-digit year)
     - Response 200: { contract_number: "IIC/AKCL/CON/YYYY/NN" }

   - `GET /api/buyers` - List all buyers for dropdown
     - Response 200: { data: [{ id, name }] }

2. **`contract-number.schema.json`** (JSON Schema for contract number format)
   - JSON Schema defining the contract number pattern
   - Used for documentation and frontend/backend validation consistency
   - Pattern: `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$`
   - Examples: Valid and invalid contract numbers

#### 3. Quickstart Guide (`quickstart.md`)

Create developer quickstart with:

**Sections:**

1. **Prerequisites**

   - PHP 8.1+, Composer
   - Node.js 18+, npm
   - MySQL 8+ or PostgreSQL 13+
   - Git

2. **Backend Setup (Laravel)**

   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   # Configure database in .env
   php artisan migrate --seed
   php artisan serve
   ```

3. **Frontend Setup (React)**

   ```bash
   cd frontend
   npm install
   # Configure API URL in .env.local
   npm run dev
   ```

4. **Running Tests**

   ```bash
   # Backend tests
   cd backend
   php artisan test

   # E2E tests
   cd frontend
   npx playwright test
   ```

5. **Quick Feature Tour**

   - Navigate to http://localhost:3000
   - View dashboard with summary cards
   - Click "Add New Contract" button
   - Observe auto-generated contract number
   - Fill form and submit
   - Verify new contract in table

6. **API Testing with cURL/Postman**
   - Examples for each endpoint
   - Sample request/response payloads

### Agent Context Update

After Phase 1 artifacts are generated, run:

```powershell
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

This script will:

- Detect which AI agent is in use (GitHub Copilot in this case)
- Update `.github/.copilot-instructions.md` (or equivalent agent context file)
- Add technologies from current plan: React 18+, Laravel 9.x/10.x, Tailwind CSS, Playwright, MySQL/PostgreSQL
- Preserve existing manual additions between markers
- Ensure agent has full context for implementation phase

## Phase 1: Post-Design Constitution Re-Check

_Re-evaluate all constitutional principles after design artifacts are complete_

### ✅ Principle I: Contract Number Format Enforcement

**Post-Design Compliance**: PASS (Expected)

- OpenAPI spec will document contract number format in all relevant endpoints
- JSON schema will codify the regex pattern for validation consistency
- Data model will show UNIQUE constraint on contract_no column

**Action**: Verify after `contracts/api-endpoints.yaml` and `contract-number.schema.json` are created.

### ✅ Principle II: Full-Stack Validation

**Post-Design Compliance**: PASS (Expected)

- API contracts will show validation error response structures (400 status, errors object)
- Data model will document database constraints matching backend validation rules
- Frontend validation patterns will be referenced in quickstart.md

**Action**: Verify after `data-model.md` includes validation rules section.

### ✅ Principle III: Component Modularity

**Post-Design Compliance**: PASS (Expected)

- Project structure shows five components in `frontend/src/components/contracts/`
- Each component has single, clear responsibility documented in quickstart tour

**Action**: Verify after project structure is finalized.

### ✅ Principle IV: End-to-End Testing

**Post-Design Compliance**: PASS (Expected)

- Project structure shows `frontend/tests/e2e/` with five test files covering all workflows
- Quickstart includes "Running Tests" section with Playwright command

**Action**: Verify after `quickstart.md` includes test execution instructions.

### ✅ Principle V: Clean Architecture

**Post-Design Compliance**: PASS (Expected)

- Project structure shows clear separation: controllers, services, models (backend); components, services, utils (frontend)
- Quickstart demonstrates clean setup and tour without exposing implementation complexity

**Action**: Verify after all Phase 1 artifacts are complete.

### Final Gate: ✅ EXPECTED TO PASS

All constitutional principles are design-compliant based on Technical Context analysis. If any violations are discovered during Phase 1 artifact generation, STOP and document in Complexity Tracking section with justification.

## Implementation Sequence

_This section provides recommended build order after `/speckit.tasks` generates detailed task breakdown_

### Phase 2: Task Generation (Next Command)

Run `/speckit.tasks` to generate `specs/001-contract-management-ui/tasks.md` with detailed task breakdown organized by user story priority (P1, P2, P3).

### Recommended Build Order

**P1: MVP Core (User Stories 1 & 2)**

1. Backend Foundation

   - Database migrations (buyers, contracts)
   - Models with relationships
   - Seeders for test data
   - ContractNumberService
   - ContractController (index, store, nextNumber)
   - API routes

2. Frontend Foundation

   - API service layer setup
   - Shared components (Button, Input, StatusBadge)
   - SummaryCard component
   - ContractTable component

3. Dashboard Integration (User Story 1)

   - ContractsOverview page
   - Connect to GET /contracts endpoint
   - Render summary cards
   - Render contract table
   - Implement pagination

4. Contract Creation (User Story 2)

   - ContractForm component with validation
   - AddContractModal component
   - Connect to GET /contracts/next-number
   - Connect to POST /contracts
   - Modal open/close logic
   - Success/error handling

5. E2E Tests for P1
   - Dashboard layout test
   - Contract creation workflow
   - Contract number validation (valid/invalid)
   - Error handling

**P2: Enhanced Usability (User Story 3)**

6. Search and Filter
   - Add search input to ContractsOverview
   - Add status filter dropdown
   - Implement client-side filtering (or backend endpoint enhancement)
   - Clear/reset functionality
   - E2E tests for search/filter

**P3: Future Iteration (User Story 4 - Deferred)**

7. Edit Functionality (Optional)
   - View contract modal
   - Edit contract modal with pre-populated form
   - PUT /contracts/{id} endpoint
   - Update ContractController
   - E2E tests for edit workflow

### Development Environment

**Local Development:**

- Backend: `php artisan serve` (http://localhost:8000)
- Frontend: `npm run dev` (http://localhost:3000)
- Database: MySQL/PostgreSQL running locally

**Testing:**

- Backend unit tests: `php artisan test`
- E2E tests: `npx playwright test` (with backend running)

**CORS Configuration:**

- Laravel CORS middleware configured to allow `http://localhost:3000`
- Sanctum configured for SPA authentication (if needed)

## Next Steps

1. ✅ **Constitution Check**: PASSED - All principles satisfied
2. ⏩ **Phase 0**: Execute research tasks, generate `research.md`
3. ⏩ **Phase 1**: Generate `data-model.md`, `contracts/`, `quickstart.md`
4. ⏩ **Update Agent Context**: Run `update-agent-context.ps1`
5. ⏩ **Phase 1 Re-Check**: Verify constitutional compliance post-design
6. 🎯 **Ready for `/speckit.tasks`**: Generate detailed task breakdown

**Current Status**: Plan template complete, ready to execute Phase 0 research.

**Branch**: `001-contract-management-ui`  
**Plan File**: `d:\laragon\www\master-lc-management-spec\specs\001-contract-management-ui\plan.md`
