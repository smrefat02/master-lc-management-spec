import { test, expect } from "@playwright/test";

test.describe("Contract Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first
    await page.goto("http://localhost:5173");
    await page.waitForSelector("table", { timeout: 10000 });
  });

  test("should navigate to contract detail when Show button clicked", async ({
    page,
  }) => {
    // Click the first Show button
    const firstShowButton = page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i });
    await firstShowButton.click();

    // Wait for navigation to detail page
    await page.waitForURL(/\/contracts\/\d+/);

    // Verify we're on the detail page
    await expect(
      page.getByRole("heading", { name: /Contract Details/i })
    ).toBeVisible();
  });

  test("should display all contract information fields", async ({ page }) => {
    // Click first Show button
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for contract details to load
    await page.waitForSelector("text=Buyer Name", { timeout: 10000 });

    // Verify all required fields are present
    await expect(page.getByText("Buyer Name")).toBeVisible();
    await expect(page.getByText("Contract Number")).toBeVisible();
    await expect(page.getByText("Contract Date")).toBeVisible();
    await expect(page.getByText("Amendment Date")).toBeVisible();
    await expect(page.getByText("Total Orders")).toBeVisible();
    await expect(page.getByText("Order Quantity")).toBeVisible();
    await expect(page.getByText("Master LC Value (USD)")).toBeVisible();
    await expect(page.getByText("Overall B2B %")).toBeVisible();
  });

  test("should display status badge", async ({ page }) => {
    // Click first Show button
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for page to load
    await page.waitForSelector("text=Contract Details", { timeout: 10000 });

    // Verify status badge is visible (could be Draft, Active, Completed, etc.)
    const statusBadge = page.locator('[class*="rounded-full"][class*="text-"]');
    await expect(statusBadge).toBeVisible();
  });

  test("should display Back button and navigate to dashboard", async ({
    page,
  }) => {
    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for Back button
    await page.waitForSelector('[aria-label="Back to contracts"]', {
      timeout: 10000,
    });

    // Click Back button
    await page.click('[aria-label="Back to contracts"]');

    // Verify we're back on dashboard
    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(
      page.getByRole("heading", { name: /Sales Contracts Management/i })
    ).toBeVisible();
  });

  test("should display Edit Contract button", async ({ page }) => {
    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for Edit button
    const editButton = page.getByRole("button", { name: /Edit Contract/i });
    await expect(editButton).toBeVisible();
  });

  test("should display metadata (Created and Last Updated)", async ({
    page,
  }) => {
    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for metadata section
    await page.waitForSelector("text=Created", { timeout: 10000 });

    // Verify metadata fields
    await expect(page.getByText("Created")).toBeVisible();
    await expect(page.getByText("Last Updated")).toBeVisible();
  });

  test("should format currency values correctly", async ({ page }) => {
    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for value to load
    await page.waitForSelector("text=Master LC Value (USD)", {
      timeout: 10000,
    });

    // Check that currency value contains $ symbol
    const valueSection = page
      .locator("text=Master LC Value (USD)")
      .locator("..")
      .locator("dd");
    const valueText = await valueSection.textContent();
    expect(valueText).toContain("$");
  });

  test("should format percentage values correctly", async ({ page }) => {
    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();
    await page.waitForURL(/\/contracts\/\d+/);

    // Wait for B2B percentage
    await page.waitForSelector("text=Overall B2B %", { timeout: 10000 });

    // Check that percentage contains %
    const percentSection = page
      .locator("text=Overall B2B %")
      .locator("..")
      .locator("dd");
    const percentText = await percentSection.textContent();
    expect(percentText).toContain("%");
  });

  test("should handle contract not found error", async ({ page }) => {
    // Navigate directly to non-existent contract
    await page.goto("http://localhost:5173/contracts/99999");

    // Should show error message
    await expect(
      page.getByText(/Contract not found|Failed to load contract/i)
    ).toBeVisible({ timeout: 10000 });

    // Should show Back button
    await expect(
      page.getByRole("button", { name: /Back to Contracts/i })
    ).toBeVisible();
  });

  test("should display loading state initially", async ({ page }) => {
    // Intercept API to delay response
    await page.route("**/api/contracts/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    // Navigate to detail page
    await page
      .locator("tbody tr")
      .first()
      .getByRole("button", { name: /Show/i })
      .click();

    // Check for loading indicator
    await expect(page.getByText(/Loading contract details/i)).toBeVisible({
      timeout: 500,
    });
  });
});
