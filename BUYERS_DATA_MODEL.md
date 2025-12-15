# Buyers Module - Data Model Specification

**Project:** LC Management System  
**Module:** Buyers Management  
**Version:** 1.0.0  
**Date:** December 11, 2025  
**Database:** MySQL/SQLite

---

## 📊 Database Schema Overview

The Buyers module uses a single standalone table with no foreign key dependencies. Buyers can be referenced by other modules (Contracts, Master LCs) via foreign keys pointing TO the buyers table.

---

## 🗂️ Table: `buyers`

### Complete Table Structure

```sql
CREATE TABLE `buyers` (
  -- Primary Key
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Buyer Information
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `contact_person` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `country` VARCHAR(100) NULL,
  `address` TEXT NULL,

  -- Status
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

  -- Timestamps
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,

  -- Constraints
  PRIMARY KEY (`id`),
  UNIQUE KEY `buyers_code_unique` (`code`),
  KEY `buyers_status_index` (`status`),
  KEY `buyers_name_index` (`name`),
  KEY `buyers_country_index` (`country`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 Column Specifications

### Primary Key

| Column | Type            | Attributes                  | Description       |
| ------ | --------------- | --------------------------- | ----------------- |
| `id`   | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |

---

### Buyer Information Fields

| Column           | Type         | Nullable | Default | Description          | Example           |
| ---------------- | ------------ | -------- | ------- | -------------------- | ----------------- |
| `name`           | VARCHAR(255) | No       | -       | Company/buyer name   | "ABC Trading Co." |
| `code`           | VARCHAR(50)  | No       | -       | Unique short code    | "ABC01"           |
| `contact_person` | VARCHAR(255) | Yes      | NULL    | Primary contact name | "John Smith"      |
| `email`          | VARCHAR(255) | Yes      | NULL    | Contact email        | "john@abc.com"    |
| `phone`          | VARCHAR(50)  | Yes      | NULL    | Contact phone        | "+1-555-0123"     |
| `country`        | VARCHAR(100) | Yes      | NULL    | Country name         | "USA"             |
| `address`        | TEXT         | Yes      | NULL    | Full address         | "123 Street..."   |

---

### Status Field

| Column   | Type | Nullable | Default  | Description    |
| -------- | ---- | -------- | -------- | -------------- |
| `status` | ENUM | No       | 'active' | Current status |

**Allowed Values:**

| Value      | Description                     | Badge Color |
| ---------- | ------------------------------- | ----------- |
| `active`   | Buyer is active and can be used | Green       |
| `inactive` | Buyer is inactive/archived      | Red         |

---

### Timestamp Fields

| Column       | Type      | Nullable | Description          |
| ------------ | --------- | -------- | -------------------- |
| `created_at` | TIMESTAMP | Yes      | Record creation time |
| `updated_at` | TIMESTAMP | Yes      | Last update time     |

---

## 🔑 Indexes

| Index Name             | Column(s) | Type    | Purpose                  |
| ---------------------- | --------- | ------- | ------------------------ |
| `PRIMARY`              | id        | Primary | Row identification       |
| `buyers_code_unique`   | code      | Unique  | Ensure code uniqueness   |
| `buyers_status_index`  | status    | Index   | Filter by status         |
| `buyers_name_index`    | name      | Index   | Search/sort by name      |
| `buyers_country_index` | country   | Index   | Filter/search by country |

---

## 📐 Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│                BUYERS                    │
├─────────────────────────────────────────┤
│ PK │ id          │ BIGINT UNSIGNED      │
├────┼─────────────┼──────────────────────┤
│    │ name        │ VARCHAR(255) NOT NULL│
│ UK │ code        │ VARCHAR(50) NOT NULL │
│    │ contact_person │ VARCHAR(255) NULL │
│    │ email       │ VARCHAR(255) NULL    │
│    │ phone       │ VARCHAR(50) NULL     │
│    │ country     │ VARCHAR(100) NULL    │
│    │ address     │ TEXT NULL            │
│    │ status      │ ENUM('active','inactive') │
│    │ created_at  │ TIMESTAMP NULL       │
│    │ updated_at  │ TIMESTAMP NULL       │
└─────────────────────────────────────────┘
          │
          │ Referenced by (1:N)
          ▼
┌─────────────────────────────────────────┐
│              CONTRACTS                   │
├─────────────────────────────────────────┤
│ FK │ buyer_id    │ → buyers.id          │
└─────────────────────────────────────────┘
          │
          │ Referenced by (1:N)
          ▼
┌─────────────────────────────────────────┐
│             MASTER_LCS                   │
├─────────────────────────────────────────┤
│    │ buyer_info  │ JSON (contains name) │
└─────────────────────────────────────────┘
```

**Relationship Notes:**

- Buyers is a **standalone module** with no outgoing foreign keys
- Other modules reference buyers via:
  - `contracts.buyer_id` → `buyers.id` (direct FK)
  - `master_lcs.buyer_info` → Contains buyer name (JSON snapshot)
- Deleting a buyer should be prevented if referenced by contracts

