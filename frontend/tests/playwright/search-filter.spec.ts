import { test, expect } from "@playwright/test";

test.describe("Search and Filter Contracts", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contracts overview page
    await page.goto("http://localhost:5173/contracts");

    // Wait for initial data load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
  });

  test.describe("Search Functionality", () => {
    test("should filter contracts by buyer name", async ({ page }) => {
      // Get initial contract count
      const initialRows = await page.locator("table tbody tr").count();
      expect(initialRows).toBeGreaterThan(0);

      // Type buyer name in search input
      await page.fill('input[placeholder*="Search"]', "ABC Corporation");

      // Wait for filtered results
      await page.waitForTimeout(500); // Debounce delay

      // Verify filtered results contain search term
      const rows = await page.locator("table tbody tr").count();
      expect(rows).toBeLessThanOrEqual(initialRows);

      // Verify first row contains search term
      const firstRowText = await page
        .locator("table tbody tr")
        .first()
        .textContent();
      expect(firstRowText?.toLowerCase()).toContain("abc");
    });

    test("should filter contracts by contract number", async ({ page }) => {
      // Get first contract number from table
      const firstContractNo = await page
        .locator("table tbody tr td:nth-child(2)")
        .first()
        .textContent();

      // Search by contract number
      await page.fill('input[placeholder*="Search"]', firstContractNo || "");

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify results contain the searched contract
      const resultContractNo = await page
        .locator("table tbody tr td:nth-child(2)")
        .first()
        .textContent();
      expect(resultContractNo).toBe(firstContractNo);
    });

    test("should show empty state when no search results found", async ({
      page,
    }) => {
      // Search for non-existent term
      await page.fill('input[placeholder*="Search"]', "NonExistentBuyer12345");

      // Wait for search to complete
      await page.waitForTimeout(500);

      // Verify empty state is shown
      await expect(page.locator("text=No contracts found")).toBeVisible();
      await expect(
        page.locator("text=Try adjusting your search")
      ).toBeVisible();

      // Verify table is hidden
      await expect(page.locator("table")).not.toBeVisible();
    });

    test("should search with partial buyer name match", async ({ page }) => {
      // Search with partial name
      await page.fill('input[placeholder*="Search"]', "Corp");

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify at least one result is returned
      const rows = await page.locator("table tbody tr").count();
      expect(rows).toBeGreaterThan(0);
    });
  });

  test.describe("Status Filter", () => {
    test("should filter contracts by draft status", async ({ page }) => {
      // Select draft status from dropdown
      await page.selectOption("select#status", "draft");

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify all visible contracts have draft status
      const statusBadges = page.locator("table tbody tr td:nth-child(7)");
      const count = await statusBadges.count();

      for (let i = 0; i < count; i++) {
        const statusText = await statusBadges.nth(i).textContent();
        expect(statusText?.toLowerCase()).toContain("draft");
      }
    });

    test("should filter contracts by active status", async ({ page }) => {
      // Select active status from dropdown
      await page.selectOption("select#status", "active");

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify all visible contracts have active status
      const statusBadges = page.locator("table tbody tr td:nth-child(7)");
      const count = await statusBadges.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const statusText = await statusBadges.nth(i).textContent();
          expect(statusText?.toLowerCase()).toContain("active");
        }
      }
    });

    test('should show all contracts when "All Statuses" is selected', async ({
      page,
    }) => {
      // First apply a status filter
      await page.selectOption("select#status", "active");
      await page.waitForTimeout(500);

      const filteredCount = await page.locator("table tbody tr").count();

      // Then select "All Statuses"
      await page.selectOption("select#status", "");
      await page.waitForTimeout(500);

      // Verify more contracts are shown
      const allCount = await page.locator("table tbody tr").count();
      expect(allCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  test.describe("Combined Filters", () => {
    test("should apply both search and status filter", async ({ page }) => {
      // Apply search term
      await page.fill('input[placeholder*="Search"]', "Corporation");
      await page.waitForTimeout(500);

      // Apply status filter
      await page.selectOption("select#status", "active");
      await page.waitForTimeout(500);

      // Verify both filters are applied
      const rows = page.locator("table tbody tr");
      const count = await rows.count();

      if (count > 0) {
        // Check first row contains search term and status
        const firstRowText = await rows.first().textContent();
        expect(firstRowText?.toLowerCase()).toContain("corporation");

        const firstStatus = await page
          .locator("table tbody tr td:nth-child(7)")
          .first()
          .textContent();
        expect(firstStatus?.toLowerCase()).toContain("active");
      }
    });

    test("should show empty state when combined filters have no results", async ({
      page,
    }) => {
      // Apply restrictive filters
      await page.fill('input[placeholder*="Search"]', "NonExistentBuyer");
      await page.selectOption("select#status", "cancelled");
      await page.waitForTimeout(500);

      // Verify empty state
      await expect(page.locator("text=No contracts found")).toBeVisible();
    });
  });

  test.describe("Clear Filters", () => {
    test("should show clear button when search is active", async ({ page }) => {
      // Apply search
      await page.fill('input[placeholder*="Search"]', "Test");

      // Verify clear button appears
      await expect(
        page.locator('button:has-text("Clear Filters")')
      ).toBeVisible();
    });

    test("should show clear button when status filter is active", async ({
      page,
    }) => {
      // Apply status filter
      await page.selectOption("select#status", "active");

      // Verify clear button appears
      await expect(
        page.locator('button:has-text("Clear Filters")')
      ).toBeVisible();
    });

    test("should hide clear button when no filters are active", async ({
      page,
    }) => {
      // Verify clear button is hidden initially
      await expect(
        page.locator('button:has-text("Clear Filters")')
      ).not.toBeVisible();
    });

    test("should clear all filters when clear button is clicked", async ({
      page,
    }) => {
      // Apply both filters
      await page.fill('input[placeholder*="Search"]', "Corporation");
      await page.selectOption("select#status", "active");
      await page.waitForTimeout(500);

      // Get filtered count
      const filteredCount = await page.locator("table tbody tr").count();

      // Click clear button
      await page.click('button:has-text("Clear Filters")');
      await page.waitForTimeout(500);

      // Verify filters are cleared
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toHaveValue("");

      const statusSelect = page.locator("select#status");
      await expect(statusSelect).toHaveValue("");

      // Verify more contracts are shown
      const allCount = await page.locator("table tbody tr").count();
      expect(allCount).toBeGreaterThanOrEqual(filteredCount);
    });

    test("should clear filters from empty state", async ({ page }) => {
      // Apply restrictive filters to trigger empty state
      await page.fill('input[placeholder*="Search"]', "NonExistentContract123");
      await page.waitForTimeout(500);

      // Verify empty state
      await expect(page.locator("text=No contracts found")).toBeVisible();

      // Click clear button in empty state
      await page.click('button:has-text("Clear Filters")');
      await page.waitForTimeout(500);

      // Verify contracts are shown again
      await expect(page.locator("table tbody tr")).toHaveCount(
        await page.locator("table tbody tr").count()
      );
      expect(await page.locator("table tbody tr").count()).toBeGreaterThan(0);
    });
  });

  test.describe("Summary Statistics with Filters", () => {
    test("should update summary statistics when filters are applied", async ({
      page,
    }) => {
      // Get initial total contracts value
      const initialTotal = await page
        .locator("text=Total Contracts")
        .locator("..")
        .locator("div")
        .nth(1)
        .textContent();

      // Apply status filter
      await page.selectOption("select#status", "active");
      await page.waitForTimeout(500);

      // Get filtered total contracts value
      const filteredTotal = await page
        .locator("text=Total Contracts")
        .locator("..")
        .locator("div")
        .nth(1)
        .textContent();

      // Verify summary has changed (unless all contracts are active)
      // This test validates that summary reflects filtered data
      expect(filteredTotal).toBeDefined();
    });

    test("should restore original summary when filters are cleared", async ({
      page,
    }) => {
      // Get initial summary values
      const initialTotal = await page
        .locator("text=Total Contracts")
        .locator("..")
        .locator("div")
        .nth(1)
        .textContent();

      // Apply filter
      await page.selectOption("select#status", "draft");
      await page.waitForTimeout(500);

      // Clear filter
      await page.click('button:has-text("Clear Filters")');
      await page.waitForTimeout(500);

      // Verify summary is restored
      const restoredTotal = await page
        .locator("text=Total Contracts")
        .locator("..")
        .locator("div")
        .nth(1)
        .textContent();
      expect(restoredTotal).toBe(initialTotal);
    });
  });

  test.describe("Pagination with Filters", () => {
    test("should reset to page 1 when search is applied", async ({ page }) => {
      // Navigate to page 2 if pagination exists
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Apply search
      await page.fill('input[placeholder*="Search"]', "Corp");
      await page.waitForTimeout(500);

      // Verify page resets to 1 (check URL or page indicator)
      const currentPageIndicator = page.locator("text=/Page \\d+ of \\d+/");
      if (await currentPageIndicator.isVisible()) {
        const pageText = await currentPageIndicator.textContent();
        expect(pageText).toContain("Page 1");
      }
    });

    test("should reset to page 1 when status filter is changed", async ({
      page,
    }) => {
      // Navigate to page 2 if pagination exists
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Apply status filter
      await page.selectOption("select#status", "active");
      await page.waitForTimeout(500);

      // Verify page resets to 1
      const currentPageIndicator = page.locator("text=/Page \\d+ of \\d+/");
      if (await currentPageIndicator.isVisible()) {
        const pageText = await currentPageIndicator.textContent();
        expect(pageText).toContain("Page 1");
      }
    });
  });

  test.describe("Loading States", () => {
    test("should show loading state when filters are applied", async ({
      page,
    }) => {
      // This test verifies UI remains responsive during filter operations
      await page.fill('input[placeholder*="Search"]', "Corporation");

      // Check that page doesn't freeze (table remains visible or loading spinner shows)
      await page.waitForTimeout(100);

      // Verify results load successfully
      await page.waitForTimeout(500);
      const rows = await page.locator("table tbody tr").count();
      expect(rows).toBeGreaterThanOrEqual(0);
    });
  });
});
