'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { ordersApi } from '@/lib/api/orders';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Order } from '@/types/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get('placed') === '1';
  const { showSnackbar } = useSnackbar();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordersApi.get(params.id);
      setOrder(data);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  }, [params.id, showSnackbar]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/orders" underline="hover" color="inherit">
            My orders
          </MuiLink>
          <Typography color="text.primary">
            {order ? `#${order.id.slice(0, 8).toUpperCase()}` : 'Order'}
          </Typography>
        </Breadcrumbs>

        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={240} />
          </Stack>
        ) : !order ? (
          <Alert severity="error">Order not found.</Alert>
        ) : (
          <>
            {justPlaced && (
              <Alert
                severity="success"
                icon={<CheckCircleOutlineIcon />}
                sx={{ mb: 3 }}
              >
                Your order was placed successfully. You can track its status below.
              </Alert>
            )}

            <PageHeader
              title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
              subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
              action={
                <Stack direction="row" spacing={1}>
                  <Button component={Link} href="/products" variant="outlined">
                    Continue shopping
                  </Button>
                  <Button component={Link} href="/orders" variant="contained">
                    All orders
                  </Button>
                </Stack>
              }
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Items ordered
                    </Typography>
                  </Box>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Unit price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Line total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.products.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(Number(item.unitPrice))}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(Number(item.unitPrice) * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={order.status}
                          color={statusColor[order.status] ?? 'default'}
                        />
                      </Box>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {order.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.customerEmail}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Order total
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        {formatCurrency(Number(order.totalAmount))}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
