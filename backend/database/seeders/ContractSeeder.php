<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContractSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all buyer IDs
        $buyerIds = \App\Models\Buyer::pluck('id')->toArray();
        
        // Create 30 contracts spread across 2023-2025
        for ($i = 0; $i < 30; $i++) {
            \App\Models\Contract::factory()->create([
                'buyer_id' => fake()->randomElement($buyerIds),
            ]);
        }
    }
}
