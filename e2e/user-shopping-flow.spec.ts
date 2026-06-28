import { expect, test } from '@playwright/test';
import { loginViaUi, servicesReady, uniqueEmail, ensureCatalogHasStock } from './helpers/test-utils';

test.describe('User shopping E2E', () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!(await servicesReady(request)), 'Backend services are not running');
    await ensureCatalogHasStock(request);
  });

  test('register → catalog → cart → checkout → order history', async ({ page }) => {
    const email = uniqueEmail('buyer');
    const password = 'Password123!';

    await page.goto('/signup');
    await page.getByLabel('Full Name').fill('E2E Buyer');
    await page.getByLabel('Email').fill(email);
    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Female' }).click();
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(password);
    await passwordFields.nth(1).fill(password);
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('**/products');
    await expect(page.getByRole('heading', { name: 'Product catalog' })).toBeVisible();

    const addToCart = page.getByRole('button', { name: 'Add to cart' }).first();
    await expect(addToCart).toBeVisible({ timeout: 15_000 });
    await addToCart.click();

    await page.getByRole('link', { name: 'Cart' }).first().click();
    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    await expect(page.getByText('Order summary')).toBeVisible();

    await page.getByRole('link', { name: 'Proceed to checkout' }).click();
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await page.getByRole('button', { name: 'Place order' }).click();

    await page.waitForURL(/\/orders\/.+/);
    await expect(page.getByText('Your order was placed successfully')).toBeVisible();

    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();
    await expect(page.getByText(/Order #/)).toBeVisible();
  });

  test('existing user can login and reach catalog', async ({ page }) => {
    await loginViaUi(page, 'admin@revest.sa', 'Admin@123');
    await page.waitForURL('**/admin');
    await page.goto('/products');
    await expect(page.getByRole('button', { name: 'Add to cart' }).first()).toBeVisible();
  });
});
