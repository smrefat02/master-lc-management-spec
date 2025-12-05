<?php

namespace Tests\Unit;

use App\Models\Contract;
use App\Services\ContractNumberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ContractNumberService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ContractNumberService();
    }

    /** @test */
    public function it_generates_first_contract_number_for_year()
    {
        $contractNo = $this->service->generateNextNumber(2025);
        
        $this->assertEquals('IIC/AKCL/CON/2025/01', $contractNo);
    }

    /** @test */
    public function it_generates_sequential_contract_numbers()
    {
        // Create first contract
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-01-15',
        ]);

        $contractNo = $this->service->generateNextNumber(2025);
        
        $this->assertEquals('IIC/AKCL/CON/2025/02', $contractNo);
    }

    /** @test */
    public function it_generates_independent_numbers_per_year()
    {
        // Create contracts for 2024
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2024/01',
            'contract_date' => '2024-01-15',
        ]);
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2024/02',
            'contract_date' => '2024-02-20',
        ]);

        // Create contract for 2025
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-01-10',
        ]);

        // Next number for 2024 should be 03
        $contractNo2024 = $this->service->generateNextNumber(2024);
        $this->assertEquals('IIC/AKCL/CON/2024/03', $contractNo2024);

        // Next number for 2025 should be 02
        $contractNo2025 = $this->service->generateNextNumber(2025);
        $this->assertEquals('IIC/AKCL/CON/2025/02', $contractNo2025);
    }

    /** @test */
    public function it_handles_gaps_in_sequence()
    {
        // Create contracts with gaps
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2025/01',
            'contract_date' => '2025-01-15',
        ]);
        Contract::factory()->create([
            'contract_no' => 'IIC/AKCL/CON/2025/05',
            'contract_date' => '2025-02-20',
        ]);

        // Should generate 06 (next after highest)
        $contractNo = $this->service->generateNextNumber(2025);
        
        $this->assertEquals('IIC/AKCL/CON/2025/06', $contractNo);
    }

    /** @test */
    public function it_pads_sequence_numbers_with_zeros()
    {
        $contractNo = $this->service->generateNextNumber(2025);
        
        // First number should be 01 (zero-padded)
        $this->assertStringEndsWith('/01', $contractNo);
        
        // Create 8 more contracts to reach 09
        for ($i = 1; $i <= 9; $i++) {
            Contract::factory()->create([
                'contract_no' => sprintf('IIC/AKCL/CON/2025/%02d', $i),
                'contract_date' => '2025-01-15',
            ]);
        }
        
        // 10th contract should not have leading zero
        $contractNo10 = $this->service->generateNextNumber(2025);
        $this->assertEquals('IIC/AKCL/CON/2025/10', $contractNo10);
    }
}
