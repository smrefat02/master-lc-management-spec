<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bank extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'swift_code',
        'address',
        'country',
        'branch',
        'contact_person',
        'phone',
        'email',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get Master LCs where this bank is the issuing bank.
     */
    public function issuingMasterLCs(): HasMany
    {
        return $this->hasMany(MasterLC::class, 'issuing_bank_id');
    }

    /**
     * Get Master LCs where this bank is the advising bank.
     */
    public function advisingMasterLCs(): HasMany
    {
        return $this->hasMany(MasterLC::class, 'advising_bank_id');
    }

    /**
     * Scope to get only active banks.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
