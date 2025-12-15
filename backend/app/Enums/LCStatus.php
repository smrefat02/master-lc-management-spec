<?php

namespace App\Enums;

enum LCStatus: string
{
    // Initial State
    case DRAFT = 'draft';
    
    // Step 2: LC Application
    case APPLIED = 'applied';
    
    // Step 3: LC Issuance
    case ISSUED_BY_ISSUING_BANK = 'issued_by_issuing_bank';
    
    // Step 4: LC Advising/Verification
    case VERIFIED_BY_ADVISING_BANK = 'verified_by_advising_bank';
    
    // Step 5: Goods Shipment
    case GOODS_SHIPPED = 'goods_shipped';
    
    // Step 6: Document Submission
    case DOCUMENTS_RECEIVED = 'documents_received';
    
    // Step 7: Document Forwarding
    case DOCUMENTS_FORWARDED = 'documents_forwarded';
    
    // Step 8: Document Verification
    case DOCUMENTS_VERIFIED = 'documents_verified';
    
    // Final States
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case REJECTED = 'rejected';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'Draft',
            self::APPLIED => 'Applied',
            self::ISSUED_BY_ISSUING_BANK => 'Issued by Issuing Bank',
            self::VERIFIED_BY_ADVISING_BANK => 'Verified by Advising Bank',
            self::GOODS_SHIPPED => 'Goods Shipped',
            self::DOCUMENTS_RECEIVED => 'Documents Received',
            self::DOCUMENTS_FORWARDED => 'Documents Forwarded',
            self::DOCUMENTS_VERIFIED => 'Documents Verified',
            self::ACTIVE => 'Active',
            self::EXPIRED => 'Expired',
            self::REJECTED => 'Rejected',
        };
    }

    /**
     * Get status description
     */
    public function description(): string
    {
        return match($this) {
            self::DRAFT => 'LC is being drafted',
            self::APPLIED => 'LC application submitted to issuing bank',
            self::ISSUED_BY_ISSUING_BANK => 'LC has been issued by the issuing bank',
            self::VERIFIED_BY_ADVISING_BANK => 'LC has been verified by the advising bank',
            self::GOODS_SHIPPED => 'Goods have been shipped',
            self::DOCUMENTS_RECEIVED => 'Shipping documents received from exporter',
            self::DOCUMENTS_FORWARDED => 'Documents forwarded to issuing bank',
            self::DOCUMENTS_VERIFIED => 'Documents verified by issuing bank',
            self::ACTIVE => 'LC is active and valid',
            self::EXPIRED => 'LC has expired',
            self::REJECTED => 'LC has been rejected',
        };
    }

    /**
     * Get status color for UI
     */
    public function color(): string
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::APPLIED => 'blue',
            self::ISSUED_BY_ISSUING_BANK => 'indigo',
            self::VERIFIED_BY_ADVISING_BANK => 'purple',
            self::GOODS_SHIPPED => 'cyan',
            self::DOCUMENTS_RECEIVED => 'teal',
            self::DOCUMENTS_FORWARDED => 'emerald',
            self::DOCUMENTS_VERIFIED => 'lime',
            self::ACTIVE => 'green',
            self::EXPIRED => 'orange',
            self::REJECTED => 'red',
        };
    }

    /**
     * Get allowed transitions from this status
     */
    public function allowedTransitions(): array
    {
        return match($this) {
            self::DRAFT => [self::APPLIED, self::REJECTED],
            self::APPLIED => [self::ISSUED_BY_ISSUING_BANK, self::REJECTED],
            self::ISSUED_BY_ISSUING_BANK => [self::VERIFIED_BY_ADVISING_BANK, self::REJECTED],
            self::VERIFIED_BY_ADVISING_BANK => [self::GOODS_SHIPPED, self::REJECTED],
            self::GOODS_SHIPPED => [self::DOCUMENTS_RECEIVED, self::REJECTED],
            self::DOCUMENTS_RECEIVED => [self::DOCUMENTS_FORWARDED, self::REJECTED],
            self::DOCUMENTS_FORWARDED => [self::DOCUMENTS_VERIFIED, self::REJECTED],
            self::DOCUMENTS_VERIFIED => [self::ACTIVE, self::REJECTED],
            self::ACTIVE => [self::EXPIRED],
            self::EXPIRED => [],
            self::REJECTED => [],
        };
    }

    /**
     * Check if transition to target status is allowed
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions());
    }

    /**
     * Check if this is a terminal state
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::EXPIRED, self::REJECTED]);
    }

    /**
     * Check if this is an active state
     */
    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    /**
     * Get the next expected action
     */
    public function nextAction(): ?string
    {
        return match($this) {
            self::DRAFT => 'Apply for LC',
            self::APPLIED => 'Issue LC',
            self::ISSUED_BY_ISSUING_BANK => 'Verify LC',
            self::VERIFIED_BY_ADVISING_BANK => 'Ship Goods',
            self::GOODS_SHIPPED => 'Receive Documents',
            self::DOCUMENTS_RECEIVED => 'Forward Documents',
            self::DOCUMENTS_FORWARDED => 'Verify Documents',
            self::DOCUMENTS_VERIFIED => 'Activate LC',
            self::ACTIVE => null,
            self::EXPIRED => null,
            self::REJECTED => null,
        };
    }

    /**
     * Get all statuses as array
     */
    public static function toArray(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    /**
     * Get all statuses with labels
     */
    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
