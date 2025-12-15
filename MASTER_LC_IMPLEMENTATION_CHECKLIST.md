# Master LC Implementation Checklist

## Quick Reference

- **Total Tasks**: 120+
- **Estimated Time**: 30 days
- **Team Size**: 6 people
- **Status Legend**: ☐ Not Started | ⧗ In Progress | ✓ Complete

---

## BACKEND TASKS

### Database (15 tasks)

- [ ] 1. Create banks table migration
- [ ] 2. Create lc_timelines table migration
- [ ] 3. Add issuing_bank_id to master_lcs
- [ ] 4. Add issuing_bank_reference_no to master_lcs
- [ ] 5. Add issuing_bank_issue_date to master_lcs
- [ ] 6. Add advising_bank_id to master_lcs
- [ ] 7. Add advising_bank_verification_status to master_lcs
- [ ] 8. Add advising_bank_verified_at to master_lcs
- [ ] 9. Add workflow timestamp fields (applied_at, issued_at, etc.)
- [ ] 10. Update lc_status enum to 11 values
- [ ] 11. Add shipment_data JSON field
- [ ] 12. Add submitted_documents JSON field
- [ ] 13. Add rejection fields (reason, rejected_at, rejected_by)
- [ ] 14. Add foreign key constraints
- [ ] 15. Seed banks data (10+ banks)

### Enums & Constants (8 tasks)

- [ ] 16. Create LCStatus enum with 11 states
- [ ] 17. Add label() method to LCStatus
- [ ] 18. Add color() method to LCStatus
- [ ] 19. Add isTerminal() method to LCStatus
- [ ] 20. Add allowedTransitions() method to LCStatus
- [ ] 21. Add canTransitionTo() method to LCStatus
- [ ] 22. Create LCAction enum for timeline
- [ ] 23. Create constants for currencies and document types

### Models (18 tasks)

- [ ] 24. Create Bank model
- [ ] 25. Add Bank relationships (issuingMasterLCs, advisingMasterLCs)
- [ ] 26. Create LCTimeline model
- [ ] 27. Add LCTimeline relationship to MasterLC
- [ ] 28. Update MasterLC fillable array with new fields
- [ ] 29. Update MasterLC casts array
- [ ] 30. Add issuingBank() relationship
- [ ] 31. Add advisingBank() relationship
- [ ] 32. Add timeline() relationship
- [ ] 33. Add canApply() method
- [ ] 34. Add canIssue() method
- [ ] 35. Add canAdvise() method
- [ ] 36. Add canShipGoods() method
- [ ] 37. Add canReceiveDocuments() method
- [ ] 38. Add canForwardDocuments() method
- [ ] 39. Add canVerifyDocuments() method
- [ ] 40. Add canActivate() method
- [ ] 41. Add helper methods (getStatusLabel, getAllowedTransitions, etc.)

### Services (25 tasks)

**LCWorkflowService:**

- [ ] 42. Create LCWorkflowService class
- [ ] 43. Implement applyForLC() method
- [ ] 44. Implement issueLC() method
- [ ] 45. Implement adviseLC() method
- [ ] 46. Implement shipGoods() method
- [ ] 47. Implement receiveDocuments() method
- [ ] 48. Implement forwardDocuments() method
- [ ] 49. Implement verifyDocuments() method
- [ ] 50. Implement activateLC() method
- [ ] 51. Implement rejectLC() method
- [ ] 52. Implement canTransitionTo() validation

**LCTimelineService:**

- [ ] 53. Create LCTimelineService class
- [ ] 54. Implement logTransition() method
- [ ] 55. Implement getTimeline() method

**LCValidationService:**

- [ ] 56. Create LCValidationService class
- [ ] 57. Implement validateApplyForLC()
- [ ] 58. Implement validateIssueLC()
- [ ] 59. Implement validateAdviseLC()
- [ ] 60. Implement validateShipGoods()
- [ ] 61. Implement validateReceiveDocuments()
- [ ] 62. Implement validateForwardDocuments()
- [ ] 63. Implement validateVerifyDocuments()
- [ ] 64. Implement validateActivateLC()
- [ ] 65. Implement validateRejectLC()
- [ ] 66. Add business rule validators (expiry, permissions, etc.)

### Form Requests (9 tasks)

- [ ] 67. Create ApplyLCRequest
- [ ] 68. Create IssueLCRequest
- [ ] 69. Create AdviseLCRequest
- [ ] 70. Create ShipGoodsRequest
- [ ] 71. Create ReceiveDocumentsRequest
- [ ] 72. Create ForwardDocumentsRequest
- [ ] 73. Create VerifyDocumentsRequest
- [ ] 74. Create RejectLCRequest
- [ ] 75. Update StoreMasterLCRequest and UpdateMasterLCRequest

### Controllers (18 tasks)

**MasterLCController:**

- [ ] 76. Verify index() works with new fields
- [ ] 77. Verify store() works
- [ ] 78. Verify show() includes new relationships
- [ ] 79. Verify update() works (draft only)
- [ ] 80. Verify destroy() works (draft only)

**MasterLCWorkflowController:**

- [ ] 81. Create MasterLCWorkflowController
- [ ] 82. Implement apply() endpoint
- [ ] 83. Implement issue() endpoint
- [ ] 84. Implement advise() endpoint
- [ ] 85. Implement shipGoods() endpoint
- [ ] 86. Implement receiveDocuments() endpoint
- [ ] 87. Implement forwardDocuments() endpoint
- [ ] 88. Implement verifyDocuments() endpoint
- [ ] 89. Implement activate() endpoint
- [ ] 90. Implement reject() endpoint
- [ ] 91. Implement timeline() endpoint
- [ ] 92. Implement statistics() endpoint

