'use client';
/**
 * AppShell.tsx — Phase 1.5J: Extract AppShell to separate client component
 *
 * Handles auth-protected routing.
 * Separated from layout.tsx so that layout.tsx can remain a Server Component
 * and export metadata (required by Next.js).
 */

import { useAuth } from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Protected shell: redirects to /login if not authenticated
export default function AppShell({ children }: { children: React.ReactNode }) {
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
