import { describe, expect, it } from 'vitest';
import formSchema from '@/data/form-schema.json';

describe('signup form schema regression', () => {
  it('does not include removed Love React field', () => {
    const names = formSchema.data.map((field) => field.name);
    expect(names).not.toContain('Love React?');
  });

  it('does not ship hardcoded default values', () => {
    formSchema.data.forEach((field) => {
      expect('defaultValue' in field ? field.defaultValue : undefined).toBeUndefined();
    });
  });

  it('includes required signup fields only', () => {
    expect(formSchema.data.map((field) => field.name)).toEqual([
      'Full Name',
      'Email',
      'Gender',
    ]);
  });
});
