import { API, apiFetch } from '@/lib/api/client';
import { Order, Paginated } from '@/types/api';

export const ordersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params
      ? `?${new URLSearchParams(params)}`
      : '';
    return apiFetch<Paginated<Order>>(API.orders, `/orders${qs}`);
  },

  create: (items: { productId: string; quantity: number }[]) =>
    apiFetch<Order>(API.orders, '/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  get: (id: string) => apiFetch<Order>(API.orders, `/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    apiFetch<Order>(API.orders, `/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  remove: (id: string) =>
    apiFetch<{ message: string }>(API.orders, `/orders/${id}`, {
      method: 'DELETE',
    }),
};
