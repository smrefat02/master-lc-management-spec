<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contract>
 */
class ContractFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $counter = 0;
        $counter++;
        
        $year = fake()->numberBetween(2023, 2025);
        // Use counter to ensure unique contract numbers across all years
        $sequenceNumber = $counter;
        $contractNo = sprintf('IIC/AKCL/CON/%d/%02d', $year, $sequenceNumber);
        
        $contractDate = fake()->dateTimeBetween("{$year}-01-01", "{$year}-12-31");
        $amendmentDate = fake()->optional(0.3)->dateTimeBetween($contractDate, "{$year}-12-31");
        
        $totalOrders = fake()->numberBetween(1, 20);
        $orderQuantity = fake()->numberBetween(1000, 100000);
        $valueUsd = fake()->randomFloat(2, 10000, 1000000);
        $b2bPercent = fake()->randomFloat(2, 0, 100);
        
        return [
            'buyer_id' => \App\Models\Buyer::factory(),
            'contract_no' => $contractNo,
            'contract_date' => $contractDate,
            'amendment_date' => $amendmentDate,
            'total_orders' => $totalOrders,
            'order_quantity' => $orderQuantity,
            'value_usd' => $valueUsd,
            'b2b_percent' => $b2bPercent,
            'status' => fake()->randomElement(['draft', 'active', 'completed', 'cancelled']),
            'remarks' => fake()->optional(0.5)->sentence(),
        ];
    }
}
