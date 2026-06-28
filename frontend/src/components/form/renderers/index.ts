import { ComponentType } from 'react';
import { FieldRendererProps, FieldType } from '@/types/form';
import { RadioFieldRenderer } from './RadioFieldRenderer';
import { SelectFieldRenderer } from './SelectFieldRenderer';
import { TextFieldRenderer } from './TextFieldRenderer';

export const fieldRendererRegistry: Record<
  FieldType,
  ComponentType<FieldRendererProps>
> = {
  TEXT: TextFieldRenderer,
  LIST: SelectFieldRenderer,
  RADIO: RadioFieldRenderer,
};

export function getFieldRenderer(fieldType: string) {
  return fieldRendererRegistry[fieldType as FieldType] ?? TextFieldRenderer;
}
