<?php

namespace App\Services;

use App\Models\Supplier;

class SupplierCodeGenerator
{
    /**
     * Generate the next sequential supplier code.
     *
     * @return string
     */
    public function generate(): string
    {
        $lastSupplier = Supplier::lockForUpdate()
            ->orderBy('code', 'desc')
            ->first();

        if (!$lastSupplier) {
            return 'SUP0001';
        }

        // Extract the numeric part from the code
        $lastCode = $lastSupplier->code;
        $numericPart = (int) substr($lastCode, 3);
        
        // Increment and format with leading zeros
        $nextNumber = $numericPart + 1;
        return 'SUP' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Validate if a code follows the correct format.
     *
     * @param string $code
     * @return bool
     */
    public function isValid(string $code): bool
    {
        return preg_match('/^SUP\d{4}$/', $code) === 1;
    }
}
