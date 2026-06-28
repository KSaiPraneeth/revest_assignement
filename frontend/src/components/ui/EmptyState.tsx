import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      {icon && (
        <Box sx={{ mb: 2, opacity: 0.6, '& svg': { fontSize: 48 } }}>{icon}</Box>
      )}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ maxWidth: 360, mx: 'auto', mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionLabel && (onAction || actionHref) && (
        actionHref ? (
          <Button component={Link} href={actionHref} variant="contained">
            {actionLabel}
          </Button>
        ) : (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </Box>
  );
}
