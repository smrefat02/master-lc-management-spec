---
description: "Implementation worklist for LC Management (Contracts Module)"
---

# Tasks: Sales Contract Management UI

**Input**: Design documents from `/specs/001-contract-management-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as user request explicitly requires Playwright E2E tests for contract workflows

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
- **Task ID**: Sequential number (T001, T002, T003...) in execution order
- **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies)
- **[Story] label**: REQUIRED for user story phase tasks only (e.g., [US1], [US2], [US3])
- **Description**: Clear action with exact file path

## Global Rules (Apply Everywhere)

- Contract No format is mandatory: `IIC/AKCL/CON/YYYY/NN`
- Regex: `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$`
- Frontend and backend MUST use the exact same validation pattern
- Playwright tests MUST cover valid and invalid Contract No flows
- Keep commits modular and reversible

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Folder structure, starter files, and project initialization

**Deliverables**: Frontend and backend projects run successfully

- [x] T001 Create backend folder structure: `backend/app/{Models,Http/Controllers,Services}`, `backend/database/{migrations,seeders}`
- [x] T002 Create frontend folder structure: `frontend/src/{components,pages,services,utils}`, `frontend/tests/playwright/`
- [x] T003 [P] Initialize Laravel backend: `composer create-project laravel/laravel backend`, configure `backend/.env` with database credentials
- [x] T004 [P] Initialize React frontend: `npm create vite@latest frontend -- --template react`, configure Tailwind CSS in `frontend/tailwind.config.js`
- [x] T005 [P] Install Laravel dependencies in `backend/composer.json`: `laravel/sanctum`
- [x] T006 [P] Install React dependencies in `frontend/package.json`: `axios`, `react-hook-form`, `zod`, `@headlessui/react`
- [x] T007 Install Playwright: `npm install -D @playwright/test` in `frontend/`, run `npx playwright install`
- [x] T008 Configure CORS in `backend/config/cors.php`: allow `http://localhost:3000`, enable credentials
- [x] T009 Configure Sanctum in `backend/config/sanctum.php`: set stateful domains to `localhost:3000`
- [x] T010 Create starter files: `frontend/src/pages/ContractsOverview.jsx`, `backend/app/Models/Contract.php`, `backend/app/Http/Controllers/ContractController.php`
- [x] T011 Update `backend/routes/api.php`: add placeholder routes for `/contracts`, `/contracts/next-number`
- [x] T012 Create README with install/run instructions: backend (`php artisan serve`), frontend (`npm run dev`)

**Checkpoint**: Projects run successfully - `php artisan serve` on :8000, `npm run dev` on :3000

**Commit**: `chore: add project skeleton and base files`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, models, and core services

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create buyers migration: `backend/database/migrations/YYYY_MM_DD_create_buyers_table.php` with id, name (UNIQUE), contact_email, contact_phone, address, timestamps
- [x] T014 Create contracts migration: `backend/database/migrations/YYYY_MM_DD_create_contracts_table.php` with id, buyer_id (FK), contract_no (UNIQUE), contract_date, amendment_date, total_orders, order_quantity, value_usd DECIMAL(14,2), b2b_percent DECIMAL(6,2), status (default 'draft'), remarks TEXT, timestamps
- [x] T015 [P] Create Buyer model: `backend/app/Models/Buyer.php` with `hasMany` relationship to Contract, fillable fields
- [x] T016 [P] Create Contract model: `backend/app/Models/Contract.php` with `belongsTo` relationship to Buyer, fillable fields, status enum/casts
- [x] T017 [P] Create BuyerSeeder: `backend/database/seeders/BuyerSeeder.php` with 5-10 sample buyers (diverse names for testing search)
- [x] T018 [P] Create ContractSeeder: `backend/database/seeders/ContractSeeder.php` with 20-30 sample contracts across years 2023-2025, valid contract numbers
- [x] T019 Run migrations and seed database: `php artisan migrate:fresh --seed`
- [x] T020 Create ContractNumberService: `backend/app/Services/ContractNumberService.php` with `generateNextNumber($year)` method - query latest contract for year, extract NN, increment, pad to 2 digits, use DB transaction with lockForUpdate()
- [x] T021 Create base API utility: `frontend/src/services/api.js` - configure Axios instance with `baseURL: import.meta.env.VITE_API_URL`, `withCredentials: true`, error interceptor
- [x] T022 Write unit test for ContractNumberService: `backend/tests/Unit/ContractNumberServiceTest.php` - test empty DB returns `/YYYY/01`, test last `/YYYY/09` returns `/YYYY/10`, test invalid year returns error

