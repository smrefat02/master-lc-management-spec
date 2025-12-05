# Research: Playwright E2E Test Organization for Contract Management System

**Date:** December 4, 2025  
**Project:** Contract Management UI  
**Scope:** Test organization for 5 test files with real Laravel backend

---

## Executive Summary

**Recommended Approach:**

- **Page Object Model:** Use lightweight POM for reusable components (modals, tables)
- **Test Data Strategy:** API-based seeding via Laravel endpoints + fixtures for edge cases
- **Backend Integration:** Real Laravel backend with isolated test database
- **Test Organization:** Group by user story with shared fixtures

**Key Decision:** Use a **hybrid approach** - Page Objects for complex UI components (contract creation modal, table interactions) combined with direct locators for simple tests (dashboard layout). This balances maintainability with simplicity for a 5-file test suite.

---

## 1. Test Organization by User Story

### Recommended Structure

```
tests/
├── fixtures/
│   ├── auth.setup.ts              # Authentication fixture
│   ├── contract.fixture.ts        # Contract test data
│   └── pages/
│       ├── ContractModal.ts       # POM for creation modal
│       ├── ContractTable.ts       # POM for table interactions
│       └── DashboardPage.ts       # POM for dashboard
├── P1-core/
│   ├── dashboard.spec.ts          # Dashboard layout & summary
│   └── contract-creation.spec.ts  # Modal workflow & submission
├── P2-search-filter/
│   ├── search-filter.spec.ts      # Search & filtering
│   └── pagination.spec.ts         # Pagination controls
└── P3-validation/
    └── contract-validation.spec.ts # Form validation rules
```

### Organization Rationale

1. **Priority-based folders** align with development phases
2. **Fixtures folder** centralizes reusable code and test data
3. **Page Objects** only for complex, reused components
4. **Each spec file** represents one user-facing feature

---

## 2. Page Object Model Decision

### Decision: Selective POM (Hybrid Approach)

**Use Page Objects for:**

- ✅ Contract Creation Modal (complex workflow)
- ✅ Contract Table (repeated interactions)
- ✅ Search/Filter Components (reused across tests)

**Use Direct Locators for:**

- ✅ Dashboard summary cards (simple, tested once)
- ✅ Pagination (straightforward interactions)
- ✅ Static layout elements

### Rationale

For a **5-file test suite**, full POM adds unnecessary abstraction. The hybrid approach:

- Reduces code duplication for complex components
- Maintains simplicity for one-off tests
- Keeps maintenance overhead low
- Allows easy scaling if test suite grows

### When to Use Full POM

Switch to full POM if:

- Test suite grows beyond 10 files
- Multiple team members maintain tests
- Components are reused across 5+ test files

---

## 3. Test Data Seeding Strategies

### Recommended: API-First with Fixture Fallback

#### Strategy Comparison

| Approach            | Pros                                 | Cons                   | Use Case                 |
| ------------------- | ------------------------------------ | ---------------------- | ------------------------ |
| **API Seeding**     | Fast, tests real endpoints, isolated | Requires API endpoints | Default for contracts    |
| **Database Direct** | Fastest, bypasses validation         | Skips business logic   | Performance testing only |
| **Fixtures**        | Version controlled, predictable      | Static, not dynamic    | Edge cases, invalid data |

### Implementation Pattern

```typescript
// fixtures/contract.fixture.ts
import { test as base, request } from "@playwright/test";

type ContractFixtures = {
  apiContext: APIRequestContext;
  createContract: (data: ContractData) => Promise<Contract>;
  cleanupContracts: () => Promise<void>;
};

export const test = base.extend<ContractFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: "http://localhost:8000",
      extraHTTPHeaders: {
        Accept: "application/json",
        "X-CSRF-TOKEN": process.env.CSRF_TOKEN || "",
      },
    });
    await use(context);
    await context.dispose();
  },

  createContract: async ({ apiContext }, use) => {
    const contracts: number[] = [];

    const create = async (data: Partial<ContractData> = {}) => {
      const response = await apiContext.post("/api/contracts", {
        data: {
          contract_number: data.contract_number || `CT-${Date.now()}`,
          buyer_name: data.buyer_name || "Test Buyer Inc.",
          effective_date: data.effective_date || "2024-01-01",
          expiry_date: data.expiry_date || "2024-12-31",
          status: data.status || "active",
          ...data,
        },
      });

      const contract = await response.json();
      contracts.push(contract.id);
      return contract;
    };

    await use(create);

    // Cleanup: Delete all created contracts
    for (const id of contracts) {
      await apiContext.delete(`/api/contracts/${id}`);
    }
  },

  cleanupContracts: async ({ apiContext }, use) => {
    await use(async () => {
      await apiContext.post("/api/test/reset-contracts");
    });
  },
});

export { expect } from "@playwright/test";
```

