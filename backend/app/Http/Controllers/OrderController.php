<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/orders",
     *     operationId="getOrdersList",
     *     tags={"Orders"},
     *     summary="Get list of orders",
     *     description="Returns paginated list of orders with search and filter capabilities",
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by order number, buyer name, or contract number",
     *         required=false,
     *         @OA\Schema(type="string", example="122")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by order status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"draft", "on_process", "completed", "cancelled"}, example="draft")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", example=1)
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
     *             @OA\Property(property="orders", type="array", @OA\Items(ref="#/components/schemas/Order")),
     *             @OA\Property(property="total", type="integer", example=50),
     *             @OA\Property(property="current_page", type="integer", example=1),
     *             @OA\Property(property="last_page", type="integer", example=4)
     *         )
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with('contract.buyer');

        // Filter by contract_id (for dependent dropdown in B2B LC creation)
        if ($request->has('contract_id') && $request->contract_id !== '') {
            $query->where('contract_id', $request->contract_id);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('buyer_name', 'like', "%{$search}%")
                    ->orWhere('contract_no', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'orders' => $orders->items(),
            'total' => $orders->total(),
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/orders",
     *     operationId="createOrder",
     *     tags={"Orders"},
     *     summary="Create new order",
     *     description="Creates a new order with cost details and totals",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"salesContract"},
     *             @OA\Property(property="salesContract", type="integer", example=1, description="Contract ID (required)"),
     *             @OA\Property(property="orderNumber", type="string", example="ORD-000123", description="Auto-generated if empty"),
     *             @OA\Property(property="buyerName", type="string", example="ABC Corp"),
     *             @OA\Property(property="masterLCValue", type="number", format="decimal", example=50000.00),
     *             @OA\Property(property="budgetNo", type="string", example="3"),
     *             @OA\Property(property="orderValue", type="number", format="decimal", example=45000.00),
     *             @OA\Property(property="description", type="string", example="Winter collection order"),
     *             @OA\Property(property="contractNo", type="string", example="IIC/AKCL/CON/2025/01"),
     *             @OA\Property(property="status", type="string", enum={"draft", "on_process", "completed", "cancelled"}, example="draft"),
     *             @OA\Property(property="style", type="string", example="CASUAL-001"),
     *             @OA\Property(property="fobValue", type="number", format="decimal", example=12.50),
     *             @OA\Property(property="orderQty", type="integer", example=5000),
     *             @OA\Property(property="shipmentDate", type="string", format="date", example="2025-12-15"),
     *             @OA\Property(property="actualShipment", type="string", format="date", nullable=true, example="2025-12-13"),
     *             @OA\Property(property="fabricsDetails", type="string", example="100% Cotton, 180 GSM"),
     *             @OA\Property(property="notes", type="string", example="Rush order"),
     *             @OA\Property(
     *                 property="costDetails",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/CostDetail")
     *             ),
     *             @OA\Property(
     *                 property="totals",
     *                 ref="#/components/schemas/OrderTotals"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Order created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Order")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'salesContract' => 'required|exists:contracts,id',
            'orderNumber' => 'nullable|string|unique:orders,order_number',
            'buyerName' => 'nullable|string|max:255',
            'contractNo' => 'nullable|string',
            'status' => 'nullable|in:draft,on_process,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto-generate order number if not provided
        $orderNumber = $request->orderNumber;
        if (empty($orderNumber)) {
            $lastOrder = Order::latest('id')->first();
            $nextNumber = $lastOrder ? $lastOrder->id + 1 : 1;
            $orderNumber = 'ORD-' . str_pad($nextNumber, 6, '0', STR_PAD_LEFT);
        }

        $order = Order::create([
            'contract_id' => $request->salesContract,
            'order_number' => $orderNumber,
            'buyer_name' => $request->buyerName ?? '',
            'master_lc_value' => $request->masterLCValue ?? 0,
            'budget_no' => $request->budgetNo ?? '',
            'order_value' => $request->orderValue ?? 0,
            'description' => $request->description ?? '',
            'contract_no' => $request->contractNo ?? '',
            'status' => $request->status ?? 'draft',
            'style' => $request->style ?? '',
            'fob_value' => $request->fobValue ?? 0,
            'order_qty' => $request->orderQty ?? 0,
            'shipment_date' => $request->shipmentDate ?: null,
            'actual_shipment' => $request->actualShipment ?: null,
            'fabrics_details' => $request->fabricsDetails ?? '',
            'notes' => $request->notes ?? '',
            'cost_details' => $request->costDetails ?? [],
            'totals' => $request->totals ?? [],
        ]);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('contract.buyer')
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/orders/{id}",
     *     operationId="getOrderById",
     *     tags={"Orders"},
     *     summary="Get order by ID",
     *     description="Returns a single order with all details including cost breakdown",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Order ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(ref="#/components/schemas/Order")
     *     ),
     *     @OA\Response(response=404, description="Order not found"),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Display the specified order.
     */
    public function show($id)
    {
        $order = Order::with('contract.buyer')->findOrFail($id);
        return response()->json($order);
    }

    /**
     * @OA\Put(
     *     path="/api/orders/{id}",
     *     operationId="updateOrder",
     *     tags={"Orders"},
     *     summary="Update existing order",
     *     description="Updates an existing order with new data",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Order ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="orderNumber", type="string", example="ORD-000123"),
     *             @OA\Property(property="buyerName", type="string", example="ABC Corp"),
     *             @OA\Property(property="masterLCValue", type="number", format="decimal", example=50000.00),
     *             @OA\Property(property="budgetNo", type="string", example="3"),
     *             @OA\Property(property="orderValue", type="number", format="decimal", example=45000.00),
     *             @OA\Property(property="description", type="string", example="Winter collection order"),
     *             @OA\Property(property="contractNo", type="string", example="IIC/AKCL/CON/2025/01"),
     *             @OA\Property(property="status", type="string", enum={"draft", "on_process", "completed", "cancelled"}, example="on_process"),
     *             @OA\Property(property="style", type="string", example="CASUAL-001"),
     *             @OA\Property(property="fobValue", type="number", format="decimal", example=12.50),
     *             @OA\Property(property="orderQty", type="integer", example=5000),
     *             @OA\Property(property="shipmentDate", type="string", format="date", example="2025-12-15"),
     *             @OA\Property(property="actualShipment", type="string", format="date", nullable=true, example="2025-12-13"),
     *             @OA\Property(property="fabricsDetails", type="string", example="100% Cotton, 180 GSM"),
     *             @OA\Property(property="notes", type="string", example="Rush order"),
     *             @OA\Property(
     *                 property="costDetails",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/CostDetail")
     *             ),
     *             @OA\Property(
     *                 property="totals",
     *                 ref="#/components/schemas/OrderTotals"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Order updated successfully"),
     *             @OA\Property(property="order", ref="#/components/schemas/Order")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Order not found"),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Update the specified order.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'orderNumber' => 'sometimes|string|unique:orders,order_number,' . $id,
            'status' => 'sometimes|in:draft,on_process,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Map camelCase to snake_case
        $updateData = [];
        
        if ($request->has('orderNumber')) $updateData['order_number'] = $request->orderNumber;
        if ($request->has('buyerName')) $updateData['buyer_name'] = $request->buyerName;
        if ($request->has('masterLCValue')) $updateData['master_lc_value'] = $request->masterLCValue;
        if ($request->has('budgetNo')) $updateData['budget_no'] = $request->budgetNo;
        if ($request->has('orderValue')) $updateData['order_value'] = $request->orderValue;
        if ($request->has('description')) $updateData['description'] = $request->description;
        if ($request->has('contractNo')) $updateData['contract_no'] = $request->contractNo;
        if ($request->has('status')) $updateData['status'] = $request->status;
        if ($request->has('style')) $updateData['style'] = $request->style;
        if ($request->has('fobValue')) $updateData['fob_value'] = $request->fobValue;
        if ($request->has('orderQty')) $updateData['order_qty'] = $request->orderQty;
        if ($request->has('shipmentDate')) $updateData['shipment_date'] = $request->shipmentDate ?: null;
        if ($request->has('actualShipment')) $updateData['actual_shipment'] = $request->actualShipment ?: null;
        if ($request->has('fabricsDetails')) $updateData['fabrics_details'] = $request->fabricsDetails;
        if ($request->has('notes')) $updateData['notes'] = $request->notes;
        if ($request->has('costDetails')) $updateData['cost_details'] = $request->costDetails;
        if ($request->has('totals')) $updateData['totals'] = $request->totals;

        $order->update($updateData);

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->load('contract.buyer')
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/orders/{id}",
     *     operationId="deleteOrder",
     *     tags={"Orders"},
     *     summary="Delete order",
     *     description="Deletes an order permanently",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Order ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Order deleted successfully")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Order not found"),
     *     @OA\Response(response=500, description="Server error")
     * )
     * 
     * Remove the specified order.
     */
    public function destroy(string $id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully'
        ]);
    }
}
