'use client';

import { DynamicForm } from '@/components/form/DynamicForm';
import { AuthLayout } from '@/components/layout/AuthLayout';
import defaultSchema from '@/data/form-schema.json';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/hooks/useSnackbar';
import { FormSchema } from '@/types/form';
import {
  Divider,
  Link as MuiLink,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validatePasswords = (): boolean => {
    let valid = true;
    setPasswordError('');
    setConfirmError('');

    if (password.length < 6) {
      setPasswordError('At least 6 characters required');
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!validatePasswords()) {
      showSnackbar('Please fix the errors below', 'error');
      throw new Error('validation');
    }

    setSubmitting(true);
    try {
      await register({
        fullName: values['Full Name'] ?? '',
        email: values['Email'] ?? '',
        gender: values['Gender'],
        password,
      });
      showSnackbar('Account created!', 'success');
    } catch (err) {
      if (err instanceof Error && err.message !== 'validation') {
        showSnackbar(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Fill in your details to access the product catalog and place orders."
      footer={
        <Typography variant="body2" textAlign="center" color="text.secondary">
          Already registered?{' '}
          <MuiLink component={Link} href="/login" fontWeight={600}>
            Sign in
          </MuiLink>
        </Typography>
      }
    >
      <DynamicForm
        schema={defaultSchema as FormSchema}
        showHeader={false}
        submitLabel={submitting ? 'Creating account...' : 'Create account'}
        onSubmitSuccess={handleSubmit}
      >
        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Security
          </Typography>
        </Divider>

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          autoComplete="new-password"
          value={password}
          error={Boolean(passwordError)}
          helperText={passwordError || 'Minimum 6 characters'}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError('');
          }}
        />
        <TextField
          label="Confirm password"
          type="password"
          fullWidth
          required
          autoComplete="new-password"
          value={confirmPassword}
          error={Boolean(confirmError)}
          helperText={confirmError}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError('');
          }}
        />
      </DynamicForm>
    </AuthLayout>
  );
}
