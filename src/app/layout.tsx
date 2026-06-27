'use client';
/**
 * layout.tsx — Phase 1.5H: Auth-integrated root layout
 *
 * Wraps the entire app in AuthProvider.
 * Protected shell: shows Sidebar only when authenticated.
 * Login page (/login) renders without Sidebar.
 */

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const metadata: Metadata = {
  title: 'MYL AI Control Center',
  description: 'Maya AI Sales Platform Control Center',
};

// Protected shell: redirects to /login if not authenticated
function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Login page: full-screen, no sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading: show spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Unauthenticated: render nothing while redirect fires
  if (!isAuthenticated) return null;

  // Authenticated: full dashboard with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
        {children}
      </main>
    </div>
  );
}

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
