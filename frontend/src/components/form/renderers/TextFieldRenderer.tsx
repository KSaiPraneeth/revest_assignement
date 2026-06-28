'use client';

import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FieldRendererProps } from '@/types/form';
import { fieldKey } from '@/lib/form-utils';

export function TextFieldRenderer({
  field,
  control,
  errorMessage,
}: FieldRendererProps) {
  const name = fieldKey(field);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: controllerField }) => (
        <TextField
          {...controllerField}
          label={field.name}
          required={field.required}
          fullWidth
          error={Boolean(errorMessage)}
          helperText={errorMessage}
          slotProps={{
            htmlInput: {
              minLength: field.minLength,
              maxLength: field.maxLength,
            },
          }}
        />
      )}
    />
  );
}
