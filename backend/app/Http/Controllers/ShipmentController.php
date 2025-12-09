<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShipmentController extends Controller
{
    /**
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
     * Display the specified shipment.
     */
    public function show($id)
    {
        $shipment = Shipment::with('contract.buyer', 'order')->findOrFail($id);
        return response()->json($shipment);
    }

    /**
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
