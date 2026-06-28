'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ProductFormDialog,
  ProductFormValues,
} from '@/components/products/ProductFormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { productsApi } from '@/lib/api/products';
import { formatCurrency } from '@/lib/format';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Product } from '@/types/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function AdminProductsPage() {
  const { showSnackbar } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    productsApi.list({ limit: 100 }).then((r) => setProducts(r.data));

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (form: ProductFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await productsApi.update(editing.id, form);
        showSnackbar('Product updated successfully', 'success');
      } else {
        await productsApi.create(form);
        showSnackbar('Product created successfully', 'success');
      }
      setOpen(false);
      await load();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Save failed', 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this product from the catalog?')) return;
    try {
      await productsApi.remove(id);
      showSnackbar('Product removed', 'success');
      load();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout admin>
        <PageHeader
          title="Product management"
          subtitle="Maintain catalog items, pricing, and inventory levels."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add product
            </Button>
          }
        />

        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <strong>{p.name}</strong>
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {p.description || '—'}
                      </span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={p.quantity}
                      color={p.quantity <= 5 ? 'warning' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(Number(p.price))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.active ? 'Active' : 'Inactive'}
                      color={p.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => remove(p.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <ProductFormDialog
          open={open}
          editing={editing}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
