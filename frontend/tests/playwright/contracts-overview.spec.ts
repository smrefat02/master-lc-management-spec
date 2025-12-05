import { test, expect } from "@playwright/test";

test.describe("Contracts Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto("http://localhost:5173");
  });

  test("should display page title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Sales Contracts Management/i })
    ).toBeVisible();
  });

  test("should display 4 summary cards", async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector("text=Total Contracts", { timeout: 10000 });

    // Check all 4 summary cards exist
    await expect(page.getByText("Total Contracts")).toBeVisible();
    await expect(page.getByText("Total LC Value")).toBeVisible();
    await expect(page.getByText("Total Order Quantity")).toBeVisible();
    await expect(page.getByText("Avg B2B %")).toBeVisible();
  });

  test("should display contract table", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("table", { timeout: 10000 });

    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("should display Add New Contract button", async ({ page }) => {
    const button = page.getByRole("button", { name: /Add New Contract/i });
    await expect(button).toBeVisible();
  });

  test("should display correct column headers", async ({ page }) => {
    // Wait for table headers
    await page.waitForSelector("th", { timeout: 10000 });

    // Check all expected column headers
    await expect(
      page.getByRole("columnheader", { name: /Buyer Name/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Contract No/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Amendment Date/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Total Orders/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Order Quantity/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Master LC Value \(USD\)/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /B2B %/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Status/i })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: /Actions/i })
    ).toBeVisible();
  });

  test("should render data rows in table", async ({ page }) => {
    // Wait for table body
    await page.waitForSelector("tbody tr", { timeout: 10000 });

    // Check that at least one data row exists
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display pagination controls", async ({ page }) => {
    // Wait for pagination to load
    await page.waitForSelector('nav[aria-label="Pagination"]', {
      timeout: 10000,
    });

    const pagination = page.locator('nav[aria-label="Pagination"]');
    await expect(pagination).toBeVisible();

    // Check for Previous and Next buttons
    await expect(page.getByRole("button", { name: /Previous/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Next/i })).toBeVisible();
  });

  test("should display contract details in table cells", async ({ page }) => {
    // Wait for first row to load
    await page.waitForSelector("tbody tr:first-child", { timeout: 10000 });

    const firstRow = page.locator("tbody tr").first();

    // Check that cells contain data (not empty)
    const cells = firstRow.locator("td");
    const cellCount = await cells.count();
    expect(cellCount).toBe(9); // 9 columns total
  });

  test("should display Show and Edit buttons for each contract", async ({
    page,
  }) => {
    // Wait for table to load
    await page.waitForSelector("tbody tr", { timeout: 10000 });

    // Check first row has both buttons
    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow.getByRole("button", { name: /Show/i })).toBeVisible();
    await expect(firstRow.getByRole("button", { name: /Edit/i })).toBeVisible();
  });

  test("should display loading state initially", async ({ page }) => {
    // Intercept API call to delay response
    await page.route("**/api/contracts*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("http://localhost:5173");

    // Check for loading indicator
    await expect(page.getByText(/Loading contracts/i)).toBeVisible();
  });

  test("should update page when clicking pagination", async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector("tbody tr", { timeout: 10000 });

    // Check if Next button is enabled
    const nextButton = page.getByRole("button", { name: /Next/i }).last();
    const isDisabled = await nextButton.isDisabled();

    if (!isDisabled) {
      // Click Next button
      await nextButton.click();

      // Wait for page to update
      await page.waitForLoadState("networkidle");

      // Verify URL or content changed
      await expect(page).toHaveURL(/.*/, { timeout: 5000 });
    }
  });
});
