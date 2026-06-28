'use client';

import { formatCurrency, formatDateTime } from '@/lib/format';
import { Order } from '@/types/api';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Link from 'next/link';

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const theme = useTheme();
  const itemCount = order.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Paper
      component={Link}
      href={`/orders/${order.id}`}
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Order #{order.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Chip
              size="small"
              label={order.status}
              color={statusColor[order.status] ?? 'default'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(order.createdAt)} · {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            {formatCurrency(Number(order.totalAmount))}
          </Typography>
          <ChevronRightIcon color="action" />
        </Stack>
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={0.75}>
        {order.products.slice(0, 3).map((item) => (
          <Box
            key={item.id}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
          >
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {item.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              × {item.quantity}
            </Typography>
          </Box>
        ))}
        {order.products.length > 3 && (
          <Typography variant="caption" color="text.secondary">
            +{order.products.length - 3} more item{order.products.length - 3 !== 1 ? 's' : ''}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
