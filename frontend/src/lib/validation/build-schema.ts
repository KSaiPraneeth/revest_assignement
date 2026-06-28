import { FormFieldConfig } from '@/types/form';
import { z } from 'zod';
import { fieldKey } from '../form-utils';

type RuleBuilder = (field: FormFieldConfig, base: z.ZodString) => z.ZodTypeAny;

const textRules: RuleBuilder[] = [
  (field, base) => {
    if (field.name.toLowerCase().includes('email')) {
      return base.email('Enter a valid email address');
    }
    return base;
  },
  (field, base) =>
    field.minLength !== undefined
      ? base.min(field.minLength, `${field.name} must be at least ${field.minLength} characters`)
      : base,
  (field, base) =>
    field.maxLength !== undefined
      ? base.max(field.maxLength, `${field.name} must be at most ${field.maxLength} characters`)
      : base,
];

function buildTextSchema(field: FormFieldConfig): z.ZodTypeAny {
  let schema = z.string().trim();

  for (const rule of textRules) {
    schema = rule(field, schema) as z.ZodString;
  }

  return field.required
    ? schema.min(1, `${field.name} is required`)
    : schema.optional().or(z.literal(''));
}

function buildChoiceSchema(field: FormFieldConfig): z.ZodTypeAny {
  const schema = z.string();
  return field.required
    ? schema.min(1, `${field.name} is required`)
    : schema.optional();
}

const schemaBuilders: Record<FormFieldConfig['fieldType'], (field: FormFieldConfig) => z.ZodTypeAny> = {
  TEXT: buildTextSchema,
  LIST: buildChoiceSchema,
  RADIO: buildChoiceSchema,
};

export function buildValidationSchema(fields: FormFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const builder = schemaBuilders[field.fieldType];
    shape[fieldKey(field)] = builder(field);
  }

  return z.object(shape);
}