### Laravel Backend Requirements

```php
// routes/api.php (Test environment only)
if (App::environment('testing')) {
    Route::post('/test/reset-contracts', function () {
        DB::table('contracts')->where('created_by_test', true)->delete();
        return response()->json(['message' => 'Contracts reset']);
    });
}

// Tag test contracts for easy cleanup
class ContractFactory extends Factory {
    public function forTesting() {
        return $this->state(['created_by_test' => true]);
    }
}
```

---

## 4. Real Laravel Backend vs Mocked API

### Decision: Real Laravel Backend with Test Database

**Recommended Approach:**

```
┌─────────────┐      HTTP       ┌──────────────┐      ┌────────────────┐
│  Playwright │  ──────────────> │   Laravel    │ ───> │ Test Database  │
│   Tests     │                  │   Backend    │      │  (Isolated)    │
└─────────────┘                  └──────────────┘      └────────────────┘
```

### Benefits

✅ **End-to-End Confidence** - Tests real routing, validation, middleware  
✅ **Database Integration** - Tests migrations, relationships, transactions  
✅ **Laravel Features** - Tests events, jobs, policies, gates  
✅ **API Contracts** - Validates actual API responses

### Disadvantages of Mocking

❌ Miss integration issues  
❌ Mock maintenance overhead  
❌ False confidence (tests pass, app breaks)

### Configuration Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Serialize for database consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for database tests

  use: {
    baseURL: "http://localhost:8000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    // Setup project - runs before all tests
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },

    // Main test project
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },

    // Cleanup project - runs after all tests
    {
      name: "cleanup",
      testMatch: /global\.teardown\.ts/,
    },
  ],
});
```

### Laravel Test Environment

```bash
# .env.testing
APP_ENV=testing
APP_DEBUG=true
DB_DATABASE=lc_management_test
DB_CONNECTION=mysql_testing

# Run migrations before tests
php artisan migrate:fresh --env=testing --database=mysql_testing
```

---

## 5. Fixture Patterns for Test Independence

### Core Principle: Isolated Test State

Each test should:

1. Create its own data
2. Clean up after itself
3. Never depend on other tests
4. Be runnable in any order

### Pattern 1: Auto-Cleanup Fixtures

```typescript
// fixtures/auth.setup.ts
import { test as base } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before test
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard");

    // Provide authenticated page to test
    await use(page);

    // Teardown: Logout after test (optional)
    // await page.goto('/logout');
  },
});
```

### Pattern 2: Worker-Scoped Database Setup

```typescript
// global.setup.ts
import { test as setup } from "@playwright/test";

setup("prepare test database", async ({ request }) => {
  // Run Laravel migrations
  const response = await request.post("http://localhost:8000/api/test/setup", {
    data: { action: "migrate" },
  });

  expect(response.ok()).toBeTruthy();
  console.log("✅ Test database ready");
});
```

### Pattern 3: Test-Scoped Contract Fixture

```typescript
// Usage in tests
import { test, expect } from "../fixtures/contract.fixture";

test.describe("Contract Search", () => {
  test("filters by buyer name", async ({ page, createContract }) => {
    // Create test data for THIS test only
    await createContract({ buyer_name: "Acme Corp" });
    await createContract({ buyer_name: "TechStart Inc" });
    await createContract({ buyer_name: "Global Traders" });

    // Navigate and test
    await page.goto("/contracts");
    await page.getByPlaceholder("Search by buyer or contract no").fill("Acme");

    // Assert only Acme contract visible
    await expect(page.getByRole("row")).toHaveCount(2); // Header + 1 data row
    await expect(page.getByRole("cell", { name: "Acme Corp" })).toBeVisible();

    // Automatic cleanup happens after this test
  });
});
```

---

## 6. Complete Code Example: contract-creation.spec.ts

```typescript
// tests/P1-core/contract-creation.spec.ts
import { test, expect } from "../fixtures/contract.fixture";
import { ContractModal } from "../fixtures/pages/ContractModal";

