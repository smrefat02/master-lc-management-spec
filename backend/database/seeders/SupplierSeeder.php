<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 diverse sample suppliers
        $suppliers = [
            [
                'name' => 'Acme Corporation',
                'code' => 'SUP0001',
                'contact_person' => 'John Smith',
                'email' => 'john.smith@acme.com',
                'phone' => '+1 (555) 123-4567',
                'country' => 'United States',
                'address' => '123 Main Street, New York, NY 10001',
                'status' => 'active',
            ],
            [
                'name' => 'Global Supplies Ltd',
                'code' => 'SUP0002',
                'contact_person' => 'Jane Doe',
                'email' => 'jane.doe@globalsupplies.com',
                'phone' => '+44 20 7123 4567',
                'country' => 'United Kingdom',
                'address' => '456 Oxford Street, London, W1D 1BS',
                'status' => 'active',
            ],
            [
                'name' => 'Shanghai Manufacturing Co',
                'code' => 'SUP0003',
                'contact_person' => 'Li Wei',
                'email' => 'li.wei@shanghaimfg.com',
                'phone' => '+86 21 1234 5678',
                'country' => 'China',
                'address' => '789 Nanjing Road, Shanghai, 200001',
                'status' => 'active',
            ],
            [
                'name' => 'Deutsche Industrie GmbH',
                'code' => 'SUP0004',
                'contact_person' => 'Hans Mueller',
                'email' => 'hans.mueller@deutscheindustrie.de',
                'phone' => '+49 30 1234 5678',
                'country' => 'Germany',
                'address' => '321 Friedrichstrasse, Berlin, 10117',
                'status' => 'active',
            ],
            [
                'name' => 'Inactive Test Supplier',
                'code' => 'SUP0005',
                'contact_person' => 'Test User',
                'email' => 'test@inactive.com',
                'phone' => '+1 (555) 999-9999',
                'country' => 'United States',
                'address' => '999 Test Avenue, Test City, TC 99999',
                'status' => 'inactive',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::create($supplier);
        }
    }
}
