const STORAGE_KEY = 'revest_signup_submissions';
const SCHEMA_STORAGE_KEY = 'revest_form_schema';

import { FormSchema, SignupSubmission } from '@/types/form';

export function loadSubmissions(): SignupSubmission[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as SignupSubmission[];
  } catch {
    return [];
  }
}

export function saveSubmission(submission: SignupSubmission): SignupSubmission[] {
  const existing = loadSubmissions();
  const updated = [submission, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearSubmissions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadStoredSchema(): FormSchema | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(SCHEMA_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as FormSchema;
  } catch {
    return null;
  }
}

export function saveStoredSchema(schema: FormSchema): void {
  localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schema));
}

export function resetStoredSchema(): void {
  localStorage.removeItem(SCHEMA_STORAGE_KEY);
}
