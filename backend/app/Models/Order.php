<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'contract_id',
        'order_number',
        'buyer_name',
        'master_lc_value',
        'budget_no',
        'order_value',
        'description',
        'contract_no',
        'status',
        'style',
        'fob_value',
        'order_qty',
        'shipment_date',
        'actual_shipment',
        'fabrics_details',
        'notes',
        'cost_details',
        'totals',
    ];

    protected $casts = [
        'cost_details' => 'array',
        'totals' => 'array',
        'shipment_date' => 'date',
        'actual_shipment' => 'date',
        'master_lc_value' => 'decimal:2',
        'order_value' => 'decimal:2',
        'fob_value' => 'decimal:2',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
