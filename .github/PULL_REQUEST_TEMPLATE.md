# Pull Request: [Feature Name]

## Description

Brief description of what this PR implements.

## Related Tasks

List the task IDs from tasks.md that this PR completes:

- [ ] T000: Task description

## Type of Change

- [ ] New feature (non-breaking change which adds functionality)
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Implementation Details

### Backend Changes

- List API endpoints added/modified
- Mention validation rules implemented
- Note any database migrations

### Frontend Changes

- List components added/modified
- Describe UI/UX changes
- Mention any new dependencies

## Testing

### Backend Tests (PHPUnit)

- [ ] All existing tests pass (`php artisan test`)
- [ ] New tests added for new endpoints
- [ ] Validation tests included
- [ ] Feature tests cover happy path and error cases

**Test files added/modified:**

- `backend/tests/Feature/ContractControllerTest.php`
- (list others)

### Frontend Tests (Playwright)

- [ ] All existing E2E tests pass (`npx playwright test`)
- [ ] New E2E tests added for new features
- [ ] Tests cover user workflows
- [ ] Tests include error handling scenarios

**Test files added/modified:**

- `frontend/tests/playwright/add-contract.spec.ts`
- (list others)

### Manual Testing Checklist

- [ ] Tested in Chrome/Edge
- [ ] Tested in Firefox
- [ ] Tested responsive design (mobile/tablet)
- [ ] Tested validation error messages
- [ ] Tested loading states
- [ ] Tested empty states

## Database Changes

- [ ] No database changes
- [ ] Migration files included
- [ ] Seeders updated (if applicable)
- [ ] Foreign key constraints verified

**Migration files:**

- `database/migrations/YYYY_MM_DD_HHMMSS_create_contracts_table.php`
- (list others)

## API Documentation

- [ ] API endpoints documented in README
- [ ] cURL examples provided
- [ ] Request/response examples added

## Code Quality

- [ ] Code follows Laravel best practices
- [ ] Code follows React best practices
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Inline comments added for complex logic
- [ ] Variable/function names are descriptive

## Validation

- [ ] Frontend validation matches backend validation
- [ ] Error messages are user-friendly
- [ ] All required fields validated
- [ ] Date constraints enforced
- [ ] Numeric ranges checked

## Security Considerations

- [ ] No sensitive data exposed in responses
- [ ] SQL injection protected (using Eloquent/Query Builder)
- [ ] XSS protection (React handles by default)
- [ ] CSRF protection verified (if applicable)
- [ ] Input sanitization implemented

## Performance

- [ ] No N+1 query issues (checked with Debugbar)
- [ ] Eager loading used where appropriate
- [ ] Frontend components optimized (no unnecessary re-renders)
- [ ] Images optimized (if applicable)

## Deployment Notes

Any special instructions for deployment:

- Environment variables to add
- Configuration changes needed
- Post-deployment steps

## Screenshots

Add screenshots or GIFs demonstrating the changes:

### Before

(if applicable)

### After

(show the new feature/fix)

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes

Any additional context, blockers, or follow-up tasks:
