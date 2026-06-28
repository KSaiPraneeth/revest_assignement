'use client';

import { formatCurrency } from '@/lib/format';
import { CartTotals } from '@/types/cart';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';

interface CartSummaryProps {
  totals: CartTotals;
  checkoutHref?: string;
  onCheckout?: () => void;
  checkoutLabel?: string;
  checkoutDisabled?: boolean;
  checkoutLoading?: boolean;
  showContinueShopping?: boolean;
}

export function CartSummary({
  totals,
  checkoutHref,
  onCheckout,
  checkoutLabel = 'Proceed to checkout',
  checkoutDisabled = false,
  checkoutLoading = false,
  showContinueShopping = true,
}: CartSummaryProps) {
  const vatEstimate = totals.subtotal * 0.15;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, position: 'sticky', top: 88 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Order summary
      </Typography>

      <Stack spacing={1.5} sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Items ({totals.itemCount})
          </Typography>
          <Typography variant="body2">{formatCurrency(totals.subtotal)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            VAT (15% est.)
          </Typography>
          <Typography variant="body2">{formatCurrency(vatEstimate)}</Typography>
        </Box>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Total
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary.main">
            {formatCurrency(totals.subtotal + vatEstimate)}
          </Typography>
        </Box>
      </Stack>

      {checkoutHref ? (
        <Button
          component={Link}
          href={checkoutHref}
          variant="contained"
          size="large"
          fullWidth
          disabled={checkoutDisabled || totals.itemCount === 0}
        >
          {checkoutLabel}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={checkoutDisabled || totals.itemCount === 0}
          onClick={onCheckout}
        >
          {checkoutLoading ? 'Placing order...' : checkoutLabel}
        </Button>
      )}

      {showContinueShopping && (
        <Button
          component={Link}
          href="/products"
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
        >
          Continue shopping
        </Button>
      )}
    </Paper>
  );
}
