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
     * @OA\Get(
     *     path="/api/contracts",
     *     operationId="getContractsList",
     *     tags={"Contracts"},
     *     summary="Get list of contracts",
     *     description="Returns paginated list of contracts with summary statistics. Supports search by buyer name/contract number and filter by status.",
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, example=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page (max 100)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=100, example=15)
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by buyer name or contract number",
     *         required=false,
     *         @OA\Schema(type="string", maxLength=255, example="Pfannerstill")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by contract status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"draft", "active", "approved", "pending", "completed", "cancelled"}, example="active")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="contracts",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Contract")
     *             ),
     *             @OA\Property(property="pagination", ref="#/components/schemas/Pagination"),
     *             @OA\Property(property="summary", ref="#/components/schemas/Summary")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     *
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
            'status' => 'nullable|string|in:draft,active,approved,pending,completed,cancelled',
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
     * @OA\Get(
     *     path="/api/contracts/{id}",
     *     operationId="getContractById",
     *     tags={"Contracts"},
     *     summary="Get contract by ID",
     *     description="Returns a single contract with buyer details",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Contract ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="contract", ref="#/components/schemas/Contract")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Contract not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     *
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
     * @OA\Get(
     *     path="/api/contracts/next-number",
     *     operationId="getNextContractNumber",
     *     tags={"Contracts"},
     *     summary="Get next contract number",
     *     description="Generates the next available contract number for a given year in format IIC/AKCL/CON/YYYY/NN",
     *     @OA\Parameter(
     *         name="year",
     *         in="query",
     *         description="Year for contract number generation (4 digits, 2000-2100)",
     *         required=true,
     *         @OA\Schema(type="integer", minimum=2000, maximum=2100, example=2025)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="contract_no", type="string", example="IIC/AKCL/CON/2025/29")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Failed to generate contract number"),
     *             @OA\Property(property="error", type="string", example="Error details")
     *         )
     *     )
     * )
     *
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
     * @OA\Post(
     *     path="/api/contracts",
     *     operationId="createContract",
     *     tags={"Contracts"},
     *     summary="Create a new contract",
     *     description="Creates a new contract with validation. Contract number must be unique and follow format IIC/AKCL/CON/YYYY/NN",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"buyer_id", "contract_no", "contract_date", "total_orders", "order_quantity", "value_usd", "b2b_percent", "status"},
     *             @OA\Property(property="buyer_id", type="integer", example=3),
     *             @OA\Property(property="contract_no", type="string", pattern="^IIC/AKCL/CON/\d{4}/\d{2}$", example="IIC/AKCL/CON/2025/29"),
     *             @OA\Property(property="contract_date", type="string", format="date", example="2025-12-08"),
     *             @OA\Property(property="amendment_date", type="string", format="date", nullable=true, example="2025-12-15"),
     *             @OA\Property(property="total_orders", type="integer", minimum=0, example=10),
     *             @OA\Property(property="order_quantity", type="integer", minimum=0, example=34216),
     *             @OA\Property(property="value_usd", type="number", format="decimal", minimum=0, example=225803.23),
     *             @OA\Property(property="b2b_percent", type="number", format="decimal", minimum=0, maximum=100, example=18.22),
     *             @OA\Property(property="status", type="string", enum={"draft", "active", "pending", "completed", "cancelled"}, example="draft"),
     *             @OA\Property(property="remarks", type="string", nullable=true, example="New contract for Q1 2025")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Contract created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Contract created successfully"),
     *             @OA\Property(property="contract", ref="#/components/schemas/Contract")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error or duplicate contract number",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     *
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
     * @OA\Put(
     *     path="/api/contracts/{id}",
     *     operationId="updateContract",
     *     tags={"Contracts"},
     *     summary="Update an existing contract",
     *     description="Updates contract details. Contract number cannot be modified.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Contract ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="buyer_id", type="integer", example=3),
     *             @OA\Property(property="contract_date", type="string", format="date", example="2025-12-08"),
     *             @OA\Property(property="amendment_date", type="string", format="date", nullable=true, example="2025-12-15"),
     *             @OA\Property(property="total_orders", type="integer", minimum=0, example=10),
     *             @OA\Property(property="order_quantity", type="integer", minimum=0, example=34216),
     *             @OA\Property(property="value_usd", type="number", format="decimal", minimum=0, example=225803.23),
     *             @OA\Property(property="b2b_percent", type="number", format="decimal", minimum=0, maximum=100, example=18.22),
     *             @OA\Property(property="status", type="string", enum={"draft", "active", "pending", "completed", "cancelled"}, example="active"),
     *             @OA\Property(property="remarks", type="string", nullable=true, example="Updated remarks")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contract updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Contract updated successfully"),
     *             @OA\Property(property="contract", ref="#/components/schemas/Contract")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Contract not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Failed to update contract"),
     *             @OA\Property(property="error", type="string", example="Error details")
     *         )
     *     )
     * )
     *
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