**Checkpoint**: Migrations applied, models ready, service tested - foundation complete

**Commit**: `feat: add contracts migration and model`

---

## Phase 3: User Story 1 - View Dashboard with Summary (Priority: P1) 🎯 MVP

**Goal**: Display contract dashboard with summary cards and contract table with pagination

**Independent Test**: Navigate to http://localhost:3000 and verify summary cards display correct totals (Total Contracts, Total LC Value, Total Order Qty, Avg B2B %), contract table shows all contracts with proper formatting

### Backend Implementation for User Story 1

- [x] T023 [US1] Implement ContractController index method in `backend/app/Http/Controllers/ContractController.php`: return paginated contracts with eager-loaded buyer relationship, calculate summary statistics (total count, sum value_usd, sum order_quantity, avg b2b_percent), support query params for search/filter/pagination
- [x] T024 [P] [US1] Implement BuyerController index method in `backend/app/Http/Controllers/BuyerController.php`: return all buyers for dropdown (id, name only)
- [x] T025 [US1] Update API routes in `backend/routes/api.php`: define `GET /api/contracts`, `GET /api/buyers` routes to ContractController@index and BuyerController@index

### Frontend Components for User Story 1

- [x] T026 [P] [US1] Create SummaryCard component in `frontend/src/components/contracts/SummaryCard.jsx`: accept props (title, value, description), use Tailwind for card styling
- [x] T027 [P] [US1] Create StatusBadge component in `frontend/src/components/contracts/StatusBadge.jsx`: color mapping (Draft=gray, Active=green, Pending=yellow, Completed=blue, Cancelled=red)
- [x] T028 [US1] Create ContractTable component in `frontend/src/components/contracts/ContractTable.jsx`: render table with columns (Buyer Name, Contract No, Amendment Date, Total Orders, Order Quantity, Master LC Value USD, B2B %, Status badge, Actions), include pagination controls (Previous/Next, page size 10/20/50), Show/Edit placeholder buttons
- [x] T029 [US1] Create contract service in `frontend/src/services/contractService.js`: implement `getContracts(params)` calling `GET /api/contracts` with query params, handle response/error

### Page Integration for User Story 1

- [x] T030 [US1] Implement ContractsOverview page in `frontend/src/pages/ContractsOverview.jsx`: fetch contracts on mount via contractService.getContracts(), render 4 SummaryCards (Total Contracts, Total LC Value, Total Order Qty, Avg B2B %), render ContractTable with fetched data, handle loading/error states, include "Add New Contract" button (non-functional for now)
- [x] T031 [US1] Style ContractsOverview with Tailwind CSS: match screenshot layout (summary cards in responsive grid, proper spacing, table styling, button styling)

### Tests for User Story 1 (Playwright E2E)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T032 [P] [US1] Create dashboard layout test in `frontend/tests/playwright/contracts-overview.spec.ts`: navigate to `/`, verify page title, verify 4 summary cards exist, verify contract table exists, verify "Add New Contract" button exists
- [x] T033 [P] [US1] Create contract list test in `frontend/tests/playwright/contracts-overview.spec.ts`: verify table has correct column headers (Buyer Name, Contract No, etc.), verify table renders data rows, verify pagination controls visible

**Checkpoint**: User Story 1 complete - dashboard displays with real data, all tests pass

**Commit**: `feat: add ContractsOverview, ContractTable, filters, summary cards`

