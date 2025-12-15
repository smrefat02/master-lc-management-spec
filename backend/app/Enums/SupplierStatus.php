<?php

namespace App\Enums;

enum SupplierStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::INACTIVE => 'Inactive',
        };
    }

    public function badge(): string
    {
        return match($this) {
            self::ACTIVE => 'bg-green-100 text-green-800',
            self::INACTIVE => 'bg-gray-100 text-gray-800',
        };
    }
}
