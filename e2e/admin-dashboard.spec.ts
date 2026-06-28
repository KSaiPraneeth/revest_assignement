import { expect, test } from '@playwright/test';
import { loginViaUi, servicesReady } from './helpers/test-utils';

test.describe('Admin console E2E', () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!(await servicesReady(request)), 'Backend services are not running');
  });

  test('admin dashboard shows full application overview', async ({ page }) => {
    await loginViaUi(page, 'admin@revest.sa', 'Admin@123');
    await page.waitForURL('**/admin');

    await expect(page.getByRole('heading', { name: 'Operations overview' })).toBeVisible();
    await expect(page.getByText('Quick actions')).toBeVisible();
    await expect(page.getByText('Application architecture')).toBeVisible();
    await expect(page.getByText('Recent orders')).toBeVisible();
    await expect(page.getByText('Order pipeline')).toBeVisible();
    await expect(page.getByText('Inventory alerts')).toBeVisible();
    await expect(page.getByText('Recent users')).toBeVisible();
    await expect(page.getByText('Activity feed')).toBeVisible();
  });

  test('admin can navigate to management pages', async ({ page }) => {
    await loginViaUi(page, 'admin@revest.sa', 'Admin@123');
    await page.waitForURL('**/admin');

    const nav = page.locator('header');
    await nav.getByRole('link', { name: 'Products', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Product management' })).toBeVisible();

    await nav.getByRole('link', { name: 'Orders', exact: true }).click();
    await expect(page.getByText('Manage Orders')).toBeVisible();

    await nav.getByRole('link', { name: 'Users', exact: true }).click();
    await expect(page.getByText(/users/i).first()).toBeVisible();

    await nav.getByRole('link', { name: 'Audit', exact: true }).click();
    await expect(page.getByText('Audit Logs')).toBeVisible();
  });
});
