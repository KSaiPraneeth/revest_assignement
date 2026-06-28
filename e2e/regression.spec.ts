import { expect, test } from '@playwright/test';
import { PRODUCT_URL, ensureCatalogHasStock, loginAsAdmin, servicesReady, unwrapApi } from './helpers/test-utils';

test.describe('Regression tests', () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!(await servicesReady(request)), 'Backend services are not running');
    await ensureCatalogHasStock(request);
  });

  test('order service uses internal product route (no 401 Unauthorized)', async ({
    request,
  }) => {
    const admin = await loginAsAdmin(request);
    const productsRes = await request.get(`${PRODUCT_URL}/products?limit=1`, {
      headers: { Authorization: `Bearer ${admin.accessToken}` },
    });
    const product = unwrapApi(await productsRes.json()).data[0];
    test.skip(!product, 'No products seeded');

    const shopperRes = await request.post('http://localhost:3004/auth/register', {
      data: {
        fullName: 'Regression User',
        email: `regression.${Date.now()}@revest.test`,
        password: 'Password123!',
      },
    });
    const token = unwrapApi<{ accessToken: string }>(await shopperRes.json()).accessToken;

    const orderRes = await request.post('http://localhost:3003/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: [{ productId: product.id, quantity: 1 }] },
    });

    const body = await orderRes.json();
    expect(orderRes.ok()).toBeTruthy();
    expect(unwrapApi(body).id ?? body.data?.id).toBeTruthy();
  });

  test('signup schema excludes Love React field', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Love React?')).toHaveCount(0);
    await expect(page.getByLabel('Full Name')).toHaveValue('');
    await expect(page.getByLabel('Email')).toHaveValue('');
  });

  test('cart and checkout routes exist in user flow', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Work email').fill('admin@revest.sa');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/admin');

    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Product catalog' })).toBeVisible();

    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();

    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();
  });
});
