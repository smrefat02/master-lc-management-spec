<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Models\Contract;
use App\Services\ContractNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    protected ContractNumberService $contractNumberService;

    public function __construct(ContractNumberService $contractNumberService)
    {
        $this->contractNumberService = $contractNumberService;
    }
    /**
     * Display a paginated list of contracts with summary statistics.
     * Supports search and filter parameters.
     */
    public function index(Request $request)
    {
        // Validate pagination and filter parameters
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:draft,active,pending,completed,cancelled',
        ]);

        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $status = $request->input('status');
        
        // Build query with search and filter scopes
        $query = Contract::with('buyer')
            ->search($search)
            ->byStatus($status)
            ->orderBy('created_at', 'desc');
        
        // Paginate results
        $contracts = $query->paginate($perPage);
        
        // Calculate summary statistics based on filtered results
        $summaryQuery = Contract::query()
            ->search($search)
            ->byStatus($status);
            
        $summary = [
            'total_contracts' => $summaryQuery->count(),
            'total_value_usd' => $summaryQuery->sum('value_usd'),
            'total_order_quantity' => $summaryQuery->sum('order_quantity'),
            'avg_b2b_percent' => $summaryQuery->avg('b2b_percent'),
        ];
        
        return response()->json([
            'contracts' => $contracts->items(),
            'pagination' => [
                'current_page' => $contracts->currentPage(),
                'per_page' => $contracts->perPage(),
                'total' => $contracts->total(),
                'last_page' => $contracts->lastPage(),
            ],
            'summary' => $summary,
        ]);
    }

    /**
     * Display a single contract with buyer details.
     */
    public function show($id)
    {
        $contract = Contract::with('buyer')->find($id);

        if (!$contract) {
            return response()->json([
                'message' => 'Contract not found',
            ], 404);
        }

        return response()->json([
            'contract' => $contract,
        ]);
    }

    /**
     * Get the next available contract number for a given year.
     */
    public function nextNumber(Request $request)
    {
        // Validate year parameter
        $validated = $request->validate([
            'year' => 'required|integer|digits:4|min:2000|max:2100',
        ]);

        try {
            $contractNumber = $this->contractNumberService->generateNextNumber($validated['year']);
            
            return response()->json([
                'contract_no' => $contractNumber,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate contract number',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created contract.
     */
    public function store(StoreContractRequest $request)
    {
        try {
            // Use database transaction to ensure atomicity
            $contract = DB::transaction(function () use ($request) {
                // Create the contract
                $contract = Contract::create($request->validated());
                
                // Load the buyer relationship
                $contract->load('buyer');
                
                return $contract;
            });

            return response()->json([
                'message' => 'Contract created successfully',
                'contract' => $contract,
            ], 201);
            
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle duplicate contract number error
            if ($e->errorInfo[1] === 1062) { // MySQL duplicate entry error code
                return response()->json([
                    'message' => 'Contract number already exists',
                    'errors' => [
                        'contract_no' => ['This contract number already exists.'],
                    ],
                ], 422);
            }
            
            // Re-throw other database exceptions
            throw $e;
        }
    }

    /**
     * Update an existing contract.
     */
    public function update(UpdateContractRequest $request, $id)
    {
        $contract = Contract::find($id);

        if (!$contract) {
            return response()->json([
                'message' => 'Contract not found',
            ], 404);
        }

        try {
            // Use database transaction to ensure atomicity
            $updatedContract = DB::transaction(function () use ($contract, $request) {
                // Get validated data
                $data = $request->validated();
                
                // Contract number should not be updated
                // Remove it from the update data to prevent accidental changes
                unset($data['contract_no']);
                
                // Update the contract
                $contract->update($data);
                
                // Reload the buyer relationship
                $contract->load('buyer');
                
                return $contract;
            });

            return response()->json([
                'message' => 'Contract updated successfully',
                'contract' => $updatedContract,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update contract',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
