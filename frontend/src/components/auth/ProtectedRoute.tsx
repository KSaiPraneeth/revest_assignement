'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/login');
    else if (adminOnly && !isAdmin) router.replace('/products');
  }, [user, isLoading, isAdmin, adminOnly, router]);

  if (isLoading || !user || (adminOnly && !isAdmin)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
