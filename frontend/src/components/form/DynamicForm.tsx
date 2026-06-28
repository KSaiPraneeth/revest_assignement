'use client';

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FieldRenderer } from '@/components/form/FieldRenderer';
import {
  buildDefaultValues,
  fieldKey,
  mapSubmissionValues,
} from '@/lib/form-utils';
import { buildValidationSchema } from '@/lib/validation/build-schema';
import { FormSchema } from '@/types/form';

interface DynamicFormProps {
  schema: FormSchema;
  isLoading?: boolean;
  submitLabel?: string;
  showHeader?: boolean;
  hideSubmitButton?: boolean;
  /** Rendered after dynamic fields, still inside the form (e.g. password fields). */
  children?: React.ReactNode;
  onSubmitSuccess?: (
    labeledValues: Record<string, string>,
    rawValues: Record<string, string>,
  ) => void | Promise<void>;
}

export function DynamicForm({
  schema,
  isLoading = false,
  submitLabel = 'Submit',
  showHeader = true,
  hideSubmitButton = false,
  children,
  onSubmitSuccess,
}: DynamicFormProps) {
  const validationSchema = useMemo(
    () => buildValidationSchema(schema.data),
    [schema.data],
  );

  const defaultValues = useMemo(
    () => buildDefaultValues(schema.data),
    [schema.data],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(validationSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(buildDefaultValues(schema.data));
  }, [schema.data, reset]);

  const onSubmit = async (values: Record<string, string>) => {
    const labeledValues = mapSubmissionValues(schema.data, values);
    await onSubmitSuccess?.(labeledValues, values);
    reset(buildDefaultValues(schema.data));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      {showHeader && (
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Your Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fields rendered dynamically from JSON
          </Typography>
        </Box>
      )}

      <Stack
        component="form"
        spacing={2}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {schema.data.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            control={control}
            errorMessage={errors[fieldKey(field)]?.message as string}
          />
        ))}

        {children}

        {!hideSubmitButton && (
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          >
            {isSubmitting ? 'Please wait...' : submitLabel}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
