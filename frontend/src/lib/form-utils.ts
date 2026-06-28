import { FormFieldConfig } from '@/types/form';

export function fieldKey(field: FormFieldConfig): string {
  return `field_${field.id}`;
}

export function resolveOptionValue(
  field: FormFieldConfig,
  rawValue: string,
): string {
  if (field.fieldType === 'LIST' || field.fieldType === 'RADIO') {
    const options = field.listOfValues1 ?? [];
    const byIndex = options[Number(rawValue)];
    if (byIndex !== undefined) return byIndex;
    if (options.includes(rawValue)) return rawValue;
  }
  return rawValue;
}

export function resolveDefaultValue(field: FormFieldConfig): string {
  const defaultValue = field.defaultValue ?? '';

  if (field.fieldType === 'LIST' || field.fieldType === 'RADIO') {
    const options = field.listOfValues1 ?? [];
    const index = options.indexOf(defaultValue);
    return index >= 0 ? String(index) : '';
  }

  return defaultValue;
}

export function buildDefaultValues(fields: FormFieldConfig[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[fieldKey(field)] = resolveDefaultValue(field);
    return acc;
  }, {});
}

export function mapSubmissionValues(
  fields: FormFieldConfig[],
  values: Record<string, string>,
): Record<string, string> {
  return fields.reduce<Record<string, string>>((acc, field) => {
    const raw = values[fieldKey(field)] ?? '';
    acc[field.name] = resolveOptionValue(field, raw);
    return acc;
  }, {});
}
