'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PlatformOverview } from '@/components/admin/PlatformOverview';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { authApi } from '@/lib/api/auth';
import { ordersApi } from '@/lib/api/orders';
import { productsApi } from '@/lib/api/products';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { AuditLog, Order, Product, User } from '@/types/api';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
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
import { useCallback, useEffect, useMemo, useState } from 'react';

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, orderRes, userList, auditList] = await Promise.all([
        productsApi.list({ limit: 100 }),
        ordersApi.list({ limit: '100' }),
        authApi.listUsers(),
        authApi.auditLogs(),
      ]);
      setProducts(productRes.data);
      setProductTotal(productRes.meta.total);
      setOrders(orderRes.data);
      setOrderTotal(orderRes.meta.total);
      setUsers(userList);
      setLogs(auditList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const lowStock = products.filter(
      (p) => p.active && p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD,
    );
    const outOfStock = products.filter((p) => p.active && p.quantity < 1);
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    return { revenue, lowStock, outOfStock, pendingOrders, statusCounts };
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders],
  );

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )
        .slice(0, 5),
    [users],
  );

  const recentLogs = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [logs],
  );

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout admin>
        <PageHeader
          title="Operations overview"
          subtitle="Full platform visibility — catalog, orders, users, and system activity in one place."
          action={
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          }
        />

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Active products"
                value={productTotal}
                icon={<Inventory2OutlinedIcon />}
                accent="#0f4c81"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Total orders"
                value={orderTotal}
                icon={<ReceiptLongOutlinedIcon />}
                accent="#00a896"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Revenue"
                value={formatCurrency(stats.revenue)}
                icon={<ShoppingBagOutlinedIcon />}
                accent="#6366f1"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Registered users"
                value={users.length}
                icon={<PeopleOutlineIcon />}
                accent="#f4a261"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Low stock"
                value={stats.lowStock.length + stats.outOfStock.length}
                icon={<WarningAmberOutlinedIcon />}
                accent="#ef4444"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            {loading ? (
              <Skeleton variant="rounded" height={110} />
            ) : (
              <StatCard
                label="Pending orders"
                value={stats.pendingOrders}
                icon={<HistoryOutlinedIcon />}
                accent="#f59e0b"
              />
            )}
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          Quick actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage products"
              description="Add, edit, and control catalog inventory and pricing."
              href="/admin/products"
              icon={<Inventory2OutlinedIcon />}
              accent="#0f4c81"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage orders"
              description="Update fulfillment status and review customer purchases."
              href="/admin/orders"
              icon={<ReceiptLongOutlinedIcon />}
              accent="#00a896"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage users"
              description="View registered accounts, roles, and access control."
              href="/admin/users"
              icon={<PeopleOutlineIcon />}
              accent="#f4a261"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Audit logs"
              description="Trace logins, product changes, and order events."
              href="/admin/audit"
              icon={<HistoryOutlinedIcon />}
              accent="#6366f1"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={7}>
            <Stack spacing={2.5}>
              <PlatformOverview />

              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Box
                  sx={{
                    px: 2.5,
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Recent orders
                  </Typography>
                  <MuiLink component={Link} href="/admin/orders" variant="body2" fontWeight={600}>
                    View all
                  </MuiLink>
                </Box>
                {loading ? (
                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Skeleton height={40} />
                    <Skeleton height={40} />
                  </Stack>
                ) : recentOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
                    No orders yet. Customer checkout will appear here.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.products.length}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(Number(order.totalAmount))}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={order.status}
                              color={statusColor[order.status] ?? 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Order pipeline
                </Typography>
                {loading ? (
                  <Skeleton height={120} />
                ) : orderTotal === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No orders to analyze yet.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {Object.entries(stats.statusCounts).map(([status, count]) => (
                      <Chip
                        key={status}
                        label={`${status}: ${count}`}
                        color={statusColor[status] ?? 'default'}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Inventory alerts
                  </Typography>
                  <MuiLink component={Link} href="/admin/products" variant="body2" fontWeight={600}>
                    Manage
                  </MuiLink>
                </Stack>
                {loading ? (
                  <Skeleton height={100} />
                ) : stats.lowStock.length === 0 && stats.outOfStock.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    All products are well stocked.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {stats.outOfStock.map((p) => (
                      <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                          {p.name}
                        </Typography>
                        <Chip size="small" label="Out of stock" color="error" />
                      </Stack>
                    ))}
                    {stats.lowStock.map((p) => (
                      <Stack key={p.id} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                          {p.name}
                        </Typography>
                        <Chip size="small" label={`${p.quantity} left`} color="warning" />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recent users
                  </Typography>
                  <MuiLink component={Link} href="/admin/users" variant="body2" fontWeight={600}>
                    View all
                  </MuiLink>
                </Stack>
                {loading ? (
                  <Skeleton height={100} />
                ) : recentUsers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No registered users yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {recentUsers.map((user) => (
                      <Box key={user.id}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={600}>
                            {user.fullName}
                          </Typography>
                          <Chip size="small" label={user.role} variant="outlined" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Activity feed
                  </Typography>
                  <MuiLink component={Link} href="/admin/audit" variant="body2" fontWeight={600}>
                    Full log
                  </MuiLink>
                </Stack>
                {loading ? (
                  <Skeleton height={140} />
                ) : recentLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No audit events recorded yet.
                  </Typography>
                ) : (
                  <Stack spacing={1.25}>
                    {recentLogs.map((log) => (
                      <Box key={log.id}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                          <Chip size="small" label={log.action} />
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {formatDateTime(log.createdAt)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {log.entity}
                          {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <StorefrontOutlinedIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Customer storefront
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Preview the shopping experience — catalog, cart, checkout, and order tracking
                  as your customers see it.
                </Typography>
                <Button
                  component={Link}
                  href="/products"
                  variant="contained"
                  color="secondary"
                  size="small"
                >
                  Open storefront
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