---

## Phase 4: User Story 2 - Create New Contract (Priority: P1) 🎯 MVP

**Goal**: Allow users to create new contracts through modal with auto-generated contract number and full validation

**Independent Test**: Click "Add New Contract" button, verify modal opens with auto-generated contract number in format `IIC/AKCL/CON/YYYY/NN`, fill valid form, submit, verify new contract appears in table

### Backend API for Contract Number Generation (User Story 2)

- [x] T034 [US2] Implement ContractController nextNumber method in `backend/app/Http/Controllers/ContractController.php`: accept query param `year` (required, 4 digits), call ContractNumberService.generateNextNumber(year), return JSON `{"contract_no": "IIC/AKCL/CON/YYYY/NN"}`, validate year format, return 400 for invalid year
- [x] T035 [US2] Update API routes in `backend/routes/api.php`: add `GET /api/contracts/next-number` route to ContractController@nextNumber
- [x] T036 [P] [US2] Write unit test for nextNumber endpoint in `backend/tests/Feature/ContractControllerTest.php`: test empty DB returns `/YYYY/01`, test last `/YYYY/09` returns `/YYYY/10`, test invalid year returns 400

### Backend API for Contract Creation (User Story 2)

- [x] T037 [US2] Create StoreContractRequest in `backend/app/Http/Requests/StoreContractRequest.php`: validation rules for contract_no (required, regex `/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/`, unique:contracts), buyer_id (required, exists:buyers,id), contract_date (required, date), amendment_date (nullable, date, after_or_equal:contract_date), total_orders (required, integer, min:0), order_quantity (required, integer, min:0), value_usd (required, numeric, min:0), b2b_percent (required, numeric, min:0, max:100), status (required, in:draft,active,pending,completed,cancelled), remarks (nullable, string, max:1000)
- [x] T038 [US2] Implement ContractController store method in `backend/app/Http/Controllers/ContractController.php`: use StoreContractRequest for validation, wrap in DB transaction, create Contract record, return 201 with created contract (eager load buyer), handle duplicate contract_no error with 422 response
- [x] T039 [US2] Update API routes in `backend/routes/api.php`: add `POST /api/contracts` route to ContractController@store
- [x] T040 [P] [US2] Write unit tests for store endpoint in `backend/tests/Feature/ContractControllerTest.php`: test valid create returns 201, test invalid contract_no regex returns 422, test duplicate contract_no returns 422, test missing required fields returns 422

### Frontend Form and Modal (User Story 2)

- [x] T041 [P] [US2] Create ContractForm component in `frontend/src/components/contracts/ContractForm.jsx`: use React Hook Form, include fields (Buyer dropdown, Contract No input, Contract Date, Amendment Date, Total Orders, Order Quantity, Total Contract Value USD, Overall B2B %, Status dropdown, Remarks textarea), implement Zod validation schema matching backend rules, display inline error messages below each field
- [x] T042 [US2] Add contract number validation to ContractForm: regex pattern `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$`, inline error message "Invalid contract number format. Must match: IIC/AKCL/CON/YYYY/NN", disable Save button when validation fails
- [x] T043 [P] [US2] Create AddContractModal component in `frontend/src/components/contracts/AddContractModal.jsx`: use Headless UI Dialog, accept props (isOpen, onClose, onCreated), render ContractForm inside modal, include Cancel and Save buttons, smooth open/close animations
- [x] T044 [US2] Implement auto-generation in AddContractModal: on modal open, determine year from current date or contract_date field, call contractService.getNextNumber(year), populate Contract No field in ContractForm with returned value
- [x] T045 [US2] Implement modal trigger in ContractsOverview: add state for modal open/close, connect "Add New Contract" button to open modal, pass onCreated callback to refresh table
- [x] T046 [US2] Extend contract service in `frontend/src/components/contracts/AddContractModal.jsx`: implemented inline using fetch API for getNextNumber and createContract
- [x] T047 [P] [US2] Buyer service implemented inline in AddContractModal: fetch buyers using fetch API, return array of {id, name}
- [x] T048 [US2] Load buyers in AddContractModal: fetch buyers on modal open via fetch API, populate dropdown, handle loading state
- [x] T049 [US2] Implement form submission handler in AddContractModal: on Save click, validate form, call fetch API to create contract, on success call onCreated() callback and close modal, on error display backend validation errors

