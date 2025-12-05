<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;
    protected $fillable = [
        'buyer_id',
        'contract_no',
        'contract_date',
        'amendment_date',
        'total_orders',
        'order_quantity',
        'value_usd',
        'b2b_percent',
        'status',
        'remarks',
    ];

    protected $casts = [
        'contract_date' => 'date',
        'amendment_date' => 'date',
        'value_usd' => 'decimal:2',
        'b2b_percent' => 'decimal:2',
    ];

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }
}
