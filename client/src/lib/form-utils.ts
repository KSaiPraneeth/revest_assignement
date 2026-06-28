import { FormFieldConfig } from '@/types/form';
import { z } from 'zod';

export function fieldKey(field: FormFieldConfig): string {
  return `field_${field.id}`;
}

export function buildValidationSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const key = fieldKey(field);
    let schema: z.ZodTypeAny;

    if (field.fieldType === 'TEXT') {
      let textSchema = z.string().trim();

      if (field.name.toLowerCase().includes('email')) {
        textSchema = textSchema.email('Enter a valid email address');
      }

      if (field.minLength !== undefined) {
        textSchema = textSchema.min(
          field.minLength,
          `${field.name} must be at least ${field.minLength} characters`,
        );
      }

      if (field.maxLength !== undefined) {
        textSchema = textSchema.max(
          field.maxLength,
          `${field.name} must be at most ${field.maxLength} characters`,
        );
      }

      schema = field.required
        ? textSchema.min(1, `${field.name} is required`)
        : textSchema.optional().or(z.literal(''));
    } else {
      schema = field.required
        ? z.string().min(1, `${field.name} is required`)
        : z.string().optional();
    }

    shape[key] = schema;
  }

  return z.object(shape);
}

export function buildDefaultValues(fields: FormFieldConfig[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[fieldKey(field)] = field.defaultValue ?? '';
    return acc;
  }, {});
}
