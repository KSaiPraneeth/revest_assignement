import { APIRequestContext } from '@playwright/test';

export const AUTH_URL = process.env.E2E_AUTH_URL ?? 'http://localhost:3004';
export const PRODUCT_URL = process.env.E2E_PRODUCT_URL ?? 'http://localhost:3001';
export const ORDER_URL = process.env.E2E_ORDER_URL ?? 'http://localhost:3003';

export async function servicesReady(request: APIRequestContext): Promise<boolean> {
  try {
    const checks = await Promise.all([
      request.get(`${AUTH_URL}/health`),
      request.get(`${PRODUCT_URL}/health`),
      request.get(`${ORDER_URL}/health`),
    ]);
    return checks.every((res) => res.ok());
  } catch {
    return false;
  }
}

export async function loginAsAdmin(request: APIRequestContext) {
  const response = await request.post(`${AUTH_URL}/auth/login`, {
    data: { email: 'admin@revest.sa', password: 'Admin@123' },
  });
  if (!response.ok()) {
    throw new Error(`Admin login failed: ${response.status()}`);
  }
  const body = await response.json();
  return (body.data ?? body) as {
    accessToken: string;
    user: { id: string; role: string };
  };
}

export async function loginViaUi(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/login');
  await page.getByLabel('Work email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export function unwrapApi<T>(body: { data?: T } & T): T {
  return (body.data ?? body) as T;
}

export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}.${Date.now()}@revest.test`;
}

export async function ensureCatalogHasStock(request: APIRequestContext) {
  const admin = await loginAsAdmin(request);
  const headers = { Authorization: `Bearer ${admin.accessToken}` };

  const productsRes = await request.get(`${PRODUCT_URL}/products?limit=20`, {
    headers,
  });
  const products = unwrapApi<{ data: Array<{ id: string; quantity: number }> }>(
    await productsRes.json(),
  ).data;

  if (products.length === 0) {
    await request.post(`${PRODUCT_URL}/products`, {
      headers,
      data: {
        name: 'E2E Test Product',
        sku: `E2E-${Date.now()}`,
        description: 'Automated test product',
        category: 'Test',
        quantity: 100,
        price: 49.99,
        active: true,
      },
    });
    return;
  }

  for (const product of products) {
    if (product.quantity < 10) {
      await request.patch(`${PRODUCT_URL}/products/${product.id}`, {
        headers,
        data: { quantity: 100, active: true },
      });
    }
  }
}
