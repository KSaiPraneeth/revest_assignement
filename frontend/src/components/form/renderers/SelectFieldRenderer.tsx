'use client';

import { MenuItem, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FieldRendererProps } from '@/types/form';
import { fieldKey } from '@/lib/form-utils';

export function SelectFieldRenderer({
  field,
  control,
  errorMessage,
}: FieldRendererProps) {
  const name = fieldKey(field);
  const options = field.listOfValues1 ?? [];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          select
          label={field.name}
          required={field.required}
          fullWidth
          error={Boolean(errorMessage)}
          helperText={errorMessage}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">
            <em>Select {field.name}</em>
          </MenuItem>
          {options.map((option, index) => (
            <MenuItem key={option} value={String(index)}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
