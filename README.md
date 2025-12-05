# LC Management System - Sales Contracts

Full-stack sales contract management system with React frontend, Laravel backend, and comprehensive testing.

## Project Structure

```
master-lc-management-spec/
├── backend/           # Laravel 12 API
├── frontend/          # React + Vite + Tailwind
└── specs/             # Feature specifications
```

## Prerequisites

- PHP 8.2+ with Composer
- Node.js 18+ with npm
- MySQL 8+ or PostgreSQL 13+
- Git

## Backend Setup (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Configure database
cp .env.example .env
# Edit .env with your database credentials

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --seed

# Start development server
php artisan serve
```

Backend will run at: `http://localhost:8000`

## Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (already set in .env.local)
# VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

## Running Tests

### Backend Tests (PHPUnit)

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test --filter ContractControllerTest

# Run with coverage
php artisan test --coverage
```

### Frontend E2E Tests (Playwright)

```bash
cd frontend

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test add-contract.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode (interactive)
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## API Testing with cURL

### Get Next Contract Number

```bash
curl "http://localhost:8000/api/contracts/next-number?year=2025"
```

### Create New Contract

```bash
curl -X POST "http://localhost:8000/api/contracts" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_no": "IIC/AKCL/CON/2025/01",
    "buyer_id": 1,
    "contract_date": "2025-01-15",
    "amendment_date": "2025-01-15",
    "total_orders": 100,
    "order_quantity": 5000,
    "value_usd": 250000.50,
    "b2b_percent": 45.5,
    "status": "draft",
    "remarks": "Initial contract"
  }'
```

### Get All Contracts (with pagination and filters)

```bash
# Basic list
curl "http://localhost:8000/api/contracts"

# With pagination
curl "http://localhost:8000/api/contracts?page=2&per_page=10"

# With search
curl "http://localhost:8000/api/contracts?search=ABC+Corporation"

# With status filter
curl "http://localhost:8000/api/contracts?status=active"

# Combined filters
curl "http://localhost:8000/api/contracts?search=Corp&status=active&page=1"
```

### Get Single Contract

```bash
curl "http://localhost:8000/api/contracts/1"
```

### Update Contract

```bash
curl -X PUT "http://localhost:8000/api/contracts/1" \
  -H "Content-Type: application/json" \
  -d '{
    "contract_no": "IIC/AKCL/CON/2025/01",
    "buyer_id": 1,
    "contract_date": "2025-01-15",
    "amendment_date": "2025-02-15",
    "total_orders": 150,
    "order_quantity": 7500,
    "value_usd": 375000.00,
    "b2b_percent": 50.0,
    "status": "active",
    "remarks": "Updated contract details"
  }'
```

### Get All Buyers

```bash
curl "http://localhost:8000/api/buyers"
```

## API Endpoints

### Contract Endpoints

- `GET /api/contracts` - List all contracts with pagination
- `POST /api/contracts` - Create new contract
- `GET /api/contracts/{id}` - Get single contract
- `PUT /api/contracts/{id}` - Update contract
- `GET /api/contracts/next-number?year=YYYY` - Generate next contract number

### Buyer Endpoints

- `GET /api/buyers` - List all buyers

## Contract Number Format

Format: `IIC/AKCL/CON/YYYY/NN`

- **IIC/AKCL/CON**: Fixed prefix
- **YYYY**: 4-digit year
- **NN**: 2-digit sequential number (01-99)

Example: `IIC/AKCL/CON/2025/01`

## Development Workflow

1. Backend runs on port 8000
2. Frontend runs on port 5173 (Vite default)
3. API calls from frontend go to `http://localhost:8000/api`
4. CORS configured to allow localhost:5173

## Technology Stack

**Backend:**

- Laravel 12
- Laravel Sanctum (API authentication)
- MySQL/PostgreSQL
- PHPUnit (testing)

**Frontend:**

- React 18
- Vite
- Tailwind CSS 3
- React Hook Form + Zod (validation)
- Headless UI (components)
- Axios (HTTP client)
- Playwright (E2E testing)

## Features Implemented

### ✅ Phase 1-3: Foundation & Dashboard (T001-T033)

- Project setup with Laravel 12 and React 18
- Database migrations and seeders
- Contract and Buyer models with relationships
- Dashboard overview with summary cards
- Contract table with pagination

### ✅ Phase 4: Create New Contract (T034-T052)

- Auto-generate contract numbers with format validation
- React Hook Form + Zod validation
- Backend validation matching frontend rules
- Headless UI modal components
- 19 Playwright E2E tests

### ✅ Phase 5: Search and Filter (T053-T060)

- Search by buyer name or contract number
- Filter by contract status
- Clear filters functionality
- Summary statistics reflect filtered results
- 25+ E2E tests for search/filter scenarios

### ✅ Phase 6: View and Edit Contracts (T061-T071)

- View contract modal (read-only)
- Edit contract modal (reuses form component)
- Contract number protected (read-only in edit mode)
- Full validation on updates
- 20+ E2E tests for view/edit workflow

### 🔄 Phase 7: Documentation (In Progress)

- README with setup instructions
- cURL examples for API testing
- Test running instructions

## Test Coverage

**Backend Tests (PHPUnit):**

- 30+ feature tests for API endpoints
- Contract creation validation (10 tests)
- Contract update validation (9 tests)
- Next number generation (7 tests)
- Show endpoint tests (2 tests)

**Frontend Tests (Playwright):**

- 19 tests: Contract creation workflow
- 25 tests: Search and filter functionality
- 20 tests: View and edit workflow
- **Total: 64+ E2E tests**

## Contributing

### Before Creating PR

- [ ] All PHPUnit tests passing (`php artisan test`)
- [ ] All Playwright tests passing (`npx playwright test`)
- [ ] Code follows Laravel and React best practices
- [ ] New features have corresponding tests
- [ ] Database migrations included if schema changed
- [ ] README updated if new endpoints added

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding tests
- `docs:` - Documentation updates
- `chore:` - Maintenance tasks

Example: `feat: add search and filter functionality to contracts overview`

## License

Private project for AKCL Group
