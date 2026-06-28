'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ordersApi } from '@/lib/api/orders';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Order } from '@/types/api';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Button, Skeleton, Stack } from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function OrdersPage() {
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.list({ limit: '50' });
      setOrders(res.data);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHeader
          title="My orders"
          subtitle="Track fulfillment status and review your purchase history."
          action={
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                href="/products"
                variant="outlined"
                startIcon={<ShoppingBagOutlinedIcon />}
              >
                Shop catalog
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshOutlinedIcon />}
                onClick={load}
                disabled={loading}
              >
                Refresh
              </Button>
            </Stack>
          }
        />

        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={140} />
          </Stack>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<LocalShippingOutlinedIcon />}
            title="No orders yet"
            description="Add items to your cart, complete checkout, and your orders will appear here."
            actionLabel="Browse catalog"
            actionHref="/products"
          />
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Stack>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