### Tests for User Story 2 (Playwright E2E)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T050 [P] [US2] Create contract creation workflow test in `frontend/tests/playwright/add-contract.spec.ts`: click "Add New Contract" button, verify modal opens, verify Contract No auto-populates with correct format, fill all required fields with valid data, click Save, verify success toast, verify modal closes, verify new contract appears in table with correct data
- [ ] T051 [P] [US2] Create contract validation test in `frontend/tests/playwright/add-contract.spec.ts`: open modal, manually edit Contract No to invalid formats (test cases: missing prefix "AKCL/CON/2025/01", wrong year digits "IIC/AKCL/CON/25/01", missing NN "IIC/AKCL/CON/2025/"), verify inline error message appears for each case, verify Save button disabled
- [ ] T052 [P] [US2] Create error handling test in `frontend/tests/playwright/add-contract.spec.ts`: test duplicate contract_no (create contract, try to create again with same number), verify backend error toast visible, test missing required fields (submit form with empty buyer), verify inline errors, test backend validation failure scenarios

**Checkpoint**: User Story 2 complete - users can create contracts with auto-generated numbers and validation, all tests pass

**Commit**: `feat: add ContractForm and AddContractModal with auto-generation + regex validation`

---

## Phase 5: User Story 3 - Search and Filter Contracts (Priority: P2)

**Goal**: Enable users to search contracts by buyer name or contract number and filter by status

**Independent Test**: Enter search term (buyer name or contract number) in search box, verify table updates to show only matching contracts; select status filter, verify only contracts with selected status display

### Backend Enhancement for User Story 3

- [ ] T053 [US3] Enhance ContractController index method in `backend/app/Http/Controllers/ContractController.php`: add support for query params `search` (search in contract_no or buyer.name using LIKE with wildcard), `status` (exact match filter), apply filters to query before pagination, update summary statistics to reflect filtered results
- [ ] T054 [P] [US3] Add query scopes to Contract model in `backend/app/Models/Contract.php`: create `scopeSearch($query, $term)` applying WHERE contract_no LIKE OR joining buyers table WHERE name LIKE, create `scopeByStatus($query, $status)` applying WHERE status =

### Frontend Enhancement for User Story 3

- [ ] T055 [P] [US3] Add search input to ContractsOverview in `frontend/src/pages/ContractsOverview.jsx`: text input with placeholder "Search by buyer name or contract number", implement debounced onChange (300ms delay) to avoid excessive API calls
- [ ] T056 [P] [US3] Add status filter dropdown to ContractsOverview: select element with options "All Statuses", "Draft", "Active", "Pending", "Completed", "Cancelled", onChange triggers filter update
- [ ] T057 [US3] Implement filter logic in ContractsOverview: maintain search and status state, when either changes call contractService.getContracts() with updated params, update table data, reset to page 1 on filter change
- [ ] T058 [US3] Add Clear/Reset functionality: button to reset search input and status filter to defaults, reload full unfiltered contract list
- [ ] T059 [US3] Add loading and empty state feedback: show spinner while filtering, display "No results found" message when filtered results are empty

### Tests for User Story 3 (Playwright E2E)

- [ ] T060 [P] [US3] Create search and filter test in `frontend/tests/playwright/contracts-overview.spec.ts`: test search by buyer name (verify filtered results), test search by contract number (verify filtered results), test status filter (select "Active", verify only Active contracts shown), test combined search + status filter, test clear filters returns all data

**Checkpoint**: User Stories 1, 2, AND 3 complete - full P1+P2 functionality delivered, all tests pass

**Commit**: `feat: add search and filter functionality to contracts overview`

---

