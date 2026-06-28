import type { Metadata } from 'next';
import { AppThemeProvider } from '@/components/AppThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Revest Dynamic Signup Form',
  description:
    'JSON-driven signup form with dynamic field rendering using Next.js, MUI, and React Hook Form',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
