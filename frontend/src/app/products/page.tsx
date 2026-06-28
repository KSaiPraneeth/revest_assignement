'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { productsApi } from '@/lib/api/products';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useCart } from '@/providers/CartProvider';
import { Product } from '@/types/api';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Badge, Button, Grid, Skeleton, Stack } from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function ProductsPage() {
  const { showSnackbar } = useSnackbar();
  const { addItem, getQuantityInCart, syncStock, totals } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ limit: 50 });
      setProducts(res.data);
      syncStock(res.data);
      setQuantities((prev) => {
        const next = { ...prev };
        res.data.forEach((p) => {
          if (!next[p.id]) next[p.id] = 1;
        });
        return next;
      });
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to load catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, syncStock]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] ?? 1;
    const alreadyInCart = getQuantityInCart(product.id);
    const remaining = product.quantity - alreadyInCart;

    if (remaining < 1) {
      showSnackbar(`${product.name} is already at max stock in your cart`, 'warning');
      return;
    }

    const toAdd = Math.min(qty, remaining);
    setAddingId(product.id);
    addItem(product, toAdd);
    setAddingId(null);
    showSnackbar(
      `${toAdd} × ${product.name} added to cart`,
      'success',
    );
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <PageHeader
          title="Product catalog"
          subtitle="Browse products, add items to your cart, then review and checkout."
          action={
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                href="/cart"
                variant="contained"
                startIcon={
                  <Badge badgeContent={totals.itemCount} color="secondary">
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                }
              >
                Cart
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

        <Grid container spacing={2.5}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} lg={4} key={i}>
                  <Skeleton variant="rounded" height={340} />
                </Grid>
              ))
            : products.length === 0
              ? (
                <Grid item xs={12}>
                  <EmptyState
                    icon={<Inventory2OutlinedIcon />}
                    title="No products available"
                    description="Check back later or contact your administrator to restock the catalog."
                    actionLabel="Refresh catalog"
                    onAction={load}
                  />
                </Grid>
              )
              : products.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product.id}>
                  <ProductCard
                    product={product}
                    quantity={quantities[product.id] ?? 1}
                    cartQuantity={getQuantityInCart(product.id)}
                    adding={addingId === product.id}
                    onQuantityChange={(qty) =>
                      setQuantities((q) => ({ ...q, [product.id]: qty }))
                    }
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </Grid>
              ))}
        </Grid>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
