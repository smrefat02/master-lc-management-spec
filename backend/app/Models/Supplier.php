<?php

namespace App\Models;

use App\Enums\SupplierStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'contact_person',
        'email',
        'phone',
        'country',
        'address',
        'status',
    ];

    protected $casts = [
        'status' => SupplierStatus::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function b2bLcs()
    {
        return $this->hasMany(B2BLC::class);
    }

    // Query Scopes
    public function scopeActive($query)
    {
        return $query->where('status', SupplierStatus::ACTIVE);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', SupplierStatus::INACTIVE);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('country', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        });
    }

    // Helper Methods
    public function isActive(): bool
    {
        return $this->status === SupplierStatus::ACTIVE;
    }

    public function canBeDeleted(): bool
    {
        return !$this->b2bLcs()->exists();
    }

    public function activate(): bool
    {
        $this->status = SupplierStatus::ACTIVE;
        return $this->save();
    }

    public function deactivate(): bool
    {
        $this->status = SupplierStatus::INACTIVE;
        return $this->save();
    }

    // Attributes
    public function getStatusBadgeAttribute(): string
    {
        return $this->status->badge();
    }
}
