'use client';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { FieldRendererProps } from '@/types/form';
import { fieldKey } from '@/lib/form-utils';

export function RadioFieldRenderer({
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
        <FormControl
          component="fieldset"
          fullWidth
          required={field.required}
          error={Boolean(errorMessage)}
        >
          <FormLabel component="legend">{field.name}</FormLabel>
          <RadioGroup {...controllerField} row>
            {options.map((option, index) => (
              <FormControlLabel
                key={option}
                value={String(index)}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
          {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
