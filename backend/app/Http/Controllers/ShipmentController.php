<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShipmentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/shipments",
     *     operationId="getShipmentsList",
     *     tags={"Shipments"},
     *     summary="Get list of shipments",
     *     description="Returns paginated list of shipments with search capabilities and summary statistics",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by buyer name, contract number, order number, or reference number",
     *         required=false,
     *         @OA\Schema(type="string", example="Test Buyer")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", default=1, example=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of items per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15, example=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="shipments", type="array", @OA\Items(ref="#/components/schemas/Shipment")),
     *             @OA\Property(property="total", type="integer", example=8),
     *             @OA\Property(property="current_page", type="integer", example=1),
     *             @OA\Property(property="last_page", type="integer", example=1),
     *             @OA\Property(
     *                 property="summary",
     *                 type="object",
     *                 @OA\Property(property="total_shipments", type="integer", example=8),
     *                 @OA\Property(property="total_shipped_qty", type="integer", example=450),
     *                 @OA\Property(property="total_shipment_value", type="number", format="float", example=5050.00),
     *                 @OA\Property(property="avg_shipment_qty", type="number", format="float", example=56.25)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Display a listing of shipments.
     */
    public function index(Request $request)
    {
        $query = Shipment::with('contract', 'order');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('buyer_name', 'like', "%{$search}%")
                    ->orWhere('sales_contract', 'like', "%{$search}%")
                    ->orWhere('order_number', 'like', "%{$search}%")
                    ->orWhere('reference_no', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $shipments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Calculate summary statistics
        $allShipments = Shipment::all();
        $summary = [
            'total_shipments' => $allShipments->count(),
            'total_shipped_qty' => $allShipments->sum('shipment_qty'),
            'total_shipment_value' => $allShipments->sum('shipment_value'),
            'avg_shipment_qty' => $allShipments->count() > 0 
                ? round($allShipments->sum('shipment_qty') / $allShipments->count(), 2) 
                : 0,
        ];

        return response()->json([
            'shipments' => $shipments->items(),
            'total' => $shipments->total(),
            'current_page' => $shipments->currentPage(),
            'last_page' => $shipments->lastPage(),
            'summary' => $summary,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/shipments",
     *     operationId="createShipment",
     *     tags={"Shipments"},
     *     summary="Create a new shipment",
     *     description="Creates a new shipment record with auto-population of buyer, contract, and order details",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"salesContract", "order"},
     *             @OA\Property(property="salesContract", type="integer", example=1, description="Contract ID"),
     *             @OA\Property(property="order", type="integer", example=1, description="Order ID"),
     *             @OA\Property(property="shippingDate", type="string", format="date", example="2025-12-10", description="Shipping date"),
     *             @OA\Property(property="shipmentQty", type="integer", example=100, description="Quantity shipped (whole numbers)"),
     *             @OA\Property(property="shipmentValue", type="number", format="float", example=1000.00, description="Shipment value in USD"),
     *             @OA\Property(property="referenceNo", type="string", example="BL-12345", description="Reference number (BL/Invoice/Internal)"),
     *             @OA\Property(property="remarks", type="string", example="First shipment", description="Additional notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Shipment created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment created successfully"),
     *             @OA\Property(property="shipment", ref="#/components/schemas/Shipment")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 @OA\Property(property="salesContract", type="array", @OA\Items(type="string", example="The sales contract field is required.")),
     *                 @OA\Property(property="order", type="array", @OA\Items(type="string", example="The order field is required."))
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Store a newly created shipment.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'salesContract' => 'required|exists:contracts,id',
            'order' => 'required|exists:orders,id',
            'shippingDate' => 'nullable|date',
            'shipmentQty' => 'nullable|numeric',
            'shipmentValue' => 'nullable|numeric',
            'referenceNo' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get contract and order details
        $contract = \App\Models\Contract::with('buyer')->find($request->salesContract);
        $order = \App\Models\Order::find($request->order);

        $shipment = Shipment::create([
            'contract_id' => $request->salesContract,
            'order_id' => $request->order,
            'buyer_name' => $contract->buyer->name ?? '',
            'sales_contract' => $contract->contract_no ?? '',
            'order_number' => $order->order_number ?? '',
            'shipping_date' => $request->shippingDate ?: null,
            'shipment_qty' => $request->shipmentQty ?? 0,
            'shipment_value' => $request->shipmentValue ?? 0,
            'reference_no' => $request->referenceNo ?? '',
            'remarks' => $request->remarks ?? '',
        ]);

        return response()->json([
            'message' => 'Shipment created successfully',
            'shipment' => $shipment->load('contract', 'order')
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/shipments/{id}",
     *     operationId="getShipmentById",
     *     tags={"Shipments"},
     *     summary="Get shipment by ID",
     *     description="Returns detailed information for a specific shipment including related contract and order data",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Shipment ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Shipment")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Shipment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment not found")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Display the specified shipment.
     */
    public function show($id)
    {
        $shipment = Shipment::with('contract.buyer', 'order')->findOrFail($id);
        return response()->json($shipment);
    }

    /**
     * @OA\Put(
     *     path="/api/shipments/{id}",
     *     operationId="updateShipment",
     *     tags={"Shipments"},
     *     summary="Update a shipment",
     *     description="Updates an existing shipment with new values. All fields are optional.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Shipment ID to update",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="salesContract", type="integer", example=1, description="Contract ID"),
     *             @OA\Property(property="order", type="integer", example=1, description="Order ID"),
     *             @OA\Property(property="shippingDate", type="string", format="date", example="2025-12-15", description="Shipping date"),
     *             @OA\Property(property="shipmentQty", type="integer", example=150, description="Quantity shipped (whole numbers)"),
     *             @OA\Property(property="shipmentValue", type="number", format="float", example=1500.00, description="Shipment value in USD"),
     *             @OA\Property(property="referenceNo", type="string", example="BL-12345-UPDATED", description="Reference number"),
     *             @OA\Property(property="remarks", type="string", example="Updated shipment", description="Additional notes")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Shipment updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment updated successfully"),
     *             @OA\Property(property="shipment", ref="#/components/schemas/Shipment")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Shipment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Update the specified shipment.
     */
    public function update(Request $request, string $id)
    {
        $shipment = Shipment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'salesContract' => 'nullable|exists:contracts,id',
            'order' => 'nullable|exists:orders,id',
            'shippingDate' => 'nullable|date',
            'shipmentQty' => 'nullable|numeric',
            'shipmentValue' => 'nullable|numeric',
            'referenceNo' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = [];
        
        if ($request->has('salesContract')) {
            $contract = \App\Models\Contract::with('buyer')->find($request->salesContract);
            $updateData['contract_id'] = $request->salesContract;
            $updateData['buyer_name'] = $contract->buyer->name ?? '';
            $updateData['sales_contract'] = $contract->contract_no ?? '';
        }
        
        if ($request->has('order')) {
            $order = \App\Models\Order::find($request->order);
            $updateData['order_id'] = $request->order;
            $updateData['order_number'] = $order->order_number ?? '';
        }
        
        if ($request->has('shippingDate')) $updateData['shipping_date'] = $request->shippingDate ?: null;
        if ($request->has('shipmentQty')) $updateData['shipment_qty'] = $request->shipmentQty;
        if ($request->has('shipmentValue')) $updateData['shipment_value'] = $request->shipmentValue;
        if ($request->has('referenceNo')) $updateData['reference_no'] = $request->referenceNo;
        if ($request->has('remarks')) $updateData['remarks'] = $request->remarks;

        $shipment->update($updateData);

        return response()->json([
            'message' => 'Shipment updated successfully',
            'shipment' => $shipment->fresh()->load('contract', 'order')
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/shipments/{id}",
     *     operationId="deleteShipment",
     *     tags={"Shipments"},
     *     summary="Delete a shipment",
     *     description="Permanently deletes a shipment record from the database",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Shipment ID to delete",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Shipment deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Shipment not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Shipment not found")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Remove the specified shipment.
     */
    public function destroy(string $id)
    {
        $shipment = Shipment::findOrFail($id);
        $shipment->delete();

        return response()->json([
            'message' => 'Shipment deleted successfully'
        ]);
    }
}
