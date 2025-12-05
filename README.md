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

### Backend Tests

```bash
cd backend
php artisan test
```

### Frontend E2E Tests (Playwright)

```bash
cd frontend
npx playwright test
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

## Current Status

✅ Phase 1: Project setup complete

- Backend initialized with Laravel
- Frontend initialized with React + Vite
- Folder structure created
- Dependencies installed
- Tailwind CSS configured

🔄 Next: Phase 2 - Database migrations and models

## License

Private project for AKCL Group
