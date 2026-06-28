export type FieldType = 'TEXT' | 'LIST' | 'RADIO';

export interface FormFieldConfig {
  id: number;
  name: string;
  fieldType: FieldType;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  required: boolean;
  listOfValues1?: string[];
}

export interface FormSchema {
  data: FormFieldConfig[];
}

export interface SignupSubmission {
  id: string;
  submittedAt: string;
  values: Record<string, string>;
}
