<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with('contract.buyer');

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
     * Display the specified order.
     */
    public function show(string $id)
    {
        $order = Order::with('contract.buyer')->findOrFail($id);
        return response()->json($order);
    }

    /**
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