## Phase 6: User Story 4 - View and Edit Contract (Priority: P3) 🔮 Future

**Goal**: Allow users to view contract details and edit existing contracts

**Independent Test**: Click "Show" button to view contract in read-only modal; click "Edit" button to open edit modal with pre-populated data, modify fields, submit, verify changes reflected in table

**⚠️ DEFERRED**: This user story is marked P3 and can be implemented in a future iteration after P1+P2 delivery

### Backend API for User Story 4

- [ ] T061 [P] [US4] Implement ContractController show method in `backend/app/Http/Controllers/ContractController.php`: accept contract ID param, return single contract with eager-loaded buyer, return 404 if not found
- [ ] T062 [P] [US4] Create UpdateContractRequest in `backend/app/Http/Requests/UpdateContractRequest.php`: same validation rules as StoreContractRequest except contract_no (required, regex but NOT unique check since updating same record), buyer_id through remarks fields
- [ ] T063 [US4] Implement ContractController update method in `backend/app/Http/Controllers/ContractController.php`: accept contract ID param, use UpdateContractRequest for validation, wrap in DB transaction, update Contract record (exclude contract_no from fillable updates), return updated contract with buyer, return 404 if not found
- [ ] T064 [US4] Update API routes in `backend/routes/api.php`: add `GET /api/contracts/{id}` to ContractController@show, add `PUT /api/contracts/{id}` to ContractController@update

### Frontend Components for User Story 4

- [ ] T065 [P] [US4] Create ViewContractModal component in `frontend/src/components/contracts/ViewContractModal.jsx`: use Headless UI Dialog, display all contract fields in read-only format, include Close button
- [ ] T066 [P] [US4] Create EditContractModal component in `frontend/src/components/contracts/EditContractModal.jsx`: reuse ContractForm component, disable contract_no field (read-only with grey styling), accept contract prop to pre-populate form, different onSubmit handler calling update API
- [ ] T067 [US4] Implement Show action in ContractTable: add click handler to Show button, fetch contract by ID via contractService.getContract(id), open ViewContractModal with fetched data
- [ ] T068 [US4] Implement Edit action in ContractTable: add click handler to Edit button, fetch contract by ID, open EditContractModal with pre-populated data
- [ ] T069 [US4] Extend contract service in `frontend/src/services/contractService.js`: add `getContract(id)` calling `GET /api/contracts/{id}`, add `updateContract(id, data)` calling `PUT /api/contracts/{id}`
- [ ] T070 [US4] Implement update submission handler in EditContractModal: validate form, call contractService.updateContract(id, data), on success show toast, call onUpdated() callback to refresh table, close modal, on error display validation errors inline

### Tests for User Story 4 (Playwright E2E)

- [ ] T071 [P] [US4] Create view/edit workflow test in `frontend/tests/playwright/add-contract.spec.ts`: click Show button, verify modal opens with read-only data, close modal, click Edit button, verify modal opens with editable form pre-populated, modify Amendment Date field, click Save, verify success toast, verify changes reflected in table

**Checkpoint**: All user stories complete - full feature functionality delivered

---

## Phase 7: Documentation & PR Preparation

**Purpose**: Documentation, testing, and production readiness