test.describe("Contract Creation Workflow", () => {
  let modal: ContractModal;

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/dashboard");

    // Initialize Page Object
    modal = new ContractModal(page);

    // Open modal
    await page.getByRole("button", { name: "Add New Contract" }).click();
    await modal.waitForModal();
  });

  test("should create valid contract successfully", async ({
    page,
    createContract,
  }) => {
    // Fill form with valid data
    await modal.fillContractNumber("CT-2024-001");
    await modal.fillBuyerName("Acme Corporation");
    await modal.fillEffectiveDate("2024-01-15");
    await modal.fillExpiryDate("2024-12-31");
    await modal.selectStatus("active");

    // Submit form
    await modal.submit();

    // Assert success feedback
    await expect(page.getByText("Contract created successfully")).toBeVisible();

    // Assert modal closed
    await expect(modal.modalElement).not.toBeVisible();

    // Assert contract appears in table
    const firstRow = page.getByRole("row").nth(1);
    await expect(firstRow).toContainText("CT-2024-001");
    await expect(firstRow).toContainText("Acme Corporation");
    await expect(firstRow).toContainText("Active");
  });

  test("should validate required fields", async ({ page }) => {
    // Try to submit without filling fields
    await modal.submit();

    // Assert validation errors appear
    await expect(modal.getErrorFor("contract_number")).toHaveText(
      "The contract number field is required."
    );
    await expect(modal.getErrorFor("buyer_name")).toHaveText(
      "The buyer name field is required."
    );
    await expect(modal.getErrorFor("effective_date")).toHaveText(
      "The effective date field is required."
    );

    // Assert modal stays open
    await expect(modal.modalElement).toBeVisible();
  });

  test("should prevent duplicate contract numbers", async ({
    page,
    createContract,
  }) => {
    // Create existing contract via API
    await createContract({ contract_number: "CT-DUPLICATE" });

    // Try to create duplicate via UI
    await modal.fillContractNumber("CT-DUPLICATE");
    await modal.fillBuyerName("Another Company");
    await modal.fillEffectiveDate("2024-01-01");
    await modal.fillExpiryDate("2024-12-31");
    await modal.submit();

    // Assert duplicate error
    await expect(modal.getErrorFor("contract_number")).toHaveText(
      "The contract number has already been taken."
    );
  });

  test("should validate date logic (expiry after effective)", async ({
    page,
  }) => {
    await modal.fillContractNumber("CT-2024-002");
    await modal.fillBuyerName("Test Company");
    await modal.fillEffectiveDate("2024-12-31");
    await modal.fillExpiryDate("2024-01-01"); // Invalid: before effective date
    await modal.submit();

    // Assert date validation error
    await expect(modal.getErrorFor("expiry_date")).toHaveText(
      "The expiry date must be after the effective date."
    );
  });

  test("should close modal on cancel", async ({ page }) => {
    // Fill some data
    await modal.fillContractNumber("CT-2024-003");

    // Click cancel
    await modal.cancel();

    // Assert modal closed
    await expect(modal.modalElement).not.toBeVisible();

    // Assert data not saved (no new row in table)
    await expect(page.getByRole("row")).toHaveCount(1); // Only header row
  });

  test("should reset form between modal opens", async ({ page }) => {
    // Fill form
    await modal.fillContractNumber("CT-TEST");
    await modal.fillBuyerName("Test Inc");

    // Close modal
    await modal.cancel();

    // Reopen modal
    await page.getByRole("button", { name: "Add New Contract" }).click();
    await modal.waitForModal();

    // Assert form is empty
    await expect(modal.contractNumberInput).toHaveValue("");
    await expect(modal.buyerNameInput).toHaveValue("");
  });
});

