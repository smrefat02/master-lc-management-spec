<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    protected static $counter = 0;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static::$counter++;
        $code = 'SUP' . str_pad(static::$counter, 4, '0', STR_PAD_LEFT);

        return [
            'name' => fake()->company(),
            'code' => $code,
            'contact_person' => fake()->name(),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'country' => fake()->country(),
            'address' => fake()->address(),
            'status' => fake()->randomElement(['active', 'active', 'active', 'inactive']), // 75% active
        ];
    }

    /**
     * Indicate that the supplier is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the supplier is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
