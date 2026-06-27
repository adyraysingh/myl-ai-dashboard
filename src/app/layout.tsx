/**
 * layout.tsx — Phase 1.5K: Fixed root layout (Server Component)
 *
 * Root layout stays as a Server Component to allow metadata export (required by Next.js).
 * AppShell is a separate Client Component that handles auth-protected routing.
 */

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'MYL AI Control Center',
  description: 'Maya AI Sales Platform Control Center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
