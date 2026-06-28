'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ordersApi } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/format';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Order } from '@/types/api';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCallback, useEffect, useState } from 'react';

const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.list({ limit: '100' });
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await ordersApi.updateStatus(id, status);
      showSnackbar('Status updated', 'success');
      await load();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this order? Stock will be released if not cancelled.')) {
      return;
    }
    try {
      await ordersApi.remove(id);
      showSnackbar('Order deleted', 'success');
      await load();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout admin>
        <PageHeader
          title="Manage orders"
          subtitle="Update fulfillment status and review customer purchases."
        />

        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {loading ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<LocalShippingOutlinedIcon />}
              title="No orders yet"
              description="Customer orders will appear here after checkout."
            />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      {order.customerName}
                      <br />
                      <small>{order.customerEmail}</small>
                    </TableCell>
                    <TableCell>
                      {order.products.map((p) => (
                        <Chip
                          key={p.id}
                          size="small"
                          label={`${p.productName} ×${p.quantity}`}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="error" onClick={() => remove(order.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
