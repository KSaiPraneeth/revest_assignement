'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { productsApi } from '@/lib/api/products';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useCart } from '@/providers/CartProvider';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Alert, Grid, Skeleton, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function CartPage() {
  const { showSnackbar } = useSnackbar();
  const { items, totals, updateQuantity, removeItem, syncStock } = useCart();
  const [syncing, setSyncing] = useState(true);

  const refreshStock = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await productsApi.list({ limit: 100 });
      syncStock(res.data);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to refresh stock', 'error');
    } finally {
      setSyncing(false);
    }
  }, [showSnackbar, syncStock]);

  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  const stockWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    items.forEach((item) => {
      if (item.quantity >= item.maxQuantity) {
        warnings[item.productId] = `Maximum available stock (${item.maxQuantity})`;
      }
    });
    return warnings;
  }, [items]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHeader
          title="Shopping cart"
          subtitle="Review your items before proceeding to checkout."
        />

        {syncing && items.length > 0 ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={100} />
          </Stack>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingCartOutlinedIcon />}
            title="Your cart is empty"
            description="Browse the catalog and add products to your cart."
            actionLabel="Browse catalog"
            actionHref="/products"
          />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Alert severity="info" variant="outlined">
                  Stock levels are refreshed automatically. Adjust quantities or remove items before checkout.
                </Alert>
                {items.map((item) => (
                  <CartLineItem
                    key={item.productId}
                    item={item}
                    stockWarning={stockWarnings[item.productId]}
                    onQuantityChange={(qty) => updateQuantity(item.productId, qty)}
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <CartSummary totals={totals} checkoutHref="/checkout" />
            </Grid>
          </Grid>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
