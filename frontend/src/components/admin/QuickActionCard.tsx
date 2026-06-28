'use client';

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  accent?: string;
}

export function QuickActionCard({
  title,
  description,
  href,
  icon,
  accent,
}: QuickActionCardProps) {
  const theme = useTheme();
  const color = accent ?? theme.palette.primary.main;

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                bgcolor: alpha(color, 0.12),
                color,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
