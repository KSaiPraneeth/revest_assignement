'use client';

import { QuantityStepper } from '@/components/ui/NumericInputs';
import { formatCurrency } from '@/lib/format';
import { CartItem } from '@/types/cart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

interface CartLineItemProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  stockWarning?: string;
  readOnly?: boolean;
}

export function CartLineItem({
  item,
  onQuantityChange,
  onRemove,
  stockWarning,
  readOnly = false,
}: CartLineItemProps) {
  const theme = useTheme();
  const lineTotal = item.price * item.quantity;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {item.name.charAt(0)}
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {item.name}
            </Typography>
            {item.category && (
              <Chip size="small" label={item.category} variant="outlined" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            SKU: {item.sku} · {formatCurrency(item.price)} each
          </Typography>
          {stockWarning && (
            <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
              {stockWarning}
            </Typography>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
        >
          {readOnly ? (
            <Typography variant="body2" color="text.secondary">
              Qty: {item.quantity}
            </Typography>
          ) : (
            <QuantityStepper
              value={item.quantity}
              min={1}
              max={item.maxQuantity}
              size="small"
              onChange={onQuantityChange}
            />
          )}
          <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 88, textAlign: 'right' }}>
            {formatCurrency(lineTotal)}
          </Typography>
          {!readOnly && (
            <IconButton
              aria-label={`Remove ${item.name}`}
              color="error"
              onClick={onRemove}
              size="small"
            >
              <DeleteOutlineIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