**BankController:**

- [ ] 93. Create BankController
- [ ] 94. Implement index() endpoint
- [ ] 95. Implement show() endpoint

### Routes & Policies (6 tasks)

- [ ] 96. Register workflow routes in api.php
- [ ] 97. Register bank routes in api.php
- [ ] 98. Create MasterLCPolicy
- [ ] 99. Add workflow action authorization methods
- [ ] 100. Register policy in AuthServiceProvider
- [ ] 101. Add route middleware

---

## FRONTEND TASKS

### Services (3 tasks)

- [ ] 102. Create/update masterLCService.js with workflow methods
- [ ] 103. Create bankService.js
- [ ] 104. Add error handling and loading states

### Components (12 tasks)

**WorkflowTimeline:**

- [ ] 105. Create WorkflowTimeline component
- [ ] 106. Show 11-step visual progress
- [ ] 107. Highlight current step
- [ ] 108. Show timestamps and users for completed steps

**WorkflowActionModal:**

- [ ] 109. Create reusable modal component
- [ ] 110. Create Apply LC form
- [ ] 111. Create Issue LC form
- [ ] 112. Create Advise LC form
- [ ] 113. Create Ship Goods form
- [ ] 114. Create Receive Documents form
- [ ] 115. Create Forward Documents form
- [ ] 116. Create Verify Documents form
- [ ] 117. Create Reject LC form

### Pages (6 tasks)

**MasterLCDetail:**

- [ ] 118. Add WorkflowTimeline component
- [ ] 119. Add workflow action buttons (conditional)
- [ ] 120. Wire up modal forms
- [ ] 121. Test all workflow transitions

**MasterLCList:**

- [ ] 122. Update status badge colors for 11 statuses
- [ ] 123. Update status filter dropdown

---

## TESTING TASKS

### Unit Tests (10 tasks)

- [ ] 124. Test LCStatus enum methods
- [ ] 125. Test MasterLC model methods
- [ ] 126. Test Bank model
- [ ] 127. Test LCTimeline model
- [ ] 128. Test LCWorkflowService
- [ ] 129. Test LCTimelineService
- [ ] 130. Test LCValidationService
- [ ] 131. Test Form Requests
- [ ] 132. Test React components
- [ ] 133. Test service classes

### Integration Tests (8 tasks)

- [ ] 134. Test complete LC lifecycle (draft → active)
- [ ] 135. Test rejection at each stage
- [ ] 136. Test expiry handling
- [ ] 137. Test invalid transitions
- [ ] 138. Test authorization checks
- [ ] 139. Test timeline logging
- [ ] 140. Test edge cases
- [ ] 141. Browser compatibility testing

---

## DOCUMENTATION TASKS

### API Documentation (4 tasks)

- [ ] 142. Generate Swagger/OpenAPI specs
- [ ] 143. Document all endpoints with examples
- [ ] 144. Document error responses
- [ ] 145. Add authentication documentation

### Developer Documentation (4 tasks)

- [ ] 146. Document state machine
- [ ] 147. Document timeline system
- [ ] 148. Create architecture diagrams
- [ ] 149. Document database schema

### User Documentation (3 tasks)

- [ ] 150. Create user guide
- [ ] 151. Document workflow steps
- [ ] 152. Create FAQ

---

## DEPLOYMENT TASKS

### Pre-Deployment (5 tasks)

- [ ] 153. Run all tests
- [ ] 154. Code review
- [ ] 155. Security audit
- [ ] 156. Performance testing
- [ ] 157. Create rollback plan

### Deployment (6 tasks)

- [ ] 158. Backup production database
- [ ] 159. Run migrations on production
- [ ] 160. Deploy backend code
- [ ] 161. Build and deploy frontend
- [ ] 162. Update environment variables
- [ ] 163. Verify deployment

### Post-Deployment (4 tasks)

- [ ] 164. Smoke test critical paths
- [ ] 165. Monitor error logs
- [ ] 166. Monitor performance
- [ ] 167. Notify stakeholders

---

## PROGRESS TRACKING

### Phase Completion

- [ ] Phase 1: Database & Foundation (0/23)
- [ ] Phase 2: Business Logic (0/43)
- [ ] Phase 3: API Layer (0/26)
- [ ] Phase 4: Frontend (0/21)
- [ ] Phase 5: Testing (0/18)
- [ ] Phase 6: Documentation (0/11)
- [ ] Phase 7: Deployment (0/15)

### Overall Progress

**0% Complete (0/167 tasks)**

---

## PRIORITY LEVELS

### P0 - Critical (Must Have)

- All database migrations
- All workflow transition endpoints
- State machine validation
- Timeline logging
- Frontend workflow UI

### P1 - High (Should Have)

- Comprehensive validation
- Authorization/permissions
- Error handling
- Timeline display
- Status badges

### P2 - Medium (Nice to Have)

- Statistics endpoint
- Advanced filtering
- Performance optimization
- Caching

### P3 - Low (Future Enhancement)

- Email notifications
- Batch operations
- Advanced reporting
- Export functionality

---

**Last Updated**: 2025-01-15
**Next Review**: Daily standup
