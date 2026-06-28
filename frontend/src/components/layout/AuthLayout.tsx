'use client';

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          background: (t) =>
            t.palette.mode === 'light'
              ? 'linear-gradient(135deg, #0f4c81 0%, #1a6bb5 50%, #00a896 100%)'
              : 'linear-gradient(135deg, #0b1220 0%, #0f4c81 100%)',
          color: '#fff',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>
          REVEST SOLUTIONS
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ mt: 1, maxWidth: 420, lineHeight: 1.2 }}>
          Retail operations, reimagined
        </Typography>
        <Typography sx={{ mt: 2, maxWidth: 400, opacity: 0.9, lineHeight: 1.7 }}>
          Manage products, place orders, and track fulfillment — built for modern GCC retail teams.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6 },
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
          {footer && <Box sx={{ mt: 3 }}>{footer}</Box>}
        </Box>
      </Box>
    </Box>
  );
}
