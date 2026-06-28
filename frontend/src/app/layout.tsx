import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GlobalSnackbar } from '@/components/common/GlobalSnackbar';
import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { AppThemeProvider } from '@/providers/AppThemeProvider';
import { SnackbarProvider } from '@/providers/SnackbarProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Revest Retail Platform',
  description: 'Retail product catalog, ordering, and admin management',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ErrorBoundary>
          <AppThemeProvider>
            <SnackbarProvider>
              <AuthProvider>
                <CartProvider>
                  {children}
                </CartProvider>
              </AuthProvider>
              <GlobalSnackbar />
            </SnackbarProvider>
          </AppThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