test.describe("Contract Creation with Edge Cases", () => {
  test("should handle special characters in buyer name", async ({ page }) => {
    const modal = new ContractModal(page);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Add New Contract" }).click();
    await modal.waitForModal();

    await modal.fillContractNumber("CT-SPECIAL");
    await modal.fillBuyerName("O'Brien & Associates (Pty) Ltd.");
    await modal.fillEffectiveDate("2024-01-01");
    await modal.fillExpiryDate("2024-12-31");
    await modal.submit();

    // Assert success
    await expect(page.getByText("Contract created successfully")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "O'Brien & Associates (Pty) Ltd." })
    ).toBeVisible();
  });

  test("should handle very long contract numbers", async ({ page }) => {
    const modal = new ContractModal(page);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Add New Contract" }).click();
    await modal.waitForModal();

    const longNumber = "CT-" + "A".repeat(100); // Exceeds typical length
    await modal.fillContractNumber(longNumber);
    await modal.fillBuyerName("Test Buyer");
    await modal.fillEffectiveDate("2024-01-01");
    await modal.fillExpiryDate("2024-12-31");
    await modal.submit();

    // Assert validation error for max length
    await expect(modal.getErrorFor("contract_number")).toContainText(
      "must not be greater than"
    );
  });
});
```

---

## 7. Page Object Model Example: ContractModal.ts

```typescript
// fixtures/pages/ContractModal.ts
import { Page, Locator, expect } from "@playwright/test";

export class ContractModal {
  readonly page: Page;
  readonly modalElement: Locator;
  readonly contractNumberInput: Locator;
  readonly buyerNameInput: Locator;
  readonly effectiveDateInput: Locator;
  readonly expiryDateInput: Locator;
  readonly statusSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalElement = page.getByRole("dialog", { name: "Add New Contract" });
    this.contractNumberInput = this.modalElement.getByLabel("Contract Number");
    this.buyerNameInput = this.modalElement.getByLabel("Buyer Name");
    this.effectiveDateInput = this.modalElement.getByLabel("Effective Date");
    this.expiryDateInput = this.modalElement.getByLabel("Expiry Date");
    this.statusSelect = this.modalElement.getByLabel("Status");
    this.submitButton = this.modalElement.getByRole("button", {
      name: "Save Contract",
    });
    this.cancelButton = this.modalElement.getByRole("button", {
      name: "Cancel",
    });
  }

  async waitForModal() {
    await expect(this.modalElement).toBeVisible();
    // Wait for form to be fully loaded
    await expect(this.contractNumberInput).toBeVisible();
  }

  async fillContractNumber(value: string) {
    await this.contractNumberInput.fill(value);
  }

  async fillBuyerName(value: string) {
    await this.buyerNameInput.fill(value);
  }

  async fillEffectiveDate(value: string) {
    await this.effectiveDateInput.fill(value);
  }

  async fillExpiryDate(value: string) {
    await this.expiryDateInput.fill(value);
  }

  async selectStatus(status: "active" | "pending" | "expired") {
    await this.statusSelect.selectOption(status);
  }

  async submit() {
    await this.submitButton.click();
    // Wait for either success or validation errors
    await this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/contracts") && response.status() !== 0
    );
  }

  async cancel() {
    await this.cancelButton.click();
    await expect(this.modalElement).not.toBeVisible();
  }

  getErrorFor(fieldName: string): Locator {
    return this.modalElement.locator(
      `[data-field="${fieldName}"] .error-message`
    );
  }
}
```

---

## 8. Fixture Setup Example: Complete Test Infrastructure

```typescript
// fixtures/contract.fixture.ts
import { test as base, expect, APIRequestContext } from "@playwright/test";

// Type definitions
export interface ContractData {
  contract_number: string;
  buyer_name: string;
  effective_date: string;
  expiry_date: string;
  status: "active" | "pending" | "expired";
}

export interface Contract extends ContractData {
  id: number;
  created_at: string;
  updated_at: string;
}

// Extend test with custom fixtures
type ContractFixtures = {
  apiContext: APIRequestContext;
  createContract: (data?: Partial<ContractData>) => Promise<Contract>;
  createMultipleContracts: (count: number) => Promise<Contract[]>;
  deleteAllTestContracts: () => Promise<void>;
};

