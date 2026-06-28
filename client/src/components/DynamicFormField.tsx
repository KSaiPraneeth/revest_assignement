'use client';

import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { fieldKey } from '@/lib/form-utils';
import { FormFieldConfig } from '@/types/form';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  control: Control<Record<string, string>>;
  errors: FieldErrors<Record<string, string>>;
}

export function DynamicFormField({
  field,
  control,
  errors,
}: DynamicFormFieldProps) {
  const name = fieldKey(field);
  const error = errors[name];
  const helperText = error?.message as string | undefined;

  if (field.fieldType === 'TEXT') {
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
            error={Boolean(error)}
            helperText={helperText}
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

  if (field.fieldType === 'LIST') {
    const options = field.listOfValues1 ?? [];

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: controllerField }) => (
          <FormControl fullWidth required={field.required} error={Boolean(error)}>
            <FormLabel>{field.name}</FormLabel>
            <Select {...controllerField} label={field.name} displayEmpty>
              <MenuItem value="">
                <em>Select {field.name}</em>
              </MenuItem>
              {options.map((option, index) => (
                <MenuItem key={option} value={String(index)}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

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
          error={Boolean(error)}
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
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
