'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { ordersApi } from '@/lib/api/orders';
import { productsApi } from '@/lib/api/products';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { items, totals, clearCart, syncStock } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const validateCart = useCallback(async () => {
    try {
      const res = await productsApi.list({ limit: 100 });
      syncStock(res.data);
    } finally {
      setReady(true);
    }
  }, [syncStock]);

  useEffect(() => {
    validateCart();
  }, [validateCart]);

  useEffect(() => {
    if (ready && items.length === 0 && !orderComplete && !submitting) {
      router.replace('/cart');
    }
  }, [ready, items.length, orderComplete, submitting, router]);

  const placeOrder = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const order = await ordersApi.create(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      );
      setOrderComplete(true);
      showSnackbar('Order placed successfully!', 'success');
      router.push(`/orders/${order.id}?placed=1`);
      clearCart();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Checkout failed', 'error');
      await validateCart();
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || (items.length === 0 && !orderComplete)) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/cart" underline="hover" color="inherit">
            Cart
          </MuiLink>
          <Typography color="text.primary">Checkout</Typography>
        </Breadcrumbs>

        <PageHeader
          title="Checkout"
          subtitle="Confirm your order details and place your purchase."
        />

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Delivery details
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {user?.fullName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                </Stack>
              </Paper>

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order items ({totals.itemCount})
                </Typography>
                <Stack spacing={2}>
                  {items.map((item) => (
                    <CartLineItem
                      key={item.productId}
                      item={item}
                      readOnly
                      onQuantityChange={() => {}}
                      onRemove={() => {}}
                    />
                  ))}
                </Stack>
                <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
                  To change quantities, go back to your{' '}
                  <MuiLink component={Link} href="/cart">
                    cart
                  </MuiLink>
                  .
                </Alert>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <CartSummary
              totals={totals}
              checkoutLabel="Place order"
              checkoutLoading={submitting}
              checkoutDisabled={submitting}
              onCheckout={placeOrder}
              showContinueShopping={false}
            />
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
