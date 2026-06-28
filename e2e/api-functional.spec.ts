import { expect, test } from '@playwright/test';
import {
  AUTH_URL,
  ORDER_URL,
  PRODUCT_URL,
  ensureCatalogHasStock,
  loginAsAdmin,
  servicesReady,
  uniqueEmail,
  unwrapApi,
} from './helpers/test-utils';

test.describe('API functional tests', () => {
  test.beforeAll(async ({ request }) => {
    test.skip(!(await servicesReady(request)), 'Backend services are not running');
    await ensureCatalogHasStock(request);
  });

  test('health endpoints respond OK', async ({ request }) => {
    for (const url of [`${AUTH_URL}/health`, `${PRODUCT_URL}/health`, `${ORDER_URL}/health`]) {
      const res = await request.get(url);
      expect(res.ok()).toBeTruthy();
    }
  });

  test('admin can login and receive JWT', async ({ request }) => {
    const auth = await loginAsAdmin(request);
    expect(auth.accessToken).toBeTruthy();
    expect(auth.user.role).toBe('ADMIN');
  });

  test('internal product lookup does not require JWT', async ({ request }) => {
    const admin = await loginAsAdmin(request);
    const productsRes = await request.get(`${PRODUCT_URL}/products?limit=1`, {
      headers: { Authorization: `Bearer ${admin.accessToken}` },
    });
    expect(productsRes.ok()).toBeTruthy();
    const productsBody = await productsRes.json();
    const productId = unwrapApi(productsBody).data[0]?.id;
    test.skip(!productId, 'No products in catalog');

    const internalRes = await request.get(`${PRODUCT_URL}/internal/products/${productId}`);
    expect(internalRes.status()).not.toBe(401);
    expect(internalRes.ok()).toBeTruthy();
  });

  test('user can register, browse products, and place order', async ({ request }) => {
    const email = uniqueEmail('shopper');
    const registerRes = await request.post(`${AUTH_URL}/auth/register`, {
      data: {
        fullName: 'E2E Shopper',
        email,
        password: 'Password123!',
        gender: 'Female',
      },
    });
    expect(registerRes.ok()).toBeTruthy();
    const registerBody = await registerRes.json();
    const token = unwrapApi<{ accessToken: string }>(registerBody).accessToken;

    const productsRes = await request.get(`${PRODUCT_URL}/products?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(productsRes.ok()).toBeTruthy();
    const product = unwrapApi(await productsRes.json()).data[0];
    test.skip(!product, 'No products available for order test');

    const orderRes = await request.post(`${ORDER_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: [{ productId: product.id, quantity: 1 }] },
    });
    expect(orderRes.ok()).toBeTruthy();
    const orderBody = await orderRes.json();
    const order = unwrapApi(orderBody);
    expect(order.totalAmount).toBeGreaterThan(0);
    expect(order.products.length).toBeGreaterThan(0);
  });
});
