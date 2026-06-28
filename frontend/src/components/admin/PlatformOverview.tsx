'use client';

import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const customerFlow = ['Browse catalog', 'Add to cart', 'Checkout', 'Track orders'];
const adminFlow = ['Manage products', 'Fulfill orders', 'Manage users', 'Review audit'];
const services = [
  { name: 'Auth Service', port: '3004', db: 'auth_db', scope: 'Users, JWT, audit logs' },
  { name: 'Product Service', port: '3001', db: 'product_db', scope: 'Catalog & inventory' },
  { name: 'Order Service', port: '3003', db: 'order_db', scope: 'Orders & fulfillment' },
];

function FlowStep({ label, isLast }: { label: string; isLast?: boolean }) {
  const theme = useTheme();
  return (
    <>
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          fontWeight: 600,
        }}
      />
      {!isLast && <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
    </>
  );
}

export function PlatformOverview() {
  const theme = useTheme();

  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Application architecture
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        End-to-end retail platform — customer shopping flow, admin operations, and
        microservices backed by PostgreSQL.
      </Typography>

      <Stack spacing={2.5}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Customer journey
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            {customerFlow.map((step, i) => (
              <FlowStep key={step} label={step} isLast={i === customerFlow.length - 1} />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="overline" color="text.secondary">
            Admin operations
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
            {adminFlow.map((step, i) => (
              <FlowStep key={step} label={step} isLast={i === adminFlow.length - 1} />
            ))}
          </Stack>
        </Box>

        <Divider />

        <Stack spacing={1.25}>
          {services.map((svc) => (
            <Box
              key={svc.name}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {svc.name}
                </Typography>
                <Stack direction="row" spacing={0.75}>
                  <Chip size="small" label={`:${svc.port}`} variant="outlined" />
                  <Chip size="small" label={svc.db} variant="outlined" />
                </Stack>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {svc.scope}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