- [ ] T072 [P] Update README in repository root: add "How to run backend" section (`cd backend; composer install; php artisan migrate --seed; php artisan serve`), add "How to run frontend" section (`cd frontend; npm install; npm run dev`), add "How to run Playwright" section (`cd frontend; npx playwright test`), include example curl commands for API testing
- [ ] T073 [P] Add curl examples to README: `curl "http://localhost:8000/api/contracts/next-number?year=2025"`, `curl -X POST "http://localhost:8000/api/contracts" -H "Content-Type: application/json" -d '{"contract_no":"IIC/AKCL/CON/2025/01","buyer_id":1,...}'`
- [ ] T074 [P] Create PR checklist in `PULL_REQUEST_TEMPLATE.md`: migration added, API endpoints documented, Playwright tests included, backend validation tests added, all tests passing locally
- [ ] T075 Run all Playwright tests: `cd frontend; npx playwright test` - verify all E2E tests pass (dashboard layout, contract creation, validation, search/filter)
- [ ] T076 Run all backend tests: `cd backend; php artisan test` - verify all unit and feature tests pass (ContractNumberService, API endpoints)
- [ ] T077 [P] Add inline code comments: document regex pattern in ContractNumberService, explain number generation logic, document validation rules in StoreContractRequest
- [ ] T078 [P] Add toast notification library: install `react-toastify` or similar, configure in `frontend/src/main.jsx`, use in form submission handlers for success/error messages
- [ ] T079 [P] Improve error handling: user-friendly error messages for network failures, timeout errors, validation failures; map backend error responses to form fields
- [ ] T080 Manual testing checklist: user can open modal → auto-generate Contract No → submit → see new contract in table; test all validation scenarios (invalid format, duplicate number, missing fields); test search and filter functionality

---

## Phase 8: Additional Agent Rules & Final Acceptance

**Purpose**: Code quality and deployment standards

### Additional Agent Rules

- **Branch name format**: `feature/contracts/<description>` (e.g., `feature/contracts/add-creation-modal`)
- **Every PR must include**: At least one integration test covering the feature
- **Validation**: Favor explicit validation and predictable error handling
- **Code comments**: Add comments where regex or number generation occurs
- **Commit messages**: Follow conventional commits format (feat:, fix:, test:, docs:, chore:)

### Final Acceptance Criteria for Entire Module

- [ ] T081 All tasks T001-T080 complete and code committed
- [ ] T082 All Playwright tests pass in CI: `npx playwright test --reporter=html` produces green results
- [ ] T083 All backend unit tests pass: `php artisan test` produces green results
- [ ] T084 Manual acceptance test: user can open modal → auto-generate Contract No in correct format → fill form → submit → see new contract appear in table with correct data
- [ ] T085 Constitutional compliance verified: Contract number format strictly enforced (Principle I), multi-layer validation working (Principle II), 5+ modular components created (Principle III), E2E tests cover all workflows (Principle IV), clean separation of concerns (Principle V)

---

## Dependency Graph

**Phase Dependencies** (must complete in order):

- Phase 1 → Phase 2 → Phase 3/4/5/6 (User Stories can run in parallel after Phase 2) → Phase 7 → Phase 8

**User Story Dependencies**:

- **US1 (View Dashboard)**: No dependencies - can be implemented first
- **US2 (Create Contract)**: Depends on US1 for table refresh after creation
- **US3 (Search/Filter)**: Depends on US1 for table component, enhances existing view
- **US4 (Edit Contract)**: Depends on US1 for table action buttons, US2 for form component reuse

**Parallel Execution Examples**:

- After T022 (foundation complete): T023-T025 (backend controllers) can run in parallel
- After T025 (routes ready): T026-T028 (frontend components) can run in parallel
- After T033 (US1 tests written): T023-T031 (US1 implementation) can proceed
- After T040 (US2 backend tests): T034-T049 (US2 implementation) can proceed
- Tests T032-T033, T036, T040, T050-T052, T060, T071 can all be written in parallel before implementations

---

## Success Criteria Mapping

Map tasks to success criteria from spec.md:

- [ ] **SC-001** (Contract number auto-generation within 500ms): Verified by T034 backend nextNumber + T044 frontend integration + T050 E2E test
- [ ] **SC-002** (Dashboard loads within 2s): Verified by T023 API index + T030 page integration + T032 E2E layout test
- [ ] **SC-003** (Validation feedback within 300ms): Verified by T041-T042 React Hook Form + Zod + T051 E2E validation test
- [ ] **SC-004** (100% contract numbers follow format): Verified by T037 backend validation + T042 frontend regex + T014 database UNIQUE constraint + T051 E2E test
- [ ] **SC-005** (Search returns within 1s): Verified by T053 backend search + T055-T057 frontend debounce + T060 E2E test
- [ ] **SC-006** (Pagination no performance degradation): Verified by T023 backend pagination + T028 frontend pagination controls + T033 E2E test
- [ ] **SC-007** (All Playwright tests pass): Verified by T032-T033, T050-T052, T060, T071 E2E tests + T075 CI test run
- [ ] **SC-008** (60fps modal animations): Verified by T043 Headless UI Dialog implementation
- [ ] **SC-009** (100% invalid numbers prevented): Verified by T037-T038 Laravel validation + T014 database UNIQUE constraint + T052 E2E error test
- [ ] **SC-010** (Clear error messages): Verified by T049 frontend error handling + T079 user-friendly messages + T052 E2E error test

