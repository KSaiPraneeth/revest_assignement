'use client';

import { FieldRendererProps } from '@/types/form';
import { getFieldRenderer } from './renderers';

export function FieldRenderer(props: FieldRendererProps) {
  const Renderer = getFieldRenderer(props.field.fieldType);
  return <Renderer {...props} />;
}
