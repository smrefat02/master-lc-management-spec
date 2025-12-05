# Quickstart Guide: Sales Contract Management UI

**Feature**: 001-contract-management-ui  
**Purpose**: Get the contract management system running locally in under 15 minutes  
**Prerequisites**: PHP 8.1+, Composer, Node.js 18+, MySQL/PostgreSQL

## Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Setup (Laravel)](#backend-setup-laravel)
- [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Running Tests](#running-tests)
- [Quick Feature Tour](#quick-feature-tour)
- [API Testing](#api-testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP**: 8.1 or higher

  ```bash
  php --version
  ```

- **Composer**: Latest version

  ```bash
  composer --version
  ```

- **Node.js**: 18.x or higher

  ```bash
  node --version
  ```

- **npm**: Comes with Node.js

  ```bash
  npm --version
  ```

- **Database**: MySQL 8+ or PostgreSQL 13+

  ```bash
  mysql --version  # or
  psql --version
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

---

## Backend Setup (Laravel)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Configure Database

Edit `.env` file with your database credentials:

```env
DB_CONNECTION=mysql          # or 'pgsql' for PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=3306                 # 5432 for PostgreSQL
DB_DATABASE=lc_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 6. Create Database

```bash
# MySQL
mysql -u your_username -p -e "CREATE DATABASE lc_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# PostgreSQL
createdb lc_management
```

### 7. Run Migrations and Seeders

```bash
php artisan migrate --seed
```

This will:

- Create `buyers` and `contracts` tables
- Seed sample buyer data
- Seed sample contract data for testing

### 8. Configure CORS and Sanctum

Update `.env` with frontend URL:

```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### 9. Start Laravel Development Server

```bash
php artisan serve
```

Backend now running at: **http://localhost:8000**

Test the API:

```bash
curl http://localhost:8000/api/contracts
```

---

## Frontend Setup (React + Vite)

### 1. Navigate to Frontend Directory

Open a new terminal:

```bash
cd frontend
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env.local` file:

```bash
echo "VITE_API_URL=http://localhost:8000/api" > .env.local
```

### 4. Start Vite Development Server

```bash
npm run dev
```

Frontend now running at: **http://localhost:3000**

---

## Running Tests

### Backend Tests (PHPUnit)

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ContractApiTest.php

# Run with coverage
php artisan test --coverage
```

**Expected Output**:

```
PASS  Tests\Feature\ContractApiTest
✓ it lists contracts with summary statistics
✓ it creates a new contract with valid data
✓ it validates contract number format
✓ it prevents duplicate contract numbers
✓ it generates next contract number
```

### End-to-End Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/contract-creation.spec.js

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with UI mode (interactive)
npx playwright test --ui
```

**Expected Output**:

```
Running 12 tests using 3 workers

✓ dashboard.spec.js:5:1 › Dashboard loads with summary cards
✓ dashboard.spec.js:12:1 › Contract table renders rows
✓ contract-creation.spec.js:8:1 › Opens add contract modal
✓ contract-creation.spec.js:15:1 › Auto-generates contract number
✓ contract-validation.spec.js:10:1 › Rejects invalid contract number
✓ contract-validation.spec.js:18:1 › Accepts valid contract number
```

---

## Quick Feature Tour

### 1. Open the Application

Navigate to **http://localhost:3000** in your browser.

### 2. Dashboard Overview

You should see:

- **4 Summary Cards** at the top:

  - Total Contracts: Shows count of all contracts
  - Total LC Value: Sum of all contract values in USD
  - Total Order Qty: Sum of all order quantities
  - Avg B2B %: Average B2B percentage

- **Contracts Table** below with columns:

  - Buyer Name
  - Contract No (format: IIC/AKCL/CON/YYYY/NN)
  - Amendment Date
  - Total Orders
  - Order Quantity
  - Master LC Value (USD)
  - B2B %
  - Status (colored badge)
  - Actions (Show/Edit buttons - placeholders for P3)

- **Pagination Controls** at the bottom

### 3. Create a New Contract

1. Click **"Add New Contract"** button (top-right)
2. Modal opens with form fields:

   - **Contract No**: Auto-filled (e.g., `IIC/AKCL/CON/2025/03`)
   - **Buyer**: Dropdown with buyer names
   - **Contract Date**: Date picker
   - **Amendment Date**: Date picker
   - **Total Orders**: Number input
   - **Order Quantity**: Number input
   - **Total Contract Value (USD)**: Number input
   - **Overall B2B %**: Percentage input (0-100)
   - **Status**: Dropdown (Draft, Active, etc.)
   - **Remarks**: Textarea (optional)

3. Observe **Auto-Generated Contract Number**:

   - Format: `IIC/AKCL/CON/2025/03`
   - Try editing it manually (validation triggers)

4. **Test Validation**:

   - Change contract number to invalid format: `IIC-AKCL-CON-2025-03`
   - Inline error appears: "Invalid contract number format..."
   - Save button is disabled

5. **Fill Valid Data and Submit**:
   - Select a buyer
   - Fill all required fields
   - Click **"Save"**
   - Modal closes
   - Success toast appears
   - Table refreshes with new contract

### 4. Search and Filter

1. **Search by Buyer Name**:

   - Type buyer name in search box
   - Table updates in real-time

2. **Search by Contract Number**:

   - Type contract number (e.g., `IIC/AKCL/CON/2025/01`)
   - Table filters to matching contracts

3. **Filter by Status**:

   - Select status from dropdown (Active, Draft, etc.)
   - Table shows only contracts with selected status

4. **Clear Filters**:
   - Click "Clear" button
   - Table shows all contracts again

### 5. Pagination

1. Scroll to bottom of table
2. Click page numbers to navigate
3. Change items per page (if implemented)

---

## API Testing

### Using cURL

#### 1. List All Contracts

```bash
curl -X GET "http://localhost:8000/api/contracts" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "buyer_name": "ABC Company",
      "contract_no": "IIC/AKCL/CON/2025/01",
      "contract_date": "2025-01-15",
      "total_orders": 5,
      "value_usd": 50000.0,
      "status": "Active"
    }
  ],
  "summary": {
    "total_contracts": 42,
    "total_lc_value": 2150000.0,
    "total_order_qty": 48500,
    "avg_b2b": 72.35
  },
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 42
  }
}
```

#### 2. Get Next Contract Number

```bash
curl -X GET "http://localhost:8000/api/contracts/next-number?year=2025" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "contract_number": "IIC/AKCL/CON/2025/03"
}
```

#### 3. Create New Contract

```bash
curl -X POST "http://localhost:8000/api/contracts" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "buyer_id": 1,
    "contract_no": "IIC/AKCL/CON/2025/04",
    "contract_date": "2025-02-01",
    "amendment_date": "2025-02-01",
    "total_orders": 3,
    "order_quantity": 500,
    "value_usd": 25000.00,
    "b2b_percent": 80.00,
    "status": "Draft",
    "remarks": "Test contract"
  }'
