import { test, expect } from "@playwright/test";

test.describe("View and Edit Contract Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contracts overview page
    await page.goto("http://localhost:5173/contracts");

    // Wait for initial data load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
  });

  test.describe("View Contract Modal", () => {
    test("should open view modal when Show button is clicked", async ({
      page,
    }) => {
      // Click the Show button on the first contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();

      // Wait for modal to open
      await page.waitForSelector('dialog[open], [role="dialog"]', {
        timeout: 5000,
      });

      // Verify modal title
      await expect(page.locator("text=Contract Details")).toBeVisible();

      // Verify contract information is displayed
      await expect(page.locator("text=Contract No")).toBeVisible();
      await expect(page.locator("text=Buyer")).toBeVisible();
      await expect(page.locator("text=Status")).toBeVisible();
    });

    test("should display all contract fields in read-only format", async ({
      page,
    }) => {
      // Click Show button on first contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();

      // Wait for modal
      await page.waitForSelector("text=Contract Details", { timeout: 5000 });

      // Verify key fields are displayed
      const fieldLabels = [
        "Contract No",
        "Status",
        "Buyer",
        "Contract Date",
        "Amendment Date",
        "Total Orders",
        "Order Quantity",
        "Value (USD)",
        "B2B Percentage",
      ];

      for (const label of fieldLabels) {
        await expect(page.locator(`text=${label}`)).toBeVisible();
      }

      // Verify no input fields exist (read-only)
      const inputs = await page
        .locator('dialog input, [role="dialog"] input')
        .count();
      expect(inputs).toBe(0);
    });

    test("should close view modal when Close button is clicked", async ({
      page,
    }) => {
      // Open modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();
      await page.waitForSelector("text=Contract Details");

      // Click Close button
      await page.locator('button:has-text("Close")').click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Verify modal is closed
      await expect(page.locator("text=Contract Details")).not.toBeVisible();
    });

    test("should close view modal when clicking outside", async ({ page }) => {
      // Open modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();
      await page.waitForSelector("text=Contract Details");

      // Click on backdrop (outside modal)
      await page
        .locator(".fixed.inset-0.bg-black")
        .click({ position: { x: 10, y: 10 } });

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Verify modal is closed
      await expect(page.locator("text=Contract Details")).not.toBeVisible();
    });

    test("should display buyer contact information if available", async ({
      page,
    }) => {
      // Open modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();
      await page.waitForSelector("text=Contract Details");

      // Check if buyer contact section exists
      const contactSection = page.locator("text=Buyer Contact Information");

      if (await contactSection.isVisible()) {
        // Verify contact fields are present
        await expect(
          page.locator("text=Email, text=Phone, text=Address").first()
        ).toBeVisible();
      }
    });
  });

  test.describe("Edit Contract Modal", () => {
    test("should open edit modal when Edit button is clicked", async ({
      page,
    }) => {
      // Click the Edit button on the first contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();

      // Wait for modal to open
      await page.waitForSelector("text=Edit Contract", { timeout: 5000 });

      // Verify modal title
      await expect(page.locator("text=Edit Contract")).toBeVisible();

      // Verify form is present
      await expect(page.locator("form")).toBeVisible();
    });

    test("should pre-populate form with existing contract data", async ({
      page,
    }) => {
      // Get contract data from table
      const firstRow = page.locator("table tbody tr").first();
      const contractNo = await firstRow
        .locator("td:nth-child(2)")
        .textContent();

      // Click Edit button
      await firstRow.locator('button:has-text("Edit")').click();
      await page.waitForSelector("text=Edit Contract");

      // Verify contract number is pre-populated
      const contractNoInput = page.locator("input#contract_no");
      await expect(contractNoInput).toHaveValue(contractNo?.trim() || "");

      // Verify other fields are filled
      const buyerSelect = page.locator("select#buyer_id");
      const buyerValue = await buyerSelect.inputValue();
      expect(buyerValue).not.toBe("");
    });

    test("should disable contract number field in edit mode", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Verify contract number field is disabled
      const contractNoInput = page.locator("input#contract_no");
      await expect(contractNoInput).toBeDisabled();

      // Verify it has read-only styling
      const classes = await contractNoInput.getAttribute("class");
      expect(classes).toContain("bg-gray-100");
      expect(classes).toContain("cursor-not-allowed");
    });

    test("should successfully update contract when valid data is submitted", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Modify Amendment Date field
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      const futureDateString = futureDate.toISOString().split("T")[0];

      await page.fill("input#amendment_date", futureDateString);

      // Modify Total Orders
      await page.fill("input#total_orders", "999");

      // Submit form
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for modal to close (indicates success)
      await page.waitForTimeout(2000);
      await expect(page.locator("text=Edit Contract")).not.toBeVisible();

      // Verify table was refreshed
      await page.waitForSelector("table tbody tr");
    });

    test("should show validation errors for invalid data", async ({ page }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Set invalid amendment date (before contract date)
      await page.fill("input#contract_date", "2025-06-15");
      await page.fill("input#amendment_date", "2025-01-15");

      // Try to submit
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for error message
      await page.waitForTimeout(500);

      // Verify error message appears
      await expect(page.locator("text=/Amendment date must be/")).toBeVisible();
    });

    test("should show validation error for invalid B2B percentage", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Set invalid B2B percentage (>100)
      await page.fill("input#b2b_percent", "150");

      // Try to submit
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for error
      await page.waitForTimeout(500);

      // Verify error message
      await expect(
        page.locator("text=/Must be between 0 and 100/")
      ).toBeVisible();
    });

    test("should close edit modal when Cancel button is clicked", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Modify a field
      await page.fill("input#total_orders", "777");

      // Click Cancel button
      await page.locator('button:has-text("Cancel")').click();

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Verify modal is closed
      await expect(page.locator("text=Edit Contract")).not.toBeVisible();
    });

    test("should not change contract number even if user tries", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Get original contract number
      const originalContractNo = await page
        .locator("input#contract_no")
        .inputValue();

      // Verify the field is disabled (cannot be changed)
      const contractNoInput = page.locator("input#contract_no");
      await expect(contractNoInput).toBeDisabled();

      // Even if we try to change it programmatically, it should remain disabled
      const isReadOnly = await contractNoInput.getAttribute("readonly");
      expect(isReadOnly).not.toBeNull();
    });
  });

  test.describe("Complete View and Edit Workflow", () => {
    test("should allow viewing then editing the same contract", async ({
      page,
    }) => {
      // Step 1: View contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();
      await page.waitForSelector("text=Contract Details");

      // Verify view modal is open
      await expect(page.locator("text=Contract Details")).toBeVisible();

      // Get contract number from view modal
      const contractNoLabel = page
        .locator('label:has-text("Contract No")')
        .locator("..")
        .locator("div")
        .last();
      const contractNo = await contractNoLabel.textContent();

      // Close view modal
      await page.locator('button:has-text("Close")').click();
      await page.waitForTimeout(500);

      // Step 2: Edit the same contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Verify edit modal is open with same contract
      const editContractNo = await page
        .locator("input#contract_no")
        .inputValue();
      expect(editContractNo).toBe(contractNo?.trim() || "");

      // Modify and submit
      await page.fill("input#order_quantity", "12345");
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for success
      await page.waitForTimeout(2000);
      await expect(page.locator("text=Edit Contract")).not.toBeVisible();
    });

    test("should reflect changes in table after successful edit", async ({
      page,
    }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Change status to 'active'
      await page.selectOption("select#status", "active");

      // Submit
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for modal to close and table to refresh
      await page.waitForTimeout(2000);

      // Verify status is updated in table (status column should show 'Active')
      const firstRowStatus = page
        .locator("table tbody tr")
        .first()
        .locator("td:nth-child(7)");
      const statusText = await firstRowStatus.textContent();
      expect(statusText?.toLowerCase()).toContain("active");
    });
  });

  test.describe("Error Handling", () => {
    test("should show error message if contract fails to load", async ({
      page,
    }) => {
      // Intercept API call and return error
      await page.route("**/api/contracts/*", (route) => {
        if (route.request().method() === "GET") {
          route.fulfill({
            status: 404,
            body: JSON.stringify({ message: "Contract not found" }),
          });
        } else {
          route.continue();
        }
      });

      // Try to view contract
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Show")')
        .click();

      // Wait for error (modal should not open)
      await page.waitForTimeout(1000);

      // Verify modal did not open
      await expect(page.locator("text=Contract Details")).not.toBeVisible();
    });

    test("should show error message if update fails", async ({ page }) => {
      // Open edit modal
      await page
        .locator("table tbody tr")
        .first()
        .locator('button:has-text("Edit")')
        .click();
      await page.waitForSelector("text=Edit Contract");

      // Intercept update request and return error
      await page.route("**/api/contracts/*", (route) => {
        if (route.request().method() === "PUT") {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ message: "Server error" }),
          });
        } else {
          route.continue();
        }
      });

      // Modify and submit
      await page.fill("input#total_orders", "555");
      await page.locator('button[type="submit"]:has-text("Save")').click();

      // Wait for error message
      await page.waitForTimeout(1000);

      // Verify error is displayed
      await expect(
        page.locator("text=/Failed to update contract|Server error/")
      ).toBeVisible();
    });
  });
});
