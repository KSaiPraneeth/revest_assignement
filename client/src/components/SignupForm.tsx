'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DynamicFormField } from '@/components/DynamicFormField';
import {
  buildDefaultValues,
  buildValidationSchema,
  fieldKey,
} from '@/lib/form-utils';
import { saveSubmission } from '@/lib/storage';
import { FormFieldConfig, FormSchema, SignupSubmission } from '@/types/form';

interface SignupFormProps {
  schema: FormSchema;
  onSubmitSuccess?: (submission: SignupSubmission) => void;
}

export function SignupForm({ schema, onSubmitSuccess }: SignupFormProps) {
  const [successMessage, setSuccessMessage] = useState('');

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
    resolver: zodResolver(validationSchema) as never,
    defaultValues,
  });

  useEffect(() => {
    reset(buildDefaultValues(schema.data));
  }, [schema.data, reset]);

  const onSubmit = (values: Record<string, string>) => {
    const labeledValues = schema.data.reduce<Record<string, string>>(
      (acc, field) => {
        const rawValue = values[fieldKey(field)] ?? '';
        if (field.fieldType === 'LIST' || field.fieldType === 'RADIO') {
          const index = Number(rawValue);
          acc[field.name] = field.listOfValues1?.[index] ?? rawValue;
        } else {
          acc[field.name] = rawValue;
        }
        return acc;
      },
      {},
    );

    const submission: SignupSubmission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      values: labeledValues,
    };

    saveSubmission(submission);
    setSuccessMessage('Signup saved successfully.');
    onSubmitSuccess?.(submission);
    reset(buildDefaultValues(schema.data));
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
              Sign Up
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dynamic form fields rendered from JSON configuration.
            </Typography>
          </Box>

          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          <Stack
            component="form"
            spacing={2.5}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {schema.data.map((field: FormFieldConfig) => (
              <DynamicFormField
                key={field.id}
                field={field}
                control={control}
                errors={errors}
              />
            ))}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
