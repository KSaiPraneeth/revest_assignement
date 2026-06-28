import { API, apiFetch } from '@/lib/api/client';
import { Order, Paginated, Product } from '@/types/api';

export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) => {
    const qs = params
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        )}`
      : '';
    return apiFetch<Paginated<Product>>(API.products, `/products${qs}`);
  },

  get: (id: string) => apiFetch<Product>(API.products, `/products/${id}`),

  create: (data: Partial<Product>) =>
    apiFetch<Product>(API.products, '/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Product>) =>
    apiFetch<Product>(API.products, `/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<{ message: string }>(API.products, `/products/${id}`, {
      method: 'DELETE',
    }),
};