---

## 🔄 Laravel Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('buyers', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Buyer Information
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->string('contact_person', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->text('address')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive'])->default('active');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('name');
            $table->index('country');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyers');
    }
};
```

---

## 🏭 Laravel Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Buyer extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'buyers';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'code',
        'contact_person',
        'email',
        'phone',
        'country',
        'address',
        'status',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the contracts for the buyer.
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    /**
     * Scope for active buyers only.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for inactive buyers only.
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope for search by name, code, country, or email.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('country', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }

    /**
     * Check if buyer can be deleted.
     */
    public function canDelete(): bool
    {
        return $this->contracts()->count() === 0;
    }
}
```

---

## 📊 Sample Data

### Example Records

```json
[
  {
    "id": 1,
    "name": "ABC Trading Co. Ltd",
    "code": "ABC01",
    "contact_person": "John Smith",
    "email": "john@abctrading.com",
    "phone": "+1-555-0123",
    "country": "USA",
    "address": "123 Trade Street, New York, NY 10001",
    "status": "active",
    "created_at": "2025-12-01T10:30:00.000000Z",
    "updated_at": "2025-12-01T10:30:00.000000Z"
  },
  {
    "id": 2,
    "name": "XYZ International Ltd",
    "code": "XYZ01",
    "contact_person": "Jane Doe",
    "email": "jane@xyzint.com",
    "phone": "+44-20-7946-0958",
    "country": "UK",
    "address": "456 Commerce Road, London EC1A 1BB",
    "status": "active",
    "created_at": "2025-12-02T14:15:00.000000Z",
    "updated_at": "2025-12-02T14:15:00.000000Z"
  },
  {
    "id": 3,
    "name": "Global Imports Inc",
    "code": "GLB01",
    "contact_person": "Mike Johnson",
    "email": "mike@globalimports.com",
    "phone": "+1-555-0456",
    "country": "Canada",
    "address": "789 Import Avenue, Toronto, ON M5V 2H1",
    "status": "inactive",
    "created_at": "2025-12-03T09:45:00.000000Z",
    "updated_at": "2025-12-05T11:30:00.000000Z"
  }
]
```

---

## 🔧 Database Seeder

```php
<?php

namespace Database\Seeders;

use App\Models\Buyer;
use Illuminate\Database\Seeder;

class BuyerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $buyers = [
            [
                'name' => 'ABC Trading Co. Ltd',
                'code' => 'ABC01',
                'contact_person' => 'John Smith',
                'email' => 'john@abctrading.com',
                'phone' => '+1-555-0123',
                'country' => 'USA',
                'address' => '123 Trade Street, New York, NY 10001',
                'status' => 'active',
            ],
            [
                'name' => 'XYZ International Ltd',
                'code' => 'XYZ01',
                'contact_person' => 'Jane Doe',
                'email' => 'jane@xyzint.com',
                'phone' => '+44-20-7946-0958',
                'country' => 'UK',
                'address' => '456 Commerce Road, London EC1A 1BB',
                'status' => 'active',
            ],
            [
                'name' => 'Global Imports Inc',
                'code' => 'GLB01',
                'contact_person' => 'Mike Johnson',
                'email' => 'mike@globalimports.com',
                'phone' => '+1-555-0456',
                'country' => 'Canada',
                'address' => '789 Import Avenue, Toronto, ON M5V 2H1',
                'status' => 'inactive',
            ],
            [
                'name' => 'European Trade Partners',
                'code' => 'ETP01',
                'contact_person' => 'Hans Mueller',
                'email' => 'hans@eurotrade.eu',
                'phone' => '+49-30-1234567',
                'country' => 'Germany',
                'address' => 'Handelsstraße 10, 10115 Berlin',
                'status' => 'active',
            ],
            [
                'name' => 'Asia Pacific Traders',
                'code' => 'APT01',
                'contact_person' => 'Li Wei',
                'email' => 'liwei@aptrade.hk',
                'phone' => '+852-2123-4567',
                'country' => 'Hong Kong',
                'address' => 'Trade Tower, 88 Queensway, Admiralty',
                'status' => 'active',
            ],
        ];

        foreach ($buyers as $buyer) {
            Buyer::create($buyer);
        }
    }
}
```

---

## 📈 Data Constraints Summary

| Constraint | Type        | Description                     |
| ---------- | ----------- | ------------------------------- |
| `id`       | Primary Key | Auto-increment identifier       |
| `code`     | Unique      | No duplicate codes allowed      |
| `status`   | Enum        | Must be 'active' or 'inactive'  |
| `name`     | Not Null    | Name is required                |
| `email`    | Format      | Must be valid email if provided |

---

## 🔄 Data Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CREATE    │────▶│   ACTIVE    │────▶│  INACTIVE   │
│  (via API)  │     │  (default)  │     │ (can toggle)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Referenced  │     │   DELETE    │
                    │ by Contract │     │ (if no refs)│
                    └─────────────┘     └─────────────┘
```

---

**End of Data Model Document**
