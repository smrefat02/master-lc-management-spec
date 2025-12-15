<?php

namespace App\Http\Controllers;

use App\Models\MasterLC;
use App\Models\Contract;
use App\Models\Buyer;
use App\Http\Requests\StoreMasterLCRequest;
use App\Http\Requests\UpdateMasterLCRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MasterLCController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/master-lc",
     *     tags={"Master LC"},
     *     summary="List all Master LCs",
     *     description="Get paginated list of Master LCs with optional filters",
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by LC status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"draft", "applied", "issued_by_issuing_bank", "verified_by_advising_bank", "goods_shipped", "documents_received", "documents_forwarded", "documents_verified", "active", "expired", "rejected"})
     *     ),
     *     @OA\Parameter(
     *         name="lc_number",
     *         in="query",
     *         description="Search by LC number",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="array", @OA\Items()),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = MasterLC::with(['contract.buyer', 'order']);

            // Apply filters
            if ($request->has('lc_number') && $request->lc_number) {
                $query->filterByLcNumber($request->lc_number);
            }

            if ($request->has('buyer') && $request->buyer) {
                $query->where(function ($q) use ($request) {
                    $q->whereRaw("JSON_EXTRACT(buyer_info, '$.name') LIKE ?", ['%' . $request->buyer . '%']);
                });
            }

            if ($request->has('status') && $request->status) {
                $query->filterByStatus($request->status);
            }

            if ($request->has('currency') && $request->currency) {
                $query->filterByCurrency($request->currency);
            }

            if ($request->has('issue_date_from') || $request->has('issue_date_to')) {
                $query->filterByIssueDateRange(
                    $request->issue_date_from,
                    $request->issue_date_to
                );
            }

            if ($request->has('expiry_date_from') || $request->has('expiry_date_to')) {
                $query->filterByExpiryDateRange(
                    $request->expiry_date_from,
                    $request->expiry_date_to
                );
            }

            if ($request->has('contract_id') && $request->contract_id) {
                $query->where('contract_id', $request->contract_id);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $masterLCs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $masterLCs->items(),
                'meta' => [
                    'current_page' => $masterLCs->currentPage(),
                    'per_page' => $masterLCs->perPage(),
                    'total' => $masterLCs->total(),
                    'last_page' => $masterLCs->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching Master LCs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/master-lc",
     *     tags={"Master LC"},
     *     summary="Create new Master LC",
     *     description="Create a new Master Letter of Credit",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"lc_number_mode", "issue_date", "expiry_date", "buyer_info", "beneficiary_info", "amount", "currency"},
     *             @OA\Property(property="contract_id", type="integer", example=1),
     *             @OA\Property(property="lc_number_mode", type="string", enum={"auto", "manual"}, example="auto"),
     *             @OA\Property(property="lc_number", type="string", example="LC-2025-001"),
     *             @OA\Property(property="issue_date", type="string", format="date", example="2025-01-01"),
     *             @OA\Property(property="expiry_date", type="string", format="date", example="2025-12-31"),
     *             @OA\Property(property="buyer_info", type="object"),
     *             @OA\Property(property="beneficiary_info", type="object"),
     *             @OA\Property(property="amount", type="number", example=100000),
     *             @OA\Property(property="currency", type="string", example="USD"),
     *             @OA\Property(property="required_documents", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="terms_and_conditions", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Master LC created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreMasterLCRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Set default status if not provided
            if (!isset($validated['status'])) {
                $validated['status'] = 'draft';
            }

            // Set created_by
            $validated['created_by'] = $request->user()?->email ?? 'system';

            // Create Master LC
            $masterLC = MasterLC::create($validated);

            // Load relationships
            $masterLC->load(['contract.buyer', 'order']);

            return response()->json([
                'success' => true,
                'message' => 'Master LC created successfully',
                'data' => $masterLC
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating Master LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/master-lc/{id}",
     *     tags={"Master LC"},
     *     summary="Get Master LC details",
     *     description="Get detailed information about a specific Master LC",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Master LC not found")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $masterLC = MasterLC::with(['contract.buyer', 'order'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $masterLC
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching Master LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}",
     *     tags={"Master LC"},
     *     summary="Update Master LC",
     *     description="Update Master LC (only in draft status)",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="expiry_date", type="string", format="date"),
     *             @OA\Property(property="amount", type="number"),
     *             @OA\Property(property="terms_and_conditions", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Master LC updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Cannot edit in current status"),
     *     @OA\Response(response=404, description="Master LC not found")
     * )
     */
    public function update(UpdateMasterLCRequest $request, $id): JsonResponse
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            // Check if can edit
            if (!$masterLC->canEdit()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot edit Master LC in current status',
                    'current_status' => $masterLC->status
                ], 403);
            }

            $validated = $request->validated();

            // Update Master LC
            $masterLC->update($validated);

            // Reload relationships
            $masterLC->load(['contract.buyer', 'order']);

            return response()->json([
                'success' => true,
                'message' => 'Master LC updated successfully',
                'data' => $masterLC
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating Master LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/master-lc/{id}",
     *     tags={"Master LC"},
     *     summary="Delete Master LC",
     *     description="Delete Master LC (only in draft status)",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Master LC deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string")
     *         )
     *     ),
     *     @OA\Response(response=403, description="Cannot delete in current status"),
     *     @OA\Response(response=404, description="Master LC not found")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            // Check if can delete
            if (!$masterLC->canDelete()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete Master LC in current status',
                    'current_status' => $masterLC->status
                ], 403);
            }

            // Delete attachments from storage
            if ($masterLC->attachments) {
                foreach ($masterLC->attachments as $attachment) {
                    if (isset($attachment['path'])) {
                        Storage::disk('public')->delete($attachment['path']);
                    }
                }
            }

            $masterLC->delete();

            return response()->json([
                'success' => true,
                'message' => 'Master LC deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting Master LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change the status of a Master LC.
     */
    public function changeStatus(Request $request, $id): JsonResponse
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:submitted,reviewed,approved,active,cancelled',
                'reason' => 'required_if:status,cancelled|string|max:1000',
            ]);

            $newStatus = $validated['status'];

            // Check if transition is valid
            if (!$masterLC->canTransitionTo($newStatus)) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot transition from {$masterLC->status} to {$newStatus}"
                ], 422);
            }

            // Update status
            $masterLC->status = $newStatus;

            // Set cancellation reason if cancelled
            if ($newStatus === 'cancelled' && isset($validated['reason'])) {
                $masterLC->cancellation_reason = $validated['reason'];
            }

            // Set approved_by if approved
            if ($newStatus === 'approved') {
                $masterLC->approved_by = $request->user()?->email ?? 'system';
            }

            $masterLC->save();

            return response()->json([
                'success' => true,
                'message' => "Status updated to {$newStatus}",
                'data' => $masterLC
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error changing status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload attachment to a Master LC.
     */
    public function uploadAttachment(Request $request, $id): JsonResponse
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
                'description' => 'nullable|string|max:255',
            ]);

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $storedName = time() . '_' . preg_replace('/[^A-Za-z0-9\.\-\_]/', '_', strtolower($originalName));
            
            // Store file
            $path = $file->storeAs("master_lc_attachments/{$id}", $storedName, 'public');

            // Get current attachments
            $attachments = $masterLC->attachments ?? [];

            // Add new attachment
            $newAttachment = [
                'id' => count($attachments) + 1,
                'original_name' => $originalName,
                'stored_name' => $storedName,
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'description' => $request->description ?? null,
                'uploaded_at' => now()->toIso8601String(),
                'uploaded_by' => $request->user()?->email ?? 'system',
            ];

            $attachments[] = $newAttachment;
            $masterLC->attachments = $attachments;
            $masterLC->save();

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => $newAttachment
            ], 201);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'File validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete attachment from a Master LC.
     */
    public function deleteAttachment($id, $attachmentId): JsonResponse
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            $attachments = $masterLC->attachments ?? [];
            $attachmentIndex = null;
            $attachment = null;

            foreach ($attachments as $index => $att) {
                if ($att['id'] == $attachmentId) {
                    $attachmentIndex = $index;
                    $attachment = $att;
                    break;
                }
            }

            if ($attachmentIndex === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found'
                ], 404);
            }

            // Delete file from storage
            if (isset($attachment['path'])) {
                Storage::disk('public')->delete($attachment['path']);
            }

            // Remove from array
            array_splice($attachments, $attachmentIndex, 1);
            $masterLC->attachments = $attachments;
            $masterLC->save();

            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download attachment from a Master LC.
     */
    public function downloadAttachment($id, $attachmentId)
    {
        try {
            $masterLC = MasterLC::findOrFail($id);

            $attachments = $masterLC->attachments ?? [];
            $attachment = null;

            foreach ($attachments as $att) {
                if ($att['id'] == $attachmentId) {
                    $attachment = $att;
                    break;
                }
            }

            if (!$attachment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found'
                ], 404);
            }

            $path = Storage::disk('public')->path($attachment['path']);

            if (!file_exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            return response()->download($path, $attachment['original_name']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Master LC not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error downloading file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a new LC number.
     */
    public function generateNumber(): JsonResponse
    {
        try {
            $lcNumber = MasterLC::generateLCNumber();

            return response()->json([
                'success' => true,
                'data' => [
                    'lc_number' => $lcNumber
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating LC number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dropdown data for forms.
     */
    public function dropdownData(): JsonResponse
    {
        try {
            // Get contracts
            $contracts = Contract::with('buyer')->get()->map(function ($contract) {
                return [
                    'id' => $contract->id,
                    'label' => $contract->contract_number . ' - ' . ($contract->buyer->name ?? 'N/A'),
                ];
            });

            // Get buyers
            $buyers = Buyer::all()->map(function ($buyer) {
                return [
                    'id' => $buyer->id,
                    'name' => $buyer->name,
                    'address' => $buyer->address ?? '',
                    'country' => $buyer->country ?? '',
                ];
            });

            // Static data
            $currencies = ['USD', 'EUR', 'GBP'];
            $statuses = ['draft', 'submitted', 'reviewed', 'approved', 'active', 'expired', 'cancelled'];
            $requiredDocumentOptions = [
                'Commercial Invoice',
                'Packing List',
                'Bill of Lading',
                'Certificate of Origin',
                'Inspection Certificate',
                'Insurance Certificate',
                'Weight Certificate',
                'Quality Certificate',
            ];

            // Banks - hardcoded for now (can be moved to database)
            $banks = [
                [
                    'id' => 1,
                    'name' => 'Standard Chartered Bank',
                    'account_number' => '12345678901234',
                    'swift_code' => 'SCBLBDDX',
                    'branch' => 'Corporate Branch, Dhaka',
                ],
                [
                    'id' => 2,
                    'name' => 'HSBC Bank',
                    'account_number' => '98765432109876',
                    'swift_code' => 'HSBCBDDH',
                    'branch' => 'Gulshan Branch, Dhaka',
                ],
                [
                    'id' => 3,
                    'name' => 'Citibank N.A.',
                    'account_number' => '55667788990011',
                    'swift_code' => 'CITIUS33',
                    'branch' => 'Main Branch, New York',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'contracts' => $contracts,
                    'buyers' => $buyers,
                    'banks' => $banks,
                    'currencies' => $currencies,
                    'statuses' => $statuses,
                    'required_document_options' => $requiredDocumentOptions,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dropdown data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Issue LC by Issuing Bank
     */
    public function issueBank(\App\Http\Requests\IssueMasterLCRequest $request, MasterLC $masterLc): JsonResponse
    {
        try {
            // Check if LC can be issued
            if (!$masterLc->canBeIssued()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot issue LC. Current status must be draft',
                    'current_status' => $masterLc->lc_status?->value
                ], 403);
            }

            // Update issuing bank fields
            $masterLc->update([
                'issuing_bank_id' => $request->issuing_bank_id,
                'issuing_bank_reference_no' => $request->issuing_bank_reference_no,
                'issuing_bank_issue_date' => $request->issuing_bank_issue_date,
                'lc_status' => \App\Enums\LCStatus::ISSUED,
            ]);

            // Load relationships
            $masterLc->load('issuingBank');

            return response()->json([
                'success' => true,
                'message' => 'LC has been issued by bank successfully',
                'data' => [
                    'id' => $masterLc->id,
                    'lc_status' => $masterLc->lc_status->value,
                    'issuing_bank' => [
                        'id' => $masterLc->issuingBank->id,
                        'name' => $masterLc->issuingBank->name,
                        'reference_no' => $masterLc->issuing_bank_reference_no,
                        'issue_date' => $masterLc->issuing_bank_issue_date->format('Y-m-d'),
                    ],
                    'status_changed_at' => $masterLc->updated_at->toIso8601String(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error issuing LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Advise/Verify LC by Advising Bank
     */
    public function adviseBank(\App\Http\Requests\AdviseMasterLCRequest $request, MasterLC $masterLc): JsonResponse
    {
        try {
            // Check if LC can be advised
            if (!$masterLc->canBeAdvised()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot advise LC. LC must be issued first',
                    'current_status' => $masterLc->lc_status?->value
                ], 403);
            }

            // Determine new LC status based on confirmation status
            $newLCStatus = match($request->advising_bank_confirmation_status) {
                'verified' => \App\Enums\LCStatus::VERIFIED,
                'rejected' => \App\Enums\LCStatus::REJECTED,
                default => \App\Enums\LCStatus::ISSUED,
            };

            // Update advising bank fields
            $masterLc->update([
                'advising_bank_id' => $request->advising_bank_id,
                'advising_bank_confirmation_status' => $request->advising_bank_confirmation_status,
                'advising_bank_verified_at' => now(),
                'lc_status' => $newLCStatus,
            ]);

            // Load relationships
            $masterLc->load('advisingBank');

            $message = match($request->advising_bank_confirmation_status) {
                'verified' => 'LC has been verified by advising bank',
                'rejected' => 'LC has been rejected by advising bank',
                default => 'LC advising status updated',
            };

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'id' => $masterLc->id,
                    'lc_status' => $masterLc->lc_status->value,
                    'advising_bank' => [
                        'id' => $masterLc->advisingBank->id,
                        'name' => $masterLc->advisingBank->name,
                        'confirmation_status' => $masterLc->advising_bank_confirmation_status,
                        'verified_at' => $masterLc->advising_bank_verified_at->toIso8601String(),
                    ],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error advising LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update document tracking timestamps
     */
    public function updateDocuments(\App\Http\Requests\UpdateDocumentsRequest $request, MasterLC $masterLc): JsonResponse
    {
        try {
            // Check if documents can be updated
            if (!$masterLc->canUpdateDocuments()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update documents. LC must be verified or active',
                    'current_status' => $masterLc->lc_status?->value
                ], 403);
            }

            $updateData = [];

            if ($request->has('documents_received_at')) {
                $updateData['documents_received_at'] = $request->documents_received_at;
            }

            if ($request->has('documents_forwarded_to_bank_at')) {
                $updateData['documents_forwarded_to_bank_at'] = $request->documents_forwarded_to_bank_at;
            }

            if ($request->has('documents_verified_at')) {
                $updateData['documents_verified_at'] = $request->documents_verified_at;
                
                // If all documents are verified and status is verified, change to active
                if ($masterLc->lc_status === \App\Enums\LCStatus::VERIFIED) {
                    $updateData['lc_status'] = \App\Enums\LCStatus::ACTIVE;
                }
            }

            $masterLc->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Document tracking updated successfully',
                'data' => [
                    'id' => $masterLc->id,
                    'lc_status' => $masterLc->lc_status->value,
                    'document_tracking' => [
                        'received_at' => $masterLc->documents_received_at?->toIso8601String(),
                        'forwarded_to_bank_at' => $masterLc->documents_forwarded_to_bank_at?->toIso8601String(),
                        'verified_at' => $masterLc->documents_verified_at?->toIso8601String(),
                    ],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating document tracking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ============================================
    // v3.0 Workflow Endpoints
    // ============================================

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/apply",
     *     tags={"Master LC Workflow"},
     *     summary="Apply for LC (Step 2)",
     *     description="Importer applies for LC after agreeing on contract. Transitions from draft to applied.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="applicant_remarks", type="string", maxLength=1000)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="LC application submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function apply(\App\Http\Requests\ApplyLCRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->applyForLC($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'LC application submitted successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Apply LC error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/issue",
     *     tags={"Master LC Workflow"},
     *     summary="Issue LC (Step 3)",
     *     description="Issuing bank issues LC. Transitions from applied to issued_by_issuing_bank.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"issuing_bank_id", "issuing_bank_reference_no", "issuing_bank_issue_date"},
     *             @OA\Property(property="issuing_bank_id", type="integer"),
     *             @OA\Property(property="issuing_bank_reference_no", type="string"),
     *             @OA\Property(property="issuing_bank_issue_date", type="string", format="date"),
     *             @OA\Property(property="issuer_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="LC issued successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function issue(\App\Http\Requests\IssueLCRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->issueLC($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'LC issued successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Issue LC error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/advise",
     *     tags={"Master LC Workflow"},
     *     summary="Advise/Verify LC (Step 4)",
     *     description="Advising bank verifies LC. Transitions from issued_by_issuing_bank to verified_by_advising_bank.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"advising_bank_id", "advising_bank_verification_status"},
     *             @OA\Property(property="advising_bank_id", type="integer"),
     *             @OA\Property(property="advising_bank_verification_status", type="string", enum={"verified", "rejected"}),
     *             @OA\Property(property="advisor_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="LC advised successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function advise(\App\Http\Requests\AdviseLCRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->adviseLC($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'LC advised successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error advising LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/ship-goods",
     *     tags={"Master LC Workflow"},
     *     summary="Ship Goods (Step 5)",
     *     description="Record goods shipment. Transitions from verified_by_advising_bank to goods_shipped.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"shipping_date", "carrier", "bill_of_lading_no"},
     *             @OA\Property(property="shipment_id", type="integer"),
     *             @OA\Property(property="shipping_date", type="string", format="date"),
     *             @OA\Property(property="carrier", type="string"),
     *             @OA\Property(property="vessel_name", type="string"),
     *             @OA\Property(property="bill_of_lading_no", type="string"),
     *             @OA\Property(property="port_of_loading", type="string"),
     *             @OA\Property(property="port_of_discharge", type="string"),
     *             @OA\Property(property="shipper_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Goods shipment recorded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function shipGoods(\App\Http\Requests\ShipGoodsRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->shipGoods($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'Goods shipment recorded successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error recording goods shipment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/documents/receive",
     *     tags={"Master LC Workflow"},
     *     summary="Receive Documents (Step 6)",
     *     description="Record document receipt from exporter. Transitions from goods_shipped to documents_received.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"received_documents"},
     *             @OA\Property(
     *                 property="received_documents",
     *                 type="array",
     *                 @OA\Items(type="string"),
     *                 example={"commercial_invoice", "packing_list", "bill_of_lading"}
     *             ),
     *             @OA\Property(property="receiver_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documents received",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function receiveDocuments(\App\Http\Requests\ReceiveDocumentsRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->receiveDocuments($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'Documents received successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error receiving documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/documents/forward",
     *     tags={"Master LC Workflow"},
     *     summary="Forward Documents (Step 7)",
     *     description="Forward documents to issuing bank. Transitions from documents_received to documents_forwarded.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"forwarded_to_bank_id"},
     *             @OA\Property(property="forwarded_to_bank_id", type="integer"),
     *             @OA\Property(property="forwarder_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documents forwarded successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function forwardDocuments(\App\Http\Requests\ForwardDocumentsRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->forwardDocuments($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'Documents forwarded successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error forwarding documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/documents/verify",
     *     tags={"Master LC Workflow"},
     *     summary="Verify Documents (Step 8)",
     *     description="Issuing bank verifies documents. Transitions from documents_forwarded to documents_verified.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"verification_status"},
     *             @OA\Property(property="verification_status", type="string", enum={"verified", "rejected"}),
     *             @OA\Property(property="verifier_remarks", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Documents verified successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function verifyDocuments(\App\Http\Requests\VerifyDocumentsRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->verifyDocuments($masterLC, $request->validated());

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'Documents verified successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verifying documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/activate",
     *     tags={"Master LC Workflow"},
     *     summary="Activate LC (Step 9)",
     *     description="Final activation of LC. Transitions from documents_verified to active.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="LC activated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function activate(MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->activateLC($masterLC);

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'LC activated successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error activating LC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/master-lc/{id}/reject",
     *     tags={"Master LC Workflow"},
     *     summary="Reject LC",
     *     description="Reject LC at any workflow stage. Transitions to rejected status.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"rejection_reason"},
     *             @OA\Property(property="rejection_reason", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="LC rejected successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function reject(\App\Http\Requests\RejectLCRequest $request, MasterLC $masterLC): JsonResponse
    {
        try {
            $workflowService = app(\App\Services\LCWorkflowService::class);
            $masterLC = $workflowService->rejectLC($masterLC, $request->validated()['rejection_reason']);

            // Reload with relationships
            $masterLC->load(['contract', 'order', 'issuingBank', 'advisingBank', 'shipment']);

            return response()->json([
                'success' => true,
                'message' => 'LC rejected successfully',
                'data' => $masterLC->toArray()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Reject LC error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/master-lc/{id}/timeline",
     *     tags={"Master LC Workflow"},
     *     summary="Get LC Timeline",
     *     description="Retrieve complete workflow history with timestamps and actions.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Timeline retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="step", type="string"),
     *                     @OA\Property(property="status", type="string"),
     *                     @OA\Property(property="timestamp", type="string", format="date-time"),
     *                     @OA\Property(property="actor", type="string"),
     *                     @OA\Property(property="remarks", type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function timeline(MasterLC $masterLC): JsonResponse
    {
        try {
            $timelineService = app(\App\Services\LCTimelineService::class);
            $timeline = $timelineService->getFormattedTimeline($masterLC);

            return response()->json([
                'success' => true,
                'data' => $timeline
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching LC timeline',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