export const test = base.extend<ContractFixtures>({
  // API context for backend communication
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || "http://localhost:8000",
      extraHTTPHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    await use(context);
    await context.dispose();
  },

  // Create single contract with auto-cleanup
  createContract: async ({ apiContext }, use) => {
    const createdIds: number[] = [];

    const create = async (data: Partial<ContractData> = {}) => {
      const contractData: ContractData = {
        contract_number:
          data.contract_number ||
          `CT-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        buyer_name: data.buyer_name || `Test Buyer ${Date.now()}`,
        effective_date:
          data.effective_date || new Date().toISOString().split("T")[0],
        expiry_date:
          data.expiry_date ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        status: data.status || "active",
      };

      const response = await apiContext.post("/api/contracts", {
        data: contractData,
      });

      expect(response.ok()).toBeTruthy();
      const contract: Contract = await response.json();
      createdIds.push(contract.id);

      return contract;
    };

    await use(create);

    // Cleanup: Delete all contracts created during test
    for (const id of createdIds) {
      await apiContext.delete(`/api/contracts/${id}`);
    }
  },

  // Create multiple contracts for testing pagination/filtering
  createMultipleContracts: async ({ createContract }, use) => {
    const createMultiple = async (count: number) => {
      const contracts: Contract[] = [];
      for (let i = 0; i < count; i++) {
        const contract = await createContract({
          contract_number: `CT-BULK-${i.toString().padStart(3, "0")}`,
          buyer_name: `Bulk Buyer ${i + 1}`,
        });
        contracts.push(contract);
      }
      return contracts;
    };

    await use(createMultiple);
  },

  // Manual cleanup function (for explicit cleanup in tests)
  deleteAllTestContracts: async ({ apiContext }, use) => {
    const cleanup = async () => {
      await apiContext.post("/api/test/reset-contracts");
    };

    await use(cleanup);
  },
});

export { expect } from "@playwright/test";
```

---

## 9. Global Setup and Teardown

```typescript
// tests/global.setup.ts
import { test as setup, expect } from "@playwright/test";

setup("prepare test environment", async ({ request }) => {
  console.log("🔧 Setting up test environment...");

  // Verify Laravel backend is running
  const healthCheck = await request.get("http://localhost:8000/api/health");
  expect(healthCheck.ok()).toBeTruthy();

  // Run database migrations
  const migrateResponse = await request.post(
    "http://localhost:8000/api/test/migrate"
  );
  expect(migrateResponse.ok()).toBeTruthy();

  // Seed required data (users, settings, etc.)
  const seedResponse = await request.post(
    "http://localhost:8000/api/test/seed-base-data"
  );
  expect(seedResponse.ok()).toBeTruthy();

  console.log("✅ Test environment ready");
});
```

```typescript
// tests/global.teardown.ts
import { test as teardown, expect } from "@playwright/test";

teardown("cleanup test environment", async ({ request }) => {
  console.log("🧹 Cleaning up test environment...");

  // Reset database to clean state
  const resetResponse = await request.post(
    "http://localhost:8000/api/test/reset-database"
  );
  expect(resetResponse.ok()).toBeTruthy();

  console.log("✅ Cleanup complete");
});
```

---

## 10. Folder Structure: Complete View

```
tests/
├── fixtures/
│   ├── auth.setup.ts                 # Authentication helpers
│   ├── contract.fixture.ts           # Contract CRUD fixtures
│   └── pages/
│       ├── ContractModal.ts          # Contract creation modal POM
│       ├── ContractTable.ts          # Table interactions POM
│       └── DashboardPage.ts          # Dashboard navigation
│
├── P1-core/
│   ├── dashboard.spec.ts             # Test dashboard layout, summary cards
│   └── contract-creation.spec.ts    # Test modal workflow (detailed above)
│
├── P2-search-filter/
│   ├── search-filter.spec.ts        # Test search and status filtering
│   └── pagination.spec.ts           # Test pagination controls
│
├── P3-validation/
│   └── contract-validation.spec.ts  # Test all validation rules
│
├── global.setup.ts                   # Database setup before all tests
├── global.teardown.ts                # Database cleanup after all tests
│
playwright.config.ts                  # Main configuration
package.json                          # Dependencies
.env.testing                          # Test environment variables
```

---

## 11. Best Practices Summary

### Test Independence

✅ **DO:** Each test creates its own data  
✅ **DO:** Use fixtures for automatic cleanup  
✅ **DO:** Tests can run in any order  
❌ **DON'T:** Share data between tests  
❌ **DON'T:** Rely on test execution order

### Page Object Model

✅ **DO:** Use POM for complex, reused components  
✅ **DO:** Keep POMs focused on UI interactions  
✅ **DO:** Use descriptive method names (`fillContractNumber`, not `fill`)  
❌ **DON'T:** Put business logic in POMs  
❌ **DON'T:** Create POMs for simple, one-time interactions

### API Testing

✅ **DO:** Seed data via API before UI tests  
✅ **DO:** Test real Laravel backend (not mocked)  
✅ **DO:** Use API to verify postconditions  
❌ **DON'T:** Mock backend responses unless external APIs  
❌ **DON'T:** Use database direct access (bypasses validation)

### Test Data

✅ **DO:** Generate unique identifiers (`Date.now()`, UUIDs)  
✅ **DO:** Clean up data after each test (fixtures handle this)  
✅ **DO:** Use realistic test data  
❌ **DON'T:** Hardcode IDs that may conflict  
❌ **DON'T:** Leave orphaned test data

### Assertions

✅ **DO:** Use web-first assertions (`toBeVisible()`, `toHaveText()`)  
✅ **DO:** Wait for API responses before asserting  
✅ **DO:** Assert user-visible behavior  
❌ **DON'T:** Use `.isVisible()` without `expect().toBeTruthy()`  
❌ **DON'T:** Assert on implementation details (class names, IDs)

---

## 12. Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run all tests
npx playwright test

# Run specific priority
npx playwright test tests/P1-core

# Run single file
npx playwright test tests/P1-core/contract-creation.spec.ts

# Debug mode (headed browser)
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui

# Generate report
npx playwright show-report
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: lc_management_test
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2

      - name: Install Laravel dependencies
        run: composer install

      - name: Run migrations
        run: php artisan migrate --env=testing

      - name: Start Laravel server
        run: php artisan serve &

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 13. Maintenance and Scaling

### When to Refactor

**Trigger refactoring if:**

- Same locator used 3+ times → Extract to Page Object
- Test setup duplicated 3+ times → Create fixture
- Test file exceeds 300 lines → Split by feature
- Tests fail due to timing issues → Add proper waits

### Scaling Beyond 5 Files

**Next steps for larger suites:**

1. **Group by domain** (contracts, users, reports)
2. **Shared component library** (buttons, forms, tables)
3. **Visual regression testing** (Playwright screenshots)
4. **API contract testing** (validate JSON schemas)
5. **Performance testing** (measure load times)

---

## 14. References and Resources

### Official Documentation

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Fixtures](https://playwright.dev/docs/test-fixtures)
- [API Testing](https://playwright.dev/docs/api-testing)
- [Global Setup](https://playwright.dev/docs/test-global-setup-teardown)

### Laravel Integration

- Laravel API Resource Controllers
- Laravel Database Transactions
- Laravel Testing Best Practices

### Key Takeaways

1. Use **real backend** for integration confidence
2. **API seeding** balances speed and realism
3. **Selective POM** prevents over-engineering
4. **Fixtures** ensure test independence
5. **Test by user story**, not technical layers

---

## Decision Log

| Decision      | Rationale                            | Trade-offs                           |
| ------------- | ------------------------------------ | ------------------------------------ |
| Hybrid POM    | Balances simplicity with reusability | Requires judgment on when to use POM |
| API Seeding   | Fast, tests real endpoints           | Requires test API endpoints          |
| Real Backend  | End-to-end confidence                | Slower than mocked tests             |
| Single Worker | Prevents database conflicts          | Can't run tests in parallel          |
| Test Database | Isolated from dev/production         | Extra database setup                 |

---

**Document Status:** ✅ Complete  
**Next Steps:**

1. Set up Laravel test environment
2. Implement global setup/teardown
3. Create base fixtures
4. Write first test file (contract-creation.spec.ts)
5. Validate approach with P1 tests before scaling
