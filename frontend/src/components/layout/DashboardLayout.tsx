'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const userLinks = [
  { href: '/products', label: 'Catalog' },
  { href: '/cart', label: 'Cart' },
  { href: '/orders', label: 'My Orders' },
];

const adminLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/audit', label: 'Audit' },
];

export function DashboardLayout({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, logout } = useAuth();
  const { totals } = useCart();
  const pathname = usePathname();
  const theme = useTheme();
  const links = admin ? adminLinks : userLinks;

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: alpha(theme.palette.background.paper, 0.92), backdropFilter: 'blur(8px)' }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 64, sm: 72 } }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mr: 1 }}>
            <Box
              component={Link}
              href={admin ? '/admin' : '/products'}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <StorefrontOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>
                Revest
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {admin ? 'Admin Console' : 'Retail Portal'}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              flexGrow: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  size="small"
                  sx={{
                    px: 1.75,
                    borderRadius: 2,
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: active
                        ? alpha(theme.palette.primary.main, 0.14)
                        : alpha(theme.palette.text.primary, 0.04),
                    },
                  }}
                >
                  {link.label}
                  {link.href === '/cart' && totals.itemCount > 0 && (
                    <Chip
                      size="small"
                      label={totals.itemCount}
                      color="secondary"
                      sx={{ ml: 0.75, height: 20, minWidth: 20, '& .MuiChip-label': { px: 0.75 } }}
                    />
                  )}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {!admin && (
              <IconButton
                component={Link}
                href="/cart"
                color="inherit"
                aria-label="Shopping cart"
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <Badge badgeContent={totals.itemCount} color="secondary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            )}
            <Chip
              size="small"
              label={user?.role}
              color={user?.role === 'ADMIN' ? 'primary' : 'default'}
              variant="outlined"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'secondary.main' }}>
                {initials}
              </Avatar>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
                {user?.fullName}
              </Typography>
            </Stack>
            <ThemeToggle />
            <IconButton
              color="inherit"
              onClick={logout}
              aria-label="Logout"
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
            <Button
              size="small"
              color="inherit"
              onClick={logout}
              startIcon={<LogoutOutlinedIcon fontSize="small" />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
}
