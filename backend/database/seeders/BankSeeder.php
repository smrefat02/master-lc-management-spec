<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            [
                'name' => 'HSBC Hong Kong',
                'swift_code' => 'HSBCHKHHHKH',
                'address' => '1 Queen\'s Road Central',
                'country' => 'Hong Kong',
                'branch' => 'Head Office',
                'contact_person' => 'John Smith',
                'phone' => '+852 2822 1111',
                'email' => 'trade.finance@hsbc.com.hk',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Standard Chartered Bank',
                'swift_code' => 'SCBLHKHH',
                'address' => '32 Des Voeux Road Central',
                'country' => 'Hong Kong',
                'branch' => 'Central Branch',
                'contact_person' => 'Jane Doe',
                'phone' => '+852 2886 8868',
                'email' => 'trade.services@sc.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Citibank N.A.',
                'swift_code' => 'CITIHKHX',
                'address' => '50 Garden Road',
                'country' => 'Hong Kong',
                'branch' => 'Central',
                'contact_person' => 'Michael Chen',
                'phone' => '+852 2860 0333',
                'email' => 'citi.trade@citi.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Bank of China (Hong Kong)',
                'swift_code' => 'BKCHHKHH',
                'address' => 'Bank of China Tower, 1 Garden Road',
                'country' => 'Hong Kong',
                'branch' => 'Main Branch',
                'contact_person' => 'Li Wei',
                'phone' => '+852 2826 6888',
                'email' => 'boc.trade@bochk.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'DBS Bank (Hong Kong)',
                'swift_code' => 'DHBKHKHH',
                'address' => '11th Floor, The Center, 99 Queen\'s Road Central',
                'country' => 'Hong Kong',
                'branch' => 'Central',
                'contact_person' => 'David Tan',
                'phone' => '+852 2290 8888',
                'email' => 'dbs.trade@dbs.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('banks')->insert($banks);
    }
}
