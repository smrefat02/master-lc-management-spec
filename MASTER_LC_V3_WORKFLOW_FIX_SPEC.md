# Master LC v3.0 Workflow Fix Specification

## Problem Statement

The Master LC v3.0 workflow actions (apply, issue, advise, shipGoods, receiveDocuments, forwardDocuments, verifyDocuments, activate, reject) are failing with "Action failed" errors.

## Root Cause Analysis

### Issues Identified:

1. **Response Structure Mismatch**

   - Frontend expects: `result.data` where result is the direct API response
   - Backend returns: `{ success: true, message: "...", data: masterLC }`
   - Frontend accesses: `onUpdate(result.data)` - This works correctly if API returns the nested structure

2. **Model Relationships Not Loading**

   - Controller returns MasterLC model but doesn't eager load relationships
   - Frontend needs `masterLC.issuing_bank`, `masterLC.advising_bank`, `masterLC.contract`, `masterLC.order`
   - Missing relationships cause display issues

3. **Route Model Binding Parameter Case Sensitivity**

   - Routes use: `{masterLC}` (camelCase)
   - Laravel expects exact parameter name match with controller method
   - Need to ensure consistency

4. **FormRequest Validation Not Working**

   - ApplyLCRequest class may not exist or has issues
   - Need to verify all FormRequest classes are properly created

5. **Service Layer Error Handling**
   - LCWorkflowService may throw exceptions that aren't properly caught
   - Need comprehensive error messages

## Solution Specification

### 1. Backend Controller Fixes

#### 1.1 Add Relationship Eager Loading

**File**: `backend/app/Http/Controllers/MasterLCController.php`

**Changes**:

- After each workflow action, reload the model with relationships
- Return consistent response structure

```php
// After workflow service call, reload with relationships
$masterLC->load([
    'contract',
    'order',
    'issuingBank',
    'advisingBank',
    'shipment',
    'timeline'
]);

return response()->json([
    'success' => true,
    'message' => 'Action completed successfully',
    'data' => $masterLC
]);
```

#### 1.2 Consistent Error Handling

All workflow methods should follow this pattern:

```php
public function methodName(FormRequest $request, MasterLC $masterLC): JsonResponse
{
    try {
        $workflowService = app(LCWorkflowService::class);
        $masterLC = $workflowService->methodName($masterLC, $request->validated());

        // Reload with relationships
        $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

        return response()->json([
            'success' => true,
            'message' => 'Action completed successfully',
            'data' => $masterLC
        ]);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Workflow error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### 2. FormRequest Classes

#### 2.1 ApplyLCRequest

**File**: `backend/app/Http/Requests/ApplyLCRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Add proper authorization later
    }

    public function rules(): array
    {
        return [
            'applicant_remarks' => 'nullable|string|max:1000',
        ];
    }
}
```

#### 2.2 RejectLCRequest

**File**: `backend/app/Http/Requests/RejectLCRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RejectLCRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => 'required|string|min:10|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'rejection_reason.required' => 'Please provide a reason for rejection',
            'rejection_reason.min' => 'Rejection reason must be at least 10 characters',
        ];
    }
}
```

### 3. Service Layer Fixes

#### 3.1 LCWorkflowService Error Messages

**File**: `backend/app/Services/LCWorkflowService.php`

**Changes**:

- All validation failures should throw clear exception messages
- Use LCValidationService for all validations
- Wrap in DB transactions

```php
public function applyForLC(MasterLC $masterLC, array $data): MasterLC
{
    try {
        DB::beginTransaction();

        // Validate transition
        $this->validator->validateApply($masterLC);

        // Update LC
        $masterLC->update([
            'lc_status' => LCStatus::APPLIED->value,
            'applied_at' => now(),
            'applicant_remarks' => $data['applicant_remarks'] ?? null,
        ]);

        // Log timeline
        $this->timeline->log(
            $masterLC,
            LCAction::APPLIED,
            'LC application submitted',
            LCStatus::DRAFT,
            LCStatus::APPLIED,
            $data['applicant_remarks'] ?? null
        );

        DB::commit();
        return $masterLC->fresh();

    } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
    }
}
```

### 4. API Route Fixes

**File**: `backend/routes/api.php`

Ensure routes use consistent parameter naming:

```php
// Master LC v3.0 Workflow routes (8-step LC lifecycle)
Route::put('/master-lc/{masterLC}/apply', [MasterLCController::class, 'apply']);
Route::put('/master-lc/{masterLC}/issue', [MasterLCController::class, 'issue']);
Route::put('/master-lc/{masterLC}/advise', [MasterLCController::class, 'advise']);
Route::put('/master-lc/{masterLC}/ship-goods', [MasterLCController::class, 'shipGoods']);
Route::put('/master-lc/{masterLC}/documents/receive', [MasterLCController::class, 'receiveDocuments']);
Route::put('/master-lc/{masterLC}/documents/forward', [MasterLCController::class, 'forwardDocuments']);
Route::put('/master-lc/{masterLC}/documents/verify', [MasterLCController::class, 'verifyDocuments']);
Route::put('/master-lc/{masterLC}/activate', [MasterLCController::class, 'activate']);
Route::put('/master-lc/{masterLC}/reject', [MasterLCController::class, 'reject']);
Route::get('/master-lc/{masterLC}/timeline', [MasterLCController::class, 'timeline']);
```

### 5. Frontend Fixes

#### 5.1 Error Handling in WorkflowActions

**File**: `frontend/src/components/WorkflowActions.jsx`

```jsx
const handleSubmit = async () => {
  if (!masterLC) return;

  setLoading(true);
  try {
    const action = Object.entries({
      "Apply for LC": "apply",
      "Issue LC": "issue",
      "Verify LC": "advise",
      "Record Goods Shipment": "shipGoods",
      "Receive Documents": "receiveDocuments",
      "Forward Documents": "forwardDocuments",
      "Verify Documents": "verifyDocuments",
      "Activate LC": "activate",
      "Reject LC": "reject",
    }).find(([key]) => key === modalConfig.title)?.[1];

    if (!action) {
      alert("Unknown action");
      return;
    }

    let result;
    const id = masterLC.id;

    switch (action) {
      case "apply":
        result = await masterLCService.apply(id, formData);
        break;
      case "issue":
        result = await masterLCService.issue(id, formData);
        break;
      case "advise":
        result = await masterLCService.advise(id, formData);
        break;
      case "shipGoods":
        result = await masterLCService.shipGoods(id, formData);
        break;
      case "receiveDocuments":
        result = await masterLCService.receiveDocuments(id, formData);
        break;
      case "forwardDocuments":
        result = await masterLCService.forwardDocuments(id, formData);
        break;
      case "verifyDocuments":
        result = await masterLCService.verifyDocuments(id, formData);
        break;
      case "activate":
        result = await masterLCService.activate(id);
        break;
      case "reject":
        result = await masterLCService.reject(id, formData);
        break;
      default:
        throw new Error("Invalid action");
    }

    setShowModal(false);
    setFormData({});

    // Check if result has success property
    if (result.success && result.data) {
      if (onUpdate) onUpdate(result.data);
    } else {
      // Handle unexpected response format
      console.error("Unexpected response format:", result);
      alert("Action completed but response format unexpected");
    }
  } catch (error) {
    console.error("Workflow action error:", error);

    // Better error messages
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Action failed";

    alert(errorMessage);

    // Log validation errors if present
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors);
    }
  } finally {
    setLoading(false);
  }
};
```

## Implementation Checklist

### Backend Tasks

- [ ] 1. Verify all FormRequest classes exist (ApplyLCRequest, RejectLCRequest, etc.)
- [ ] 2. Update MasterLCController.apply() to use ApplyLCRequest and add relationship loading
- [ ] 3. Update MasterLCController.reject() to use RejectLCRequest and add relationship loading
- [ ] 4. Add relationship eager loading to all workflow controller methods
- [ ] 5. Add error logging to all workflow controller methods
- [ ] 6. Update LCWorkflowService.applyForLC() to handle optional applicant_remarks
- [ ] 7. Update LCWorkflowService.rejectLC() to handle rejection_reason
- [ ] 8. Verify LCValidationService.validateApply() exists and works
- [ ] 9. Verify LCValidationService.validateReject() exists and works
- [ ] 10. Test all API endpoints with Postman/curl

### Frontend Tasks

- [ ] 11. Update WorkflowActions error handling
- [ ] 12. Add loading states during API calls
- [ ] 13. Add success notifications
- [ ] 14. Test all workflow transitions in UI

## Testing Plan

### Unit Tests

1. Test each FormRequest validation rules
2. Test LCValidationService methods
3. Test LCWorkflowService transaction rollback

### Integration Tests

1. Test complete workflow: Draft → Applied → Issued → ... → Active
2. Test rejection at each stage
3. Test validation failures
4. Test with missing relationships

### Manual Testing

1. Apply for LC with empty remarks (should work)
2. Apply for LC with remarks (should work)
3. Reject LC without reason (should fail with validation error)
4. Reject LC with short reason (should fail with validation error)
5. Reject LC with valid reason (should work)
6. Verify all relationships load correctly after each action

## Success Criteria

1. ✅ All workflow actions complete without "Action failed" errors
2. ✅ Proper validation messages shown for invalid input
3. ✅ All relationships load correctly after workflow actions
4. ✅ Timeline updates after each action
5. ✅ WorkflowDiagram updates to show current step
6. ✅ Error messages are clear and actionable
7. ✅ No console errors in browser
8. ✅ No errors in Laravel logs

## Rollback Plan

If implementation fails:

1. Revert controller changes
2. Keep FormRequest classes (no harm)
3. Revert service layer changes
4. Use v2.0 workflow endpoints temporarily
