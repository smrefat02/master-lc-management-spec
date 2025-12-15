# Master LC Implementation Plan v3.0

## Project Overview

Implement complete 8-step Letter of Credit workflow while maintaining simple single-bank UI. Backend will support full dual-bank architecture with comprehensive state machine and timeline tracking.

---

## Phase 1: Database & Foundation (Days 1-2)

### 1.1 Database Schema

- [ ] Create `banks` table migration
- [ ] Create `lc_timelines` table migration
- [ ] Modify `master_lcs` table with new fields:
  - Issuing bank fields
  - Advising bank fields
  - Workflow timestamp fields
  - New 11-state enum
  - Shipment & document tracking fields
- [ ] Run migrations and verify schema
- [ ] Seed sample banks data (10+ international banks)

### 1.2 Enums & Constants

- [ ] Create `LCStatus` enum with 11 states
- [ ] Add transition matrix to enum
- [ ] Add helper methods (label, color, isTerminal, allowedTransitions)
- [ ] Create `LCAction` enum for timeline actions
- [ ] Create currency constants
- [ ] Create document type constants

### 1.3 Models

- [ ] Create/Update `Bank` model with relationships
- [ ] Create `LCTimeline` model
- [ ] Update `MasterLC` model:
  - Add new fillable fields
  - Add casts for JSON fields
  - Add relationships (issuingBank, advisingBank, timeline)
  - Add workflow permission methods (canApply, canIssue, etc.)
  - Add status check methods (isDraft, isApplied, etc.)
  - Add helper methods
  - Add scopes

---

## Phase 2: Business Logic Layer (Days 3-5)

### 2.1 Services

#### LCWorkflowService

- [ ] Create service class
- [ ] Implement `applyForLC()` method
  - Validate current status
  - Set applied_at timestamp
  - Update status to 'applied'
  - Create timeline entry
  - Auto-assign issuing bank (from beneficiary bank)
- [ ] Implement `issueLC()` method
  - Validate issuing bank exists
  - Set issuing bank fields
  - Set issued_at timestamp
  - Update status to 'issued_by_issuing_bank'
  - Create timeline entry
- [ ] Implement `adviseLC()` method
  - Validate advising bank exists
  - Set advising bank fields
  - Set verification status
  - Update status based on verification
  - Create timeline entry
- [ ] Implement `shipGoods()` method
  - Validate shipment data
  - Store shipment information
  - Set goods_shipped_at timestamp
  - Update status to 'goods_shipped'
  - Create timeline entry
- [ ] Implement `receiveDocuments()` method
  - Validate required documents present
  - Store submitted documents
  - Set documents_received_at timestamp
  - Update status to 'documents_received'
  - Create timeline entry
- [ ] Implement `forwardDocuments()` method
  - Set documents_forwarded_at timestamp
  - Update status to 'documents_forwarded'
  - Create timeline entry
- [ ] Implement `verifyDocuments()` method
  - Validate documents
  - Check for discrepancies
  - Set documents_verified_at timestamp
  - Update status to 'documents_verified'
  - Create timeline entry
- [ ] Implement `activateLC()` method
  - Set activated_at timestamp
  - Update status to 'active'
  - Create timeline entry
- [ ] Implement `rejectLC()` method
  - Store rejection reason
  - Set rejected_at, rejected_by
  - Update status to 'rejected'
  - Create timeline entry
- [ ] Implement `canTransitionTo()` validation method

#### LCTimelineService

- [ ] Create service class
- [ ] Implement `logTransition()` method
  - Create timeline entry
  - Store action, description
  - Store performed_by, performed_at
  - Store previous/new status
  - Store metadata
- [ ] Implement `getTimeline()` method
  - Retrieve all timeline entries for LC
  - Order by performed_at DESC
  - Include related data

#### LCValidationService

- [ ] Create service class
- [ ] Implement `validateApplyForLC()` method
  - Check LC is in draft status
  - Validate all required fields filled
  - Validate dates (issue < expiry, issue >= today)
- [ ] Implement `validateIssueLC()` method
  - Check LC is in applied status
  - Validate issuing bank exists and active
  - Validate reference number unique
  - Validate issue date in valid range
