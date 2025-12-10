<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class B2BLC extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'b2b_lcs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contract_id',
        'order_id',
        'costing_detail_id',
        'pi_number',
        'supplier',
        'order_qty',
        'fob_value',
        'order_value',
        'post_pi_value',
        'b2b_percent',
        'director_command',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'order_qty' => 'integer',
        'fob_value' => 'decimal:2',
        'order_value' => 'decimal:2',
        'post_pi_value' => 'decimal:2',
        'b2b_percent' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($b2bLC) {
            // Auto-calculate order_value if order_qty or fob_value changed
            if ($b2bLC->isDirty(['order_qty', 'fob_value'])) {
                $b2bLC->order_value = $b2bLC->order_qty * $b2bLC->fob_value;
            }

            // Auto-calculate b2b_percent if post_pi_value or order_value changed
            if ($b2bLC->isDirty(['post_pi_value', 'order_value']) && $b2bLC->order_value > 0) {
                $b2bLC->b2b_percent = ($b2bLC->post_pi_value / $b2bLC->order_value) * 100;
            }
        });
    }

    /**
     * Get the contract that owns the B2B LC.
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Get the order that owns the B2B LC.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Scope a query to filter by PI number.
     */
    public function scopeFilterByPiNumber($query, $piNumber)
    {
        return $query->where('pi_number', 'like', '%' . $piNumber . '%');
    }

    /**
     * Scope a query to filter by supplier.
     */
    public function scopeFilterBySupplier($query, $supplier)
    {
        return $query->where('supplier', 'like', '%' . $supplier . '%');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeFilterByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
