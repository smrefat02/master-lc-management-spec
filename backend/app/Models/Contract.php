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

    /**
     * Scope a query to search contracts by contract number or buyer name.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $searchTerm
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $searchTerm)
    {
        if (empty($searchTerm)) {
            return $query;
        }

        return $query->where(function ($q) use ($searchTerm) {
            $q->where('contract_no', 'like', "%{$searchTerm}%")
              ->orWhereHas('buyer', function ($buyerQuery) use ($searchTerm) {
                  $buyerQuery->where('name', 'like', "%{$searchTerm}%");
              });
        });
    }

    /**
     * Scope a query to filter contracts by status.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, $status)
    {
        if (empty($status)) {
            return $query;
        }

        return $query->where('status', $status);
    }
}