```

**Success Response (201):**

```json
{
  "message": "Contract created successfully",
  "data": {
    "id": 5,
    "buyer_id": 1,
    "contract_no": "IIC/AKCL/CON/2025/04",
    ...
  }
}
```

**Validation Error Response (400):**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "contract_no": [
      "The contract number format is invalid. Must match: IIC/AKCL/CON/YYYY/NN"
    ],
    "b2b_percent": ["The B2B percentage must be between 0 and 100."]
  }
}
```

#### 4. List All Buyers

```bash
curl -X GET "http://localhost:8000/api/buyers" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "data": [
    { "id": 1, "name": "ABC Company" },
    { "id": 2, "name": "XYZ Corporation" }
  ]
}
```

### Using Postman

1. Import OpenAPI spec: `specs/001-contract-management-ui/contracts/api-endpoints.yaml`
2. Set base URL: `http://localhost:8000/api`
3. Test all endpoints with provided examples

---

## Troubleshooting

### Backend Issues

**Problem**: `Connection refused` when accessing API

**Solution**:

- Ensure Laravel server is running: `php artisan serve`
- Check port 8000 is not in use: `netstat -an | grep 8000`

---

**Problem**: Database migration fails

**Solution**:

```bash
# Reset database
php artisan migrate:fresh --seed

# Check database connection
php artisan tinker
DB::connection()->getPdo();
```

---

**Problem**: CORS errors in browser console

**Solution**:

- Verify `.env` has `FRONTEND_URL=http://localhost:3000`
- Check `config/cors.php` allows `localhost:3000`
- Clear config cache: `php artisan config:clear`

---

### Frontend Issues

**Problem**: `Cannot connect to API` error

**Solution**:

- Verify `.env.local` has `VITE_API_URL=http://localhost:8000/api`
- Ensure backend is running
- Restart Vite dev server: `npm run dev`

---

**Problem**: Contract number validation not working

**Solution**:

- Check regex pattern in validation.js matches: `^IIC\/AKCL\/CON\/\d{4}\/\d{2}$`
- Verify frontend is calling `/contracts/next-number` on modal open
- Check browser console for JavaScript errors

---

**Problem**: Modal not opening

**Solution**:

- Check Headless UI Dialog is installed: `npm list @headlessui/react`
- Verify modal state management in `ContractsOverview`
- Check browser console for React errors

---

### Playwright Test Issues

**Problem**: Tests failing with "element not found"

**Solution**:

- Ensure test database is seeded: `php artisan migrate:fresh --seed --env=testing`
- Increase timeouts in `playwright.config.js`
- Run in headed mode to see what's happening: `npx playwright test --headed`

---

**Problem**: Tests passing locally but failing in CI

**Solution**:

- Verify CI environment has database configured
- Check backend is running during E2E tests
- Review CI logs for environment differences

---

## Next Steps

Now that you have the system running:

1. ✅ Explore the dashboard and create contracts
2. ✅ Review the codebase structure (see [plan.md](./plan.md))
3. ✅ Run all tests to ensure everything works
4. ⏩ Proceed with development using `/speckit.tasks` for detailed task breakdown
5. ⏩ Implement P1 user stories first (Dashboard + Contract Creation)
6. ⏩ Add P2 features (Search/Filter) after P1 is stable
7. ⏩ Consider P3 features (Edit functionality) in future iteration

---

## Useful Commands

### Backend

```bash
# Clear all caches
php artisan optimize:clear

# Generate IDE helper (for autocompletion)
php artisan ide-helper:generate

# Run database seeders only
php artisan db:seed

# Rollback last migration
php artisan migrate:rollback

# View routes
php artisan route:list
```

### Frontend

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

### Git

```bash
# Commit your changes
git add .
git commit -m "Implement contract creation feature"

# Push to feature branch
git push origin 001-contract-management-ui
```

---

## Support

For issues or questions:

- Review [spec.md](./spec.md) for feature requirements
- Check [data-model.md](./data-model.md) for entity definitions
- Consult [contracts/api-endpoints.yaml](./contracts/api-endpoints.yaml) for API details
- See [plan.md](./plan.md) for implementation guidance

**Happy coding! 🚀**
