'use client';

import { CurrencyField, QuantityStepper } from '@/components/ui/NumericInputs';
import { Product } from '@/types/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  active: boolean;
}

const emptyForm: ProductFormValues = {
  name: '',
  sku: '',
  description: '',
  category: '',
  quantity: 0,
  price: 0,
  active: true,
};

interface ProductFormDialogProps {
  open: boolean;
  editing: Product | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: ProductFormValues) => Promise<void>;
}

export function ProductFormDialog({
  open,
  editing,
  saving = false,
  onClose,
  onSave,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        sku: editing.sku,
        description: editing.description,
        category: editing.category,
        quantity: editing.quantity,
        price: Number(editing.price),
        active: editing.active,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, editing]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.sku.trim()) next.sku = 'SKU is required';
    if (!form.category.trim()) next.category = 'Category is required';
    if (form.quantity < 0) next.quantity = 'Stock cannot be negative';
    if (form.price <= 0) next.price = 'Price must be greater than zero';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 1 }}>
        {editing ? 'Edit Product' : 'Add Product'}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {editing ? 'Update catalog details and inventory' : 'Create a new catalog item'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5} sx={{ pt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product name"
              fullWidth
              required
              value={form.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SKU"
              fullWidth
              required
              value={form.sku}
              error={Boolean(errors.sku)}
              helperText={errors.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Category"
              fullWidth
              required
              value={form.category}
              error={Boolean(errors.category)}
              helperText={errors.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
              }
              label="Available for ordering"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <QuantityStepper
              label="Stock quantity"
              value={form.quantity}
              min={0}
              max={999999}
              onChange={(quantity) => setForm({ ...form, quantity })}
            />
            {errors.quantity && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.quantity}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <CurrencyField
              label="Unit price"
              value={form.price}
              onChange={(price) => setForm({ ...form, price })}
              required
              error={Boolean(errors.price)}
              helperText={errors.price}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
