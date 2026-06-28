'use client';

import { QuantityStepper } from '@/components/ui/NumericInputs';
import { formatCurrency } from '@/lib/format';
import { Product } from '@/types/api';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useMemo } from 'react';

interface ProductCardProps {
  product: Product;
  quantity: number;
  cartQuantity?: number;
  adding?: boolean;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
}

export function ProductCard({
  product,
  quantity,
  cartQuantity = 0,
  adding = false,
  onQuantityChange,
  onAddToCart,
}: ProductCardProps) {
  const theme = useTheme();
  const price = Number(product.price);
  const lineTotal = price * quantity;
  const outOfStock = product.quantity < 1;
  const lowStock = product.quantity > 0 && product.quantity <= 5;
  const inCart = cartQuantity > 0;

  const stockChip = useMemo(() => {
    if (outOfStock) return { label: 'Out of stock', color: 'error' as const };
    if (lowStock) return { label: `${product.quantity} left`, color: 'warning' as const };
    return { label: `${product.quantity} in stock`, color: 'success' as const };
  }, [outOfStock, lowStock, product.quantity]);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: inCart ? `1px solid ${alpha(theme.palette.primary.main, 0.35)}` : undefined,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <Inventory2OutlinedIcon />
            </Box>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
              {inCart && (
                <Chip
                  size="small"
                  icon={<CheckCircleOutlineIcon />}
                  label={`${cartQuantity} in cart`}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip size="small" label={product.category} variant="outlined" />
              <Chip size="small" label={stockChip.label} color={stockChip.color} />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
              {product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SKU: {product.sku}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {product.description || 'No description provided.'}
          </Typography>

          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {formatCurrency(price)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              per unit
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <QuantityStepper
              label="Quantity"
              value={quantity}
              min={1}
              max={product.quantity}
              disabled={outOfStock}
              size="small"
              onChange={onQuantityChange}
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                Line total
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {formatCurrency(lineTotal)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Stack spacing={1} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={outOfStock || adding}
            onClick={onAddToCart}
            startIcon={<AddShoppingCartIcon />}
          >
            {adding ? 'Adding...' : outOfStock ? 'Unavailable' : 'Add to cart'}
          </Button>
          {inCart && (
            <Button
              component={Link}
              href="/cart"
              fullWidth
              variant="outlined"
              size="small"
            >
              View cart
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
