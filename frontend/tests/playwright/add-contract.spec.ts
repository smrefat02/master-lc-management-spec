import { test, expect } from "@playwright/test";

test.describe("Contract Creation Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contracts overview page
    await page.goto("http://localhost:3000/");
  });

  test("should open modal when Add New Contract button is clicked", async ({
    page,
  }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Verify modal is visible
    await expect(page.locator('h3:has-text("Add New Contract")')).toBeVisible();

    // Verify form fields are present
    await expect(page.locator('label:has-text("Buyer")')).toBeVisible();
    await expect(
      page.locator('label:has-text("Contract Number")')
    ).toBeVisible();
    await expect(page.locator('label:has-text("Contract Date")')).toBeVisible();
  });

  test("should auto-populate contract number with correct format", async ({
    page,
  }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Wait for modal to load
    await page.waitForSelector('h3:has-text("Add New Contract")');

    // Wait for contract number field to be populated
    const contractNoInput = page.locator('input[id="contract_no"]');
    await expect(contractNoInput).toBeVisible();

    // Get the value
    const contractNo = await contractNoInput.inputValue();

    // Verify format: IIC/AKCL/CON/YYYY/NN
    expect(contractNo).toMatch(/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/);
  });

  test("should create contract successfully with valid data", async ({
    page,
  }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Wait for modal to load
    await page.waitForSelector('h3:has-text("Add New Contract")');

    // Wait for buyers to load (dropdown should have options)
    await page.waitForTimeout(1000);

    // Fill the form
    await page.selectOption('select[id="buyer_id"]', { index: 1 }); // Select first buyer

    // Contract number should already be populated
    const contractNo = await page.inputValue('input[id="contract_no"]');
    expect(contractNo).toMatch(/^IIC\/AKCL\/CON\/\d{4}\/\d{2}$/);

    await page.fill('input[id="contract_date"]', "2025-12-15");
    await page.fill('input[id="amendment_date"]', "2025-12-20");
    await page.fill('input[id="total_orders"]', "150");
    await page.fill('input[id="order_quantity"]', "7500");
    await page.fill('input[id="value_usd"]', "375000.00");
    await page.fill('input[id="b2b_percent"]', "55.5");
    await page.selectOption('select[id="status"]', "active");
    await page.fill('textarea[id="remarks"]', "E2E test contract");

    // Submit the form
    await page.click('button[type="submit"]:has-text("Save Contract")');

    // Wait for modal to close (indicates success)
    await expect(
      page.locator('h3:has-text("Add New Contract")')
    ).not.toBeVisible({ timeout: 5000 });

    // Verify the new contract appears in the table
    await expect(page.locator(`text=${contractNo}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show loading state while fetching initial data", async ({
    page,
  }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Verify loading spinner appears
    const loadingSpinner = page.locator(".animate-spin");
    await expect(loadingSpinner).toBeVisible({ timeout: 1000 });
  });

  test("should close modal when Cancel button is clicked", async ({ page }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Wait for modal to open
    await page.waitForSelector('h3:has-text("Add New Contract")');

    // Click Cancel button
    await page.click('button:has-text("Cancel")');

    // Verify modal is closed
    await expect(
      page.locator('h3:has-text("Add New Contract")')
    ).not.toBeVisible();
  });

  test("should close modal when X button is clicked", async ({ page }) => {
    // Click Add New Contract button
    await page.click('button:has-text("Add New Contract")');

    // Wait for modal to open
    await page.waitForSelector('h3:has-text("Add New Contract")');

    // Click X button (close icon)
    await page.click('button[class*="text-gray-400"]');

    // Verify modal is closed
    await expect(
      page.locator('h3:has-text("Add New Contract")')
    ).not.toBeVisible();
  });
});

test.describe("Contract Validation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.click('button:has-text("Add New Contract")');
    await page.waitForSelector('h3:has-text("Add New Contract")');
    await page.waitForTimeout(1000); // Wait for initial data to load
  });

  test("should validate contract number format - missing prefix", async ({
    page,
  }) => {
    // Clear and enter invalid format (missing IIC prefix)
    await page.fill('input[id="contract_no"]', "AKCL/CON/2025/01");

    // Trigger validation by clicking outside or typing in another field
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(
      page.locator("text=Invalid format. Must match: IIC/AKCL/CON/YYYY/NN")
    ).toBeVisible({ timeout: 1000 });

    // Verify submit button is disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("should validate contract number format - 2-digit year", async ({
    page,
  }) => {
    // Enter invalid format (2-digit year)
    await page.fill('input[id="contract_no"]', "IIC/AKCL/CON/25/01");
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(
      page.locator("text=Invalid format. Must match: IIC/AKCL/CON/YYYY/NN")
    ).toBeVisible({ timeout: 1000 });
  });

  test("should validate contract number format - single digit NN", async ({
    page,
  }) => {
    // Enter invalid format (single digit NN)
    await page.fill('input[id="contract_no"]', "IIC/AKCL/CON/2025/1");
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(
      page.locator("text=Invalid format. Must match: IIC/AKCL/CON/YYYY/NN")
    ).toBeVisible({ timeout: 1000 });
  });

  test("should validate contract number format - 3-digit NN", async ({
    page,
  }) => {
    // Enter invalid format (3-digit NN)
    await page.fill('input[id="contract_no"]', "IIC/AKCL/CON/2025/100");
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(
      page.locator("text=Invalid format. Must match: IIC/AKCL/CON/YYYY/NN")
    ).toBeVisible({ timeout: 1000 });
  });

  test("should validate required fields", async ({ page }) => {
    // Clear buyer selection
    await page.selectOption('select[id="buyer_id"]', "");

    // Try to submit without required fields
    // First, need to make the submit button enabled by filling some fields
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Buyer field should show error
    await expect(page.locator("text=Buyer is required")).toBeVisible({
      timeout: 1000,
    });
  });

  test("should validate B2B percentage range - below 0", async ({ page }) => {
    await page.fill('input[id="b2b_percent"]', "-5");
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(page.locator("text=Must be between 0 and 100")).toBeVisible({
      timeout: 1000,
    });
  });

  test("should validate B2B percentage range - above 100", async ({ page }) => {
    await page.fill('input[id="b2b_percent"]', "150");
    await page.fill('input[id="contract_date"]', "2025-12-15");

    // Verify error message
    await expect(page.locator("text=Must be between 0 and 100")).toBeVisible({
      timeout: 1000,
    });
  });

  test("should validate amendment date is after contract date", async ({
    page,
  }) => {
    await page.fill('input[id="contract_date"]', "2025-12-20");
    await page.fill('input[id="amendment_date"]', "2025-12-10"); // Before contract date

    // Verify error message
    await expect(
      page.locator(
        "text=Amendment date must be equal to or later than contract date"
      )
    ).toBeVisible({ timeout: 1000 });
  });

  test("should allow amendment date equal to contract date", async ({
    page,
  }) => {
    await page.selectOption('select[id="buyer_id"]', { index: 1 });
    await page.fill('input[id="contract_date"]', "2025-12-20");
    await page.fill('input[id="amendment_date"]', "2025-12-20"); // Same as contract date
    await page.fill('input[id="total_orders"]', "100");
    await page.fill('input[id="order_quantity"]', "5000");
    await page.fill('input[id="value_usd"]', "250000");
    await page.fill('input[id="b2b_percent"]', "50");

    // Should not show error
    await expect(
      page.locator(
        "text=Amendment date must be equal to or later than contract date"
      )
    ).not.toBeVisible();

    // Submit button should be enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
  });
});

test.describe("Error Handling Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("should handle duplicate contract number error", async ({ page }) => {
    // First, create a contract
    await page.click('button:has-text("Add New Contract")');
    await page.waitForSelector('h3:has-text("Add New Contract")');
    await page.waitForTimeout(1000);

    const contractNo = await page.inputValue('input[id="contract_no"]');

    await page.selectOption('select[id="buyer_id"]', { index: 1 });
    await page.fill('input[id="contract_date"]', "2025-12-15");
    await page.fill('input[id="total_orders"]', "100");
    await page.fill('input[id="order_quantity"]', "5000");
    await page.fill('input[id="value_usd"]', "250000");
    await page.fill('input[id="b2b_percent"]', "50");
    await page.click('button[type="submit"]');

    // Wait for modal to close
    await expect(
      page.locator('h3:has-text("Add New Contract")')
    ).not.toBeVisible({ timeout: 5000 });

    // Try to create another contract with the same number
    await page.click('button:has-text("Add New Contract")');
    await page.waitForSelector('h3:has-text("Add New Contract")');
    await page.waitForTimeout(1000);

    // Manually enter the duplicate contract number
    await page.fill('input[id="contract_no"]', contractNo);
    await page.selectOption('select[id="buyer_id"]', { index: 1 });
    await page.fill('input[id="contract_date"]', "2025-12-16");
    await page.fill('input[id="total_orders"]', "100");
    await page.fill('input[id="order_quantity"]', "5000");
    await page.fill('input[id="value_usd"]', "250000");
    await page.fill('input[id="b2b_percent"]', "50");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator(
        "text=/This contract number already exists|Contract number already exists/i"
      )
    ).toBeVisible({ timeout: 3000 });
  });

  test("should display error when network request fails", async ({ page }) => {
    // Intercept the API call and force it to fail
    await page.route("**/api/buyers", (route) => {
      route.abort("failed");
    });

    await page.click('button:has-text("Add New Contract")');
    await page.waitForSelector('h3:has-text("Add New Contract")');

    // Should show error message
    await expect(
      page.locator("text=Failed to load form data. Please try again.")
    ).toBeVisible({ timeout: 3000 });
  });

  test("should show loading state during form submission", async ({ page }) => {
    await page.click('button:has-text("Add New Contract")');
    await page.waitForSelector('h3:has-text("Add New Contract")');
    await page.waitForTimeout(1000);

    // Fill the form
    await page.selectOption('select[id="buyer_id"]', { index: 1 });
    await page.fill('input[id="contract_date"]', "2025-12-15");
    await page.fill('input[id="total_orders"]', "100");
    await page.fill('input[id="order_quantity"]', "5000");
    await page.fill('input[id="value_usd"]', "250000");
    await page.fill('input[id="b2b_percent"]', "50");

    // Intercept the API call to delay it
    await page.route("**/api/contracts", async (route) => {
      await page.waitForTimeout(2000); // Delay for 2 seconds
      route.continue();
    });

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify "Saving..." text appears
    await expect(page.locator('button:has-text("Saving...")')).toBeVisible({
      timeout: 1000,
    });

    // Verify submit button is disabled during submission
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });
});
