<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Change Type: Initial Constitution Creation
Date: 2025-12-04

Principles Defined:
- I. Contract Number Format Enforcement (STRICT)
- II. Full-Stack Validation
- III. Component Modularity
- IV. End-to-End Testing (Playwright)
- V. Clean Architecture & Maintainability

Templates Status:
✅ plan-template.md - Aligned (constitution check present)
✅ spec-template.md - Aligned (user stories & acceptance criteria structure)
✅ tasks-template.md - Aligned (organized by user story, test tasks included)

Follow-up TODOs: None - All placeholders resolved
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

## Technical Standards

### Technology Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Laravel (PHP) with validation and RESTful API design
- **Testing**: Playwright for end-to-end tests
- **Database**: Relational database with proper constraints (specific RDBMS to be determined during implementation)

### Required Features

**Dashboard ( Contracts Overview):**

- Summary cards displaying: Total Contracts, Total LC Value, Total Order Qty, Avg B2B %
- Search functionality: Buyer name or Contract No
- Filter functionality: Status
- Data table with columns: Buyer Name, Contract No, Amendment Date, Total Orders, Order Quantity, Master LC Value, B2B %, Status Badge, Actions (Show/Edit)
- Pagination controls

**Add New Contract Modal:**

- Fields: Buyer (dropdown), Contract No (auto-generated with manual edit capability), Contract Date, Amendment Date, Total Orders, Order Quantity, Total Contract Value (USD), Overall B2B %, Status, Remarks
- Actions: Cancel, Save with validation enforcement

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
- [ ] Components are modular, single-purpose, and reusable
- [ ] Playwright tests cover layout, validation, and functional workflows
- [ ] Code follows clean architecture principles and uses Tailwind CSS consistently

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

**Version**: 1.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04
