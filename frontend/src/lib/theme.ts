import { ThemeOptions } from '@mui/material/styles';

const brand = {
  primary: '#0f4c81',
  primaryLight: '#1a6bb5',
  secondary: '#00a896',
  accent: '#f4a261',
};

export function buildThemeOptions(mode: 'light' | 'dark'): ThemeOptions {
  const isLight = mode === 'light';

  return {
    palette: {
      mode,
      primary: {
        main: isLight ? brand.primary : '#60a5fa',
        light: brand.primaryLight,
        dark: '#0a3558',
        contrastText: '#ffffff',
      },
      secondary: {
        main: brand.secondary,
        contrastText: '#ffffff',
      },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: {
        default: isLight ? '#f1f5f9' : '#0b1220',
        paper: isLight ? '#ffffff' : '#111827',
      },
      divider: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.12)',
      text: {
        primary: isLight ? '#0f172a' : '#f8fafc',
        secondary: isLight ? '#64748b' : '#94a3b8',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'var(--font-inter), "Inter", system-ui, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, padding: '8px 18px' },
          contained: { boxShadow: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: isLight ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: isLight
              ? '0 1px 3px rgba(15, 23, 42, 0.04)'
              : '0 4px 12px rgba(0, 0, 0, 0.25)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          outlined: {
            border: isLight ? '1px solid rgba(15, 23, 42, 0.08)' : undefined,
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            color: isLight ? '#475569' : '#94a3b8',
            backgroundColor: isLight ? '#f8fafc' : '#1e293b',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: isLight
              ? '1px solid rgba(15, 23, 42, 0.06)'
              : '1px solid rgba(148, 163, 184, 0.1)',
          },
        },
      },
    },
  };
}
