'use client';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/hooks/useSnackbar';
import {
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      showSnackbar('Your session expired. Please sign in again.', 'warning');
    }
  }, [searchParams, showSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showSnackbar('Welcome back!', 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to browse products, place orders, or manage your store."
      footer={
        <Typography variant="body2" textAlign="center" color="text.secondary">
          No account?{' '}
          <MuiLink component={Link} href="/signup" fontWeight={600}>
            Create one
          </MuiLink>
        </Typography>
      }
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <TextField
          label="Work email"
          type="email"
          required
          fullWidth
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          required
          fullWidth
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.25 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Demo admin: admin@revest.sa / Admin@123
        </Typography>
      </Stack>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Welcome back" subtitle="Loading sign in...">
          <Stack alignItems="center" py={4}>
            <CircularProgress size={32} />
          </Stack>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
