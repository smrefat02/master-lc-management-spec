<?php

namespace App\Services;

use App\Models\Contract;
use Illuminate\Support\Facades\DB;

class ContractNumberService
{
    /**
     * Generate the next contract number for a given year.
     * Format: IIC/AKCL/CON/YYYY/NN
     * 
     * @param int $year The year for the contract
     * @return string The generated contract number
     */
    public function generateNextNumber(int $year): string
    {
        // Use pessimistic locking to prevent race conditions
        return DB::transaction(function () use ($year) {
            // Get the highest sequence number for this year
            $lastContract = Contract::where('contract_no', 'like', "IIC/AKCL/CON/{$year}/%")
                ->lockForUpdate()
                ->orderByRaw('CAST(SUBSTR(contract_no, -2) AS INTEGER) DESC')
                ->first();
            
            $nextSequence = 1;
            
            if ($lastContract) {
                // Extract the sequence number from the contract_no
                $parts = explode('/', $lastContract->contract_no);
                $lastSequence = intval(end($parts));
                $nextSequence = $lastSequence + 1;
            }
            
            // Format: IIC/AKCL/CON/YYYY/NN (zero-padded to 2 digits)
            return sprintf('IIC/AKCL/CON/%d/%02d', $year, $nextSequence);
        });
    }
}
