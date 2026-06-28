'use client';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { clamp } from '@/lib/format';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  label = 'Quantity',
  disabled = false,
  size = 'medium',
}: QuantityStepperProps) {
  const safeValue = clamp(value || min, min, max);

  const update = (next: number) => {
    onChange(clamp(next, min, max));
  };

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <IconButton
          size={size}
          onClick={() => update(safeValue - 1)}
          disabled={disabled || safeValue <= min}
          aria-label="Decrease quantity"
          sx={{ borderRadius: 0 }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <TextField
          value={safeValue}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            update(Number.isNaN(parsed) ? min : parsed);
          }}
          disabled={disabled}
          inputProps={{
            min,
            max,
            style: { textAlign: 'center', width: size === 'small' ? 40 : 52 },
            'aria-label': label,
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiInputBase-input': {
              py: size === 'small' ? 0.75 : 1,
              px: 0.5,
              fontWeight: 600,
            },
          }}
        />

        <IconButton
          size={size}
          onClick={() => update(safeValue + 1)}
          disabled={disabled || safeValue >= max}
          aria-label="Increase quantity"
          sx={{ borderRadius: 0 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

interface CurrencyFieldProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

export function CurrencyField({
  label = 'Price',
  value,
  onChange,
  currency = 'SAR',
  required,
  error,
  helperText,
  fullWidth = true,
}: CurrencyFieldProps) {
  return (
    <TextField
      label={label}
      fullWidth={fullWidth}
      required={required}
      error={error}
      helperText={helperText}
      value={value === 0 ? '' : value}
      placeholder="0.00"
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') {
          onChange(0);
          return;
        }
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          onChange(Math.round(parsed * 100) / 100);
        }
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {currency}
            </Typography>
          </InputAdornment>
        ),
        inputMode: 'decimal',
      }}
      inputProps={{ min: 0, step: 0.01 }}
    />
  );
}
