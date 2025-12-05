<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that nextNumber returns "01" for empty database.
     */
    public function test_next_number_returns_01_for_new_year()
    {
        $response = $this->getJson('/api/contracts/next-number?year=2025');

        $response->assertStatus(200)
            ->assertJson([
                'contract_no' => 'IIC/AKCL/CON/2025/01',
            ]);
    }

    /**
     * Test that nextNumber increments correctly.
     */
    public function test_next_number_increments_from_existing()
    {
        $buyer = Buyer::factory()->create();

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/09',
        ]);

        $response = $this->getJson('/api/contracts/next-number?year=2025');

        $response->assertStatus(200)
            ->assertJson([
                'contract_no' => 'IIC/AKCL/CON/2025/10',
            ]);
    }

    /**
     * Test that nextNumber handles multiple contracts in same year.
     */
    public function test_next_number_finds_highest_in_year()
    {
        $buyer = Buyer::factory()->create();

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/03',
        ]);

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/15',
        ]);

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/07',
        ]);

        $response = $this->getJson('/api/contracts/next-number?year=2025');

        $response->assertStatus(200)
            ->assertJson([
                'contract_no' => 'IIC/AKCL/CON/2025/16',
            ]);
    }

    /**
     * Test that nextNumber is isolated by year.
     */
    public function test_next_number_isolates_by_year()
    {
        $buyer = Buyer::factory()->create();

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2024/50',
        ]);

        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/05',
        ]);

        $response = $this->getJson('/api/contracts/next-number?year=2026');

        $response->assertStatus(200)
            ->assertJson([
                'contract_no' => 'IIC/AKCL/CON/2026/01',
            ]);
    }

    /**
     * Test that nextNumber requires year parameter.
     */
    public function test_next_number_requires_year_parameter()
    {
        $response = $this->getJson('/api/contracts/next-number');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['year']);
    }

    /**
     * Test that nextNumber validates year format (4 digits).
     */
    public function test_next_number_validates_year_format()
    {
        $response = $this->getJson('/api/contracts/next-number?year=25');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['year']);
    }

    /**
     * Test that nextNumber validates year range.
     */
    public function test_next_number_validates_year_range()
    {
        $response = $this->getJson('/api/contracts/next-number?year=1999');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['year']);

        $response = $this->getJson('/api/contracts/next-number?year=2101');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['year']);
    }

    /**
     * Test that store creates a valid contract.
     */
    public function test_store_creates_contract_with_valid_data()
    {
        $buyer = Buyer::factory()->create();

        $contractData = [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => $buyer->id,
            'contract_date' => '2025-01-15',
            'amendment_date' => '2025-02-01',
            'total_orders' => 100,
            'order_quantity' => 5000,
            'value_usd' => 250000.50,
            'b2b_percent' => 45.5,
            'status' => 'active',
            'remarks' => 'Test contract',
        ];

        $response = $this->postJson('/api/contracts', $contractData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Contract created successfully',
                'contract' => [
                    'contract_no' => 'IIC/AKCL/CON/2025/01',
                    'buyer_id' => $buyer->id,
                ],
            ]);

        $this->assertDatabaseHas('contracts', [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => $buyer->id,
        ]);
    }

    /**
     * Test that store rejects invalid contract number format.
     */
    public function test_store_rejects_invalid_contract_number_format()
    {
        $buyer = Buyer::factory()->create();

        $invalidFormats = [
            'INVALID-FORMAT',
            'IIC/AKCL/CON/25/01',  // 2-digit year
            'IIC/AKCL/CON/2025/1',  // Single digit NN
            'IIC/AKCL/CON/2025/100', // 3-digit NN
            'AKCL/CON/2025/01',     // Missing prefix
        ];

        foreach ($invalidFormats as $invalidFormat) {
            $contractData = [
                'contract_no' => $invalidFormat,
                'buyer_id' => $buyer->id,
                'contract_date' => '2025-01-15',
                'total_orders' => 100,
                'order_quantity' => 5000,
                'value_usd' => 250000.50,
                'b2b_percent' => 45.5,
                'status' => 'draft',
            ];

            $response = $this->postJson('/api/contracts', $contractData);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['contract_no']);
        }
    }

    /**
     * Test that store rejects duplicate contract numbers.
     */
    public function test_store_rejects_duplicate_contract_number()
    {
        $buyer = Buyer::factory()->create();

        // Create first contract
        Contract::factory()->create([
            'buyer_id' => $buyer->id,
            'contract_no' => 'IIC/AKCL/CON/2025/05',
        ]);

        // Try to create duplicate
        $contractData = [
            'contract_no' => 'IIC/AKCL/CON/2025/05',
            'buyer_id' => $buyer->id,
            'contract_date' => '2025-01-15',
            'total_orders' => 100,
            'order_quantity' => 5000,
            'value_usd' => 250000.50,
            'b2b_percent' => 45.5,
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/contracts', $contractData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['contract_no']);
    }

    /**
     * Test that store requires all mandatory fields.
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->postJson('/api/contracts', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'contract_no',
                'buyer_id',
                'contract_date',
                'total_orders',
                'order_quantity',
                'value_usd',
                'b2b_percent',
                'status',
            ]);
    }

    /**
     * Test that store validates amendment_date is after or equal to contract_date.
     */
    public function test_store_validates_amendment_date_constraint()
    {
        $buyer = Buyer::factory()->create();

        $contractData = [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => $buyer->id,
            'contract_date' => '2025-02-01',
            'amendment_date' => '2025-01-01', // Before contract_date
            'total_orders' => 100,
            'order_quantity' => 5000,
            'value_usd' => 250000.50,
            'b2b_percent' => 45.5,
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/contracts', $contractData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amendment_date']);
    }

    /**
     * Test that store validates B2B percentage range (0-100).
     */
    public function test_store_validates_b2b_percent_range()
    {
        $buyer = Buyer::factory()->create();

        // Test below minimum
        $contractData = [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => $buyer->id,
            'contract_date' => '2025-01-15',
            'total_orders' => 100,
            'order_quantity' => 5000,
            'value_usd' => 250000.50,
            'b2b_percent' => -5,
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/contracts', $contractData);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['b2b_percent']);

        // Test above maximum
        $contractData['b2b_percent'] = 150;
        $contractData['contract_no'] = 'IIC/AKCL/CON/2025/02';

        $response = $this->postJson('/api/contracts', $contractData);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['b2b_percent']);
    }

    /**
     * Test that store validates buyer_id exists.
     */
    public function test_store_validates_buyer_exists()
    {
        $contractData = [
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'buyer_id' => 99999, // Non-existent buyer
            'contract_date' => '2025-01-15',
            'total_orders' => 100,
            'order_quantity' => 5000,
            'value_usd' => 250000.50,
            'b2b_percent' => 45.5,
            'status' => 'draft',
        ];

        $response = $this->postJson('/api/contracts', $contractData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['buyer_id']);
    }
}