- [ ] Implement `validateAdviseLC()` method
  - Check LC is in issued status
  - Validate advising bank exists and active
  - Validate verification status
- [ ] Implement `validateShipGoods()` method
  - Check LC is in verified status
  - Validate shipping date <= today
  - Validate shipping date <= expiry date
  - Validate required shipment fields
- [ ] Implement `validateReceiveDocuments()` method
  - Check LC is in goods_shipped status
  - Validate all required documents submitted
  - Validate document types match required list
- [ ] Implement `validateForwardDocuments()` method
  - Check LC is in documents_received status
  - Validate documents complete
- [ ] Implement `validateVerifyDocuments()` method
  - Check LC is in documents_forwarded status
  - Validate verification status
- [ ] Implement business rule validators
  - Check expiry date not past
  - Check LC not in terminal status
  - Check user permissions

---

## Phase 3: API Layer (Days 6-8)

### 3.1 Form Requests

- [ ] Create `StoreMasterLCRequest` (validation for create)
- [ ] Create `UpdateMasterLCRequest` (validation for update)
- [ ] Create `ApplyLCRequest`
- [ ] Create `IssueLCRequest`
- [ ] Create `AdviseLCRequest`
- [ ] Create `ShipGoodsRequest`
- [ ] Create `ReceiveDocumentsRequest`
- [ ] Create `ForwardDocumentsRequest`
- [ ] Create `VerifyDocumentsRequest`
- [ ] Create `RejectLCRequest`

### 3.2 Resources (JSON Transformers)

- [ ] Create `MasterLCResource` (detailed LC data)
- [ ] Create `MasterLCListResource` (list view)
- [ ] Create `BankResource`
- [ ] Create `LCTimelineResource`

### 3.3 Controllers

#### MasterLCController (CRUD)

- [ ] Implement `index()` - List LCs with filters
- [ ] Implement `store()` - Create new LC
- [ ] Implement `show()` - Get single LC
- [ ] Implement `update()` - Update LC (draft only)
- [ ] Implement `destroy()` - Delete LC (draft only)
- [ ] Implement `generateNumber()` - Auto-generate LC number
- [ ] Implement `dropdownData()` - Get form dropdown data

#### MasterLCWorkflowController (Workflow Actions)

- [ ] Implement `apply()` - Apply for LC
- [ ] Implement `issue()` - Issue LC by bank
- [ ] Implement `advise()` - Advise/verify LC
- [ ] Implement `shipGoods()` - Record goods shipment
- [ ] Implement `receiveDocuments()` - Receive documents
- [ ] Implement `forwardDocuments()` - Forward documents
- [ ] Implement `verifyDocuments()` - Verify documents
- [ ] Implement `activate()` - Activate LC
- [ ] Implement `reject()` - Reject LC
- [ ] Implement `timeline()` - Get LC timeline
- [ ] Implement `statistics()` - Get LC statistics

#### BankController

- [ ] Implement `index()` - List active banks
- [ ] Implement `show()` - Get bank details

### 3.4 Routes

- [ ] Register CRUD routes
- [ ] Register workflow routes
- [ ] Register utility routes
- [ ] Add route middleware (auth, permissions)

### 3.5 Policies

- [ ] Create `MasterLCPolicy`
  - viewAny, view, create, update, delete
  - apply, issue, advise
  - shipGoods, receiveDocuments
  - forwardDocuments, verifyDocuments
  - activate, reject

---

## Phase 4: Frontend UI (Days 9-12)

### 4.1 Services

- [ ] Create/Update `masterLCService.js`
  - CRUD operations
  - Workflow transition methods
  - Timeline fetch
- [ ] Create `bankService.js`
  - List banks
  - Get bank details

### 4.2 Master LC Form (Create/Edit)

NOTE: UI remains UNCHANGED

- [ ] Verify existing form works
- [ ] Ensure beneficiary_info captured correctly
- [ ] Test form validation
- [ ] Test file uploads

### 4.3 Master LC List

- [ ] Update status badge colors for 11 statuses
- [ ] Update status filter dropdown
- [ ] Test filtering and pagination

