<?php

namespace App\Enums;

enum LCAction: string
{
    // Workflow Actions
    case CREATED = 'created';
    case UPDATED = 'updated';
    case APPLIED = 'applied';
    case ISSUED = 'issued';
    case VERIFIED = 'verified';
    case GOODS_SHIPPED = 'goods_shipped';
    case DOCUMENTS_RECEIVED = 'documents_received';
    case DOCUMENTS_FORWARDED = 'documents_forwarded';
    case DOCUMENTS_VERIFIED = 'documents_verified';
    case ACTIVATED = 'activated';
    case REJECTED = 'rejected';
    case EXPIRED = 'expired';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::CREATED => 'LC Created',
            self::UPDATED => 'LC Updated',
            self::APPLIED => 'LC Applied',
            self::ISSUED => 'LC Issued',
            self::VERIFIED => 'LC Verified',
            self::GOODS_SHIPPED => 'Goods Shipped',
            self::DOCUMENTS_RECEIVED => 'Documents Received',
            self::DOCUMENTS_FORWARDED => 'Documents Forwarded',
            self::DOCUMENTS_VERIFIED => 'Documents Verified',
            self::ACTIVATED => 'LC Activated',
            self::REJECTED => 'LC Rejected',
            self::EXPIRED => 'LC Expired',
        };
    }

    /**
     * Get action description template
     */
    public function descriptionTemplate(): string
    {
        return match($this) {
            self::CREATED => 'LC {lc_number} was created',
            self::UPDATED => 'LC {lc_number} was updated',
            self::APPLIED => 'LC {lc_number} application submitted to issuing bank',
            self::ISSUED => 'LC {lc_number} was issued by {issuing_bank}',
            self::VERIFIED => 'LC {lc_number} was verified by {advising_bank}',
            self::GOODS_SHIPPED => 'Goods for LC {lc_number} were shipped',
            self::DOCUMENTS_RECEIVED => 'Documents for LC {lc_number} were received',
            self::DOCUMENTS_FORWARDED => 'Documents for LC {lc_number} were forwarded to issuing bank',
            self::DOCUMENTS_VERIFIED => 'Documents for LC {lc_number} were verified',
            self::ACTIVATED => 'LC {lc_number} was activated',
            self::REJECTED => 'LC {lc_number} was rejected',
            self::EXPIRED => 'LC {lc_number} has expired',
        };
    }

    /**
     * Get icon for action
     */
    public function icon(): string
    {
        return match($this) {
            self::CREATED => 'document-add',
            self::UPDATED => 'pencil',
            self::APPLIED => 'paper-airplane',
            self::ISSUED => 'document-text',
            self::VERIFIED => 'check-circle',
            self::GOODS_SHIPPED => 'truck',
            self::DOCUMENTS_RECEIVED => 'inbox',
            self::DOCUMENTS_FORWARDED => 'arrow-right',
            self::DOCUMENTS_VERIFIED => 'badge-check',
            self::ACTIVATED => 'check',
            self::REJECTED => 'x-circle',
            self::EXPIRED => 'clock',
        };
    }
}
