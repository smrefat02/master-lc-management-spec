<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterLC extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'master_lcs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contract_id',
        'order_id',
        'lc_number',
        'lc_number_mode',
        'issue_date',
        'expiry_date',
        'amount',
        'currency',
        'exchange_rate',
        'converted_amount',
        'buyer_info',
        'beneficiary_info',
        'bank_info',
        'required_documents',
        'attachments',
        'terms_and_conditions',
        'status',
        'lc_status',
        'cancellation_reason',
        'created_by',
        'approved_by',
        // Banking Workflow Fields
        'issuing_bank_id',
        'issuing_bank_reference_no',
        'issuing_bank_issue_date',
        'advising_bank_id',
        'advising_bank_confirmation_status',
        'advising_bank_verification_status',
        'advising_bank_verified_at',
        'documents_received_at',
        'documents_forwarded_to_bank_at',
        'documents_verified_at',
        // v3.0 Workflow Fields
        'applied_at',
        'issued_at',
        'goods_shipped_at',
        'documents_forwarded_at',
        'activated_at',
        'shipment_id',
        'shipping_date',
        'carrier',
        'vessel_name',
        'bill_of_lading_no',
        'port_of_loading',
        'port_of_discharge',
        'received_documents',
        'document_discrepancies',
        'documents_verification_status',
        'rejection_reason',
        'applicant_remarks',
        'issuer_remarks',
        'advisor_remarks',
        'shipper_remarks',
        'receiver_remarks',
        'forwarder_remarks',
        'verifier_remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'shipping_date' => 'date',
        'amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'converted_amount' => 'decimal:2',
        'buyer_info' => 'array',
        'beneficiary_info' => 'array',
        'bank_info' => 'array',
        'required_documents' => 'array',
        'attachments' => 'array',
        'received_documents' => 'array',
        'document_discrepancies' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // Banking Workflow Casts
        'lc_status' => \App\Enums\LCStatus::class,
        'issuing_bank_issue_date' => 'date',
        'advising_bank_verified_at' => 'datetime',
        'documents_received_at' => 'datetime',
        'documents_forwarded_to_bank_at' => 'datetime',
        'documents_verified_at' => 'datetime',
        'applied_at' => 'datetime',
        'issued_at' => 'datetime',
        'goods_shipped_at' => 'datetime',
        'documents_forwarded_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($masterLC) {
            // Auto-calculate converted_amount if exchange_rate is provided
            if ($masterLC->isDirty(['amount', 'exchange_rate']) && $masterLC->exchange_rate) {
                $masterLC->converted_amount = $masterLC->amount * $masterLC->exchange_rate;
            }
        });
    }

    /**
     * Get the contract that owns the Master LC.
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Get the order that owns the Master LC.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the issuing bank for the Master LC.
     */
    public function issuingBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'issuing_bank_id');
    }

    /**
     * Get the advising bank for the Master LC.
     */
    public function advisingBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'advising_bank_id');
    }

    /**
     * Get the shipment for the Master LC.
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * Get timeline entries for the Master LC.
     */
    public function timeline(): HasMany
    {
        return $this->hasMany(LCTimeline::class, 'master_lc_id')->orderBy('performed_at', 'desc');
    }

    /**
     * Generate a unique LC number.
     *
     * @return string
     */
    public static function generateLCNumber(): string
    {
        $year = date('Y');
        $prefix = "LC-{$year}-";

        // Get the latest LC number for this year
        $lastLC = self::where('lc_number', 'like', "{$prefix}%")
            ->orderBy('lc_number', 'desc')
            ->first();

        if ($lastLC) {
            // Extract the sequence number and increment
            $lastNumber = intval(substr($lastLC->lc_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Check if LC can be edited (old status field).
     *
     * @return bool
     */
    public function canEdit(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if LC can be deleted (old status field).
     *
     * @return bool
     */
    public function canDelete(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Scope a query to filter by LC number.
     */
    public function scopeFilterByLcNumber($query, $lcNumber)
    {
        return $query->where('lc_number', 'like', '%' . $lcNumber . '%');
    }

    /**
     * Scope a query to filter by buyer name.
     */
    public function scopeFilterByBuyer($query, $buyer)
    {
        return $query->whereJsonContains('buyer_info->name', $buyer)
            ->orWhere('buyer_info->name', 'like', '%' . $buyer . '%');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeFilterByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by currency.
     */
    public function scopeFilterByCurrency($query, $currency)
    {
        return $query->where('currency', $currency);
    }

    /**
     * Scope a query to filter by issue date range.
     */
    public function scopeFilterByIssueDateRange($query, $from, $to)
    {
        if ($from) {
            $query->where('issue_date', '>=', $from);
        }
        if ($to) {
            $query->where('issue_date', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope a query to filter by expiry date range.
     */
    public function scopeFilterByExpiryDateRange($query, $from, $to)
    {
        if ($from) {
            $query->where('expiry_date', '>=', $from);
        }
        if ($to) {
            $query->where('expiry_date', '<=', $to);
        }
        return $query;
    }

    /**
     * Get the status badge color.
     *
     * @return string
     */
    public function getStatusColorAttribute(): string
    {
        $colors = [
            'draft' => 'gray',
            'submitted' => 'blue',
            'reviewed' => 'purple',
            'approved' => 'green',
            'active' => 'emerald',
            'expired' => 'orange',
            'cancelled' => 'red',
        ];

        return $colors[$this->status] ?? 'gray';
    }

    // ============================================
    // v3.0 Workflow Permission Methods
    // ============================================

    /**
     * Check if LC can be applied (Step 2)
     */
    public function canApply(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::DRAFT;
    }

    /**
     * Check if LC can be issued (Step 3)
     */
    public function canIssue(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::APPLIED;
    }

    /**
     * Check if LC can be advised/verified (Step 4)
     */
    public function canAdvise(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::ISSUED_BY_ISSUING_BANK;
    }

    /**
     * Check if goods can be shipped (Step 5)
     */
    public function canShipGoods(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::VERIFIED_BY_ADVISING_BANK;
    }

    /**
     * Check if documents can be received (Step 6)
     */
    public function canReceiveDocuments(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::GOODS_SHIPPED;
    }

    /**
     * Check if documents can be forwarded (Step 7)
     */
    public function canForwardDocuments(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::DOCUMENTS_RECEIVED;
    }

    /**
     * Check if documents can be verified (Step 8)
     */
    public function canVerifyDocuments(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::DOCUMENTS_FORWARDED;
    }

    /**
     * Check if LC can be activated
     */
    public function canActivate(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::DOCUMENTS_VERIFIED;
    }

    /**
     * Check if LC can be rejected
     */
    public function canReject(): bool
    {
        return !$this->lc_status->isTerminal();
    }

    // ============================================
    // Status Check Methods
    // ============================================

    /**
     * Check if LC is in draft status
     */
    public function isDraft(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::DRAFT;
    }

    /**
     * Check if LC is applied
     */
    public function isApplied(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::APPLIED;
    }

    /**
     * Check if LC is issued
     */
    public function isIssued(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::ISSUED_BY_ISSUING_BANK;
    }

    /**
     * Check if LC is verified by advising bank
     */
    public function isVerified(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::VERIFIED_BY_ADVISING_BANK;
    }

    /**
     * Check if LC is active
     */
    public function isActive(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::ACTIVE;
    }

    /**
     * Check if LC is rejected
     */
    public function isRejected(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::REJECTED;
    }

    /**
     * Check if LC is expired
     */
    public function isExpired(): bool
    {
        return $this->lc_status === \App\Enums\LCStatus::EXPIRED || 
               ($this->expiry_date && $this->expiry_date < now());
    }

    /**
     * Check if LC status is terminal (no further transitions allowed)
     */
    public function isTerminal(): bool
    {
        return $this->lc_status && $this->lc_status->isTerminal();
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Get the LC status label
     */
    public function getStatusLabel(): string
    {
        return $this->lc_status ? $this->lc_status->label() : 'Unknown';
    }

    /**
     * Get the LC status color
     */
    public function getStatusColor(): string
    {
        return $this->lc_status ? $this->lc_status->color() : 'gray';
    }

    /**
     * Get allowed transitions from current status
     */
    public function getAllowedTransitions(): array
    {
        return $this->lc_status ? $this->lc_status->allowedTransitions() : [];
    }

    /**
     * Get next action label
     */
    public function getNextAction(): ?string
    {
        return $this->lc_status ? $this->lc_status->nextAction() : null;
    }

    /**
     * Check if LC can be edited (only draft)
     */
    public function canBeEdited(): bool
    {
        return $this->isDraft();
    }

    /**
     * Check if LC can be deleted (only draft)
     */
    public function canBeDeleted(): bool
    {
        return $this->isDraft();
    }

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope a query to filter by LC status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('lc_status', $status);
    }

    /**
     * Scope to get active LCs
     */
    public function scopeActive($query)
    {
        return $query->where('lc_status', \App\Enums\LCStatus::ACTIVE);
    }

    /**
     * Scope to get expired LCs
     */
    public function scopeExpired($query)
    {
        return $query->where('lc_status', \App\Enums\LCStatus::EXPIRED)
                     ->orWhere('expiry_date', '<', now());
    }

    /**
     * Scope to get rejected LCs
     */
    public function scopeRejected($query)
    {
        return $query->where('lc_status', \App\Enums\LCStatus::REJECTED);
    }
}