### 4.4 Master LC Detail Page

- [ ] Keep existing information display
- [ ] Add LC Lifecycle Timeline component (NEW)
  - Visual progress indicator
  - Show all 11 steps
  - Highlight current step
  - Show completed steps with timestamps
  - Show who performed each action
- [ ] Add Workflow Actions section (NEW)
  - Conditionally show action buttons based on status
  - Apply for LC button (if draft)
  - Issue LC button (if applied, admin only)
  - Advise LC button (if issued, admin only)
  - Ship Goods button (if verified)
  - Submit Documents button (if goods shipped)
  - Forward Documents button (if docs received, admin only)
  - Verify Documents button (if docs forwarded, admin only)
  - Activate LC button (if docs verified, admin only)
  - Reject LC button (any non-terminal status)
- [ ] Create modal forms for each action
  - Apply LC Modal (remarks field)
  - Issue LC Modal (bank, reference, date, remarks)
  - Advise LC Modal (bank, verification status, remarks)
  - Ship Goods Modal (shipment details form)
  - Receive Documents Modal (document checklist)
  - Forward Documents Modal (confirmation)
  - Verify Documents Modal (verification result, discrepancies)
  - Activate LC Modal (confirmation)
  - Reject LC Modal (rejection reason)

### 4.5 Components

#### WorkflowTimeline Component

- [ ] Create visual timeline component
- [ ] Show 11 workflow steps
- [ ] Use icons for each step
- [ ] Color code by status (gray/pending, blue/current, green/complete)
- [ ] Show timestamps for completed steps
- [ ] Show user for completed steps
- [ ] Make expandable to show full timeline history

#### WorkflowActionModal Component

- [ ] Create reusable modal component
- [ ] Accept action type prop
- [ ] Render appropriate form fields
- [ ] Handle form submission
- [ ] Show loading state
- [ ] Show success/error messages

---

## Phase 5: Testing (Days 13-15)

### 5.1 Backend Unit Tests

- [ ] Test LCStatus enum transitions
- [ ] Test MasterLC model methods
- [ ] Test Bank model
- [ ] Test LCTimeline model
- [ ] Test LCWorkflowService methods
- [ ] Test LCTimelineService methods
- [ ] Test LCValidationService rules

### 5.2 Backend Feature Tests

- [ ] Test LC CRUD endpoints
- [ ] Test workflow transition endpoints
- [ ] Test Apply for LC
- [ ] Test Issue LC
- [ ] Test Advise LC
- [ ] Test Ship Goods
- [ ] Test Receive Documents
- [ ] Test Forward Documents
- [ ] Test Verify Documents
- [ ] Test Activate LC
- [ ] Test Reject LC
- [ ] Test Timeline endpoint
- [ ] Test invalid transitions (should fail)
- [ ] Test authorization checks

### 5.3 Frontend Component Tests

- [ ] Test WorkflowTimeline rendering
- [ ] Test WorkflowActionModal rendering
- [ ] Test status badges display correctly
- [ ] Test action buttons show conditionally
- [ ] Test modal forms validate correctly

### 5.4 Integration Tests

- [ ] Test complete LC lifecycle end-to-end
  1. Create draft LC
  2. Apply for LC
  3. Issue LC
  4. Advise LC
  5. Ship goods
  6. Receive documents
  7. Forward documents
  8. Verify documents
  9. Activate LC
- [ ] Test rejection at various stages
- [ ] Test expired LC handling
- [ ] Test invalid transition attempts
- [ ] Test authorization at each step

### 5.5 Browser Testing

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test responsive design (mobile/tablet/desktop)

---

## Phase 6: Documentation (Days 16-17)

### 6.1 API Documentation

- [ ] Generate Swagger/OpenAPI specs
- [ ] Document all endpoints
- [ ] Document request/response formats
- [ ] Document error codes
- [ ] Add example requests/responses

### 6.2 Developer Documentation

- [ ] Document workflow state machine
- [ ] Document timeline logging
- [ ] Document validation rules
- [ ] Document authorization matrix
- [ ] Create architecture diagrams
- [ ] Document database schema

