import { describe, expect, it } from 'vitest';
import {
  buildDefaultValues,
  fieldKey,
  mapSubmissionValues,
  resolveDefaultValue,
  resolveOptionValue,
} from '@/lib/form-utils';
import { FormFieldConfig } from '@/types/form';

const textField: FormFieldConfig = {
  id: 1,
  name: 'Full Name',
  fieldType: 'TEXT',
  required: true,
};

const listField: FormFieldConfig = {
  id: 6,
  name: 'Gender',
  fieldType: 'LIST',
  required: true,
  listOfValues1: ['Male', 'Female', 'Others'],
};

describe('form-utils', () => {
  it('builds stable field keys', () => {
    expect(fieldKey(textField)).toBe('field_1');
  });

  it('returns empty defaults when schema has no defaultValue', () => {
    expect(resolveDefaultValue(textField)).toBe('');
    expect(resolveDefaultValue(listField)).toBe('');
    expect(buildDefaultValues([textField, listField])).toEqual({
      field_1: '',
      field_6: '',
    });
  });

  it('maps list indices back to labels on submit', () => {
    const values = mapSubmissionValues([listField], { field_6: '0' });
    expect(values.Gender).toBe('Male');
  });

  it('resolves option values from index or label', () => {
    expect(resolveOptionValue(listField, '1')).toBe('Female');
    expect(resolveOptionValue(listField, 'Female')).toBe('Female');
    expect(resolveOptionValue(textField, 'Jane')).toBe('Jane');
  });
});