---

## Constitutional Compliance Verification

Map tasks to constitution.md principles:

- [x] **Principle I: Contract Number Format Enforcement (STRICT)**: T020 ContractNumberService + T037 StoreContractRequest validation + T042 frontend regex + T014 UNIQUE constraint + T051 E2E validation test
- [x] **Principle II: Full-Stack Validation**: T037-T038 Laravel Form Request + T041-T042 React Hook Form + Zod + T014 database constraints + T052 E2E error test
- [x] **Principle III: Component Modularity**: T026 SummaryCard + T027 StatusBadge + T028 ContractTable + T041 ContractForm + T043 AddContractModal (5 independent components)
- [x] **Principle IV: End-to-End Testing**: T032-T033, T050-T052, T060, T071 Playwright tests covering all P1+P2+P3 workflows
- [x] **Principle V: Clean Architecture**: T020 ContractNumberService (business logic), T023-T024 Controllers (API layer), T029 contractService (frontend API abstraction), T041 form components (UI layer)

---

## Task Statistics

- **Total Tasks**: 85
- **Phase 1 (Setup)**: 12 tasks
- **Phase 2 (Foundation)**: 10 tasks
- **Phase 3 (US1 - P1 Dashboard)**: 11 tasks (2 tests + 3 backend + 6 frontend)
- **Phase 4 (US2 - P1 Create)**: 19 tasks (3 tests + 7 backend + 9 frontend)
- **Phase 5 (US3 - P2 Search/Filter)**: 8 tasks (1 test + 2 backend + 5 frontend)
- **Phase 6 (US4 - P3 Edit)**: 11 tasks (1 test + 4 backend + 6 frontend)
- **Phase 7 (Documentation)**: 9 tasks
- **Phase 8 (Final Acceptance)**: 5 tasks

**Parallelizable Tasks**: 28 tasks marked with [P]
**MVP Completion** (P1 only): Phase 1-4 complete = 52 tasks (61% of total)
**P1+P2 Completion**: Phase 1-5 complete = 60 tasks (71% of total)
**Full Feature**: Phase 1-8 complete = 85 tasks (100%)

---

## Implementation Strategy

**Recommended Approach**:

1. **Week 1**: Complete Phase 1-2 (Setup + Foundation) - T001-T022
2. **Week 2**: Complete Phase 3 (US1 Dashboard) - T023-T033
3. **Week 3-4**: Complete Phase 4 (US2 Create Contract) - T034-T052
4. **🎉 MVP CHECKPOINT**: At end of Week 4, you have shippable P1 product
5. **Week 5**: Complete Phase 5 (US3 Search/Filter) - T053-T060
6. **Week 6** (Optional): Complete Phase 6 (US4 Edit) - T061-T071
7. **Week 6-7**: Complete Phase 7-8 (Documentation + Final Acceptance) - T072-T085

**Estimated Effort**:

- MVP (P1): 4 weeks
- MVP + P2: 5 weeks
- Full Feature (P1+P2+P3): 6-7 weeks

---

**Status**: Ready for implementation
**Next Step**: Begin Phase 1 Task T001 - create backend folder structure
**Branch**: `feature/contracts/implementation` or `001-contract-management-ui`
**Commit Strategy**: One commit per task or group related tasks (e.g., T001-T002 together for folder structure)