### 6.3 User Documentation

- [ ] Create user guide for LC creation
- [ ] Create user guide for workflow actions
- [ ] Document status meanings
- [ ] Create FAQ
- [ ] Create video tutorials (optional)

---

## Phase 7: Deployment (Days 18-20)

### 7.1 Pre-Deployment

- [ ] Run all tests
- [ ] Code review
- [ ] Security audit
- [ ] Performance testing
- [ ] Database backup procedures
- [ ] Rollback plan

### 7.2 Database Migration

- [ ] Review migration files
- [ ] Test migrations on staging
- [ ] Plan migration downtime (if any)
- [ ] Execute migrations on production
- [ ] Verify data integrity

### 7.3 Deployment

- [ ] Deploy backend code
- [ ] Deploy frontend build
- [ ] Update environment variables
- [ ] Clear caches
- [ ] Restart services

### 7.4 Post-Deployment

- [ ] Verify all endpoints working
- [ ] Test critical workflows
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Notify stakeholders

---

## Phase 8: Post-Launch Support (Days 21-30)

### 8.1 Monitoring

- [ ] Set up application monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Create alerting rules

### 8.2 Optimization

- [ ] Analyze slow queries
- [ ] Add database indexes if needed
- [ ] Optimize API responses
- [ ] Add caching where appropriate
- [ ] Review and optimize frontend bundle size

### 8.3 User Feedback

- [ ] Collect user feedback
- [ ] Create feedback form
- [ ] Prioritize bug fixes
- [ ] Prioritize feature requests
- [ ] Plan iterations

---

## Risk Management

### Technical Risks

| Risk                                     | Impact | Mitigation Strategy                                       |
| ---------------------------------------- | ------ | --------------------------------------------------------- |
| Complex state machine bugs               | High   | Comprehensive unit tests, integration tests               |
| Data migration issues                    | High   | Test migrations thoroughly on staging, have rollback plan |
| Performance issues with timeline queries | Medium | Proper indexing, pagination, caching                      |
| Browser compatibility                    | Low    | Progressive enhancement, polyfills                        |

### Business Risks

| Risk                            | Impact | Mitigation Strategy                     |
| ------------------------------- | ------ | --------------------------------------- |
| User confusion with workflow    | Medium | Clear UI, tooltips, documentation       |
| Incorrect LC status transitions | High   | Strict validation, authorization checks |
| Data loss                       | High   | Regular backups, soft deletes           |

---

## Success Criteria

- [ ] All 11 LC statuses implemented and working
- [ ] All 8 workflow steps can be completed end-to-end
- [ ] Timeline correctly logs all transitions
- [ ] Authorization correctly enforced at each step
- [ ] UI remains simple with single bank field
- [ ] Backend correctly handles dual-bank architecture
- [ ] All tests passing (unit, feature, integration)
- [ ] API documentation complete
- [ ] Zero critical bugs in production
- [ ] User acceptance testing passed

---

## Project Timeline

| Phase                          | Duration | Dependencies |
| ------------------------------ | -------- | ------------ |
| Phase 1: Database & Foundation | 2 days   | None         |
| Phase 2: Business Logic        | 3 days   | Phase 1      |
| Phase 3: API Layer             | 3 days   | Phase 2      |
| Phase 4: Frontend UI           | 4 days   | Phase 3      |
| Phase 5: Testing               | 3 days   | Phase 4      |
| Phase 6: Documentation         | 2 days   | Phase 5      |
| Phase 7: Deployment            | 3 days   | Phase 6      |
| Phase 8: Post-Launch           | 10 days  | Phase 7      |

Total Duration: Approximately 30 days (6 weeks)

---

## Team Requirements

The following team members are required for successful project implementation:

- Backend Developer: Laravel expert with state machine implementation experience
- Frontend Developer: React expert with strong UI/UX focus
- QA Engineer: Test automation and API testing expertise
- DevOps Engineer: Deployment and monitoring capabilities
- Technical Lead: Architecture design and code review
- Project Manager: Coordination and stakeholder communication

---

End of Implementation Plan
