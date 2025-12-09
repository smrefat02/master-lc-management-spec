<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    protected $fillable = [
        'contract_id',
        'order_id',
        'buyer_name',
        'sales_contract',
        'order_number',
        'shipping_date',
        'shipment_qty',
        'shipment_value',
        'reference_no',
        'remarks',
    ];

    protected $casts = [
        'shipping_date' => 'date',
        'shipment_qty' => 'decimal:3',
        'shipment_value' => 'decimal:2',
    ];

    /**
     * Get the contract that owns the shipment.
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Get the order that owns the shipment.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
