'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ShieldAlert, LogIn, Eye, EyeOff } from 'lucide-react';
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (!isLoading && isAuthenticated) router.push('/'); }, [isAuthenticated, isLoading, router]);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSubmitting(true);
    try { const r = await login(email, password); if (r.success) { router.push('/'); } else { setError(r.error || 'Invalid credentials'); } }
    catch { setError('Network error.'); } finally { setSubmitting(false); }
  }
  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3"><ShieldAlert size={24} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Maya AI</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Sales Platform Control Center</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-900/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="you@makeyourlabel.com" className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white" tabIndex={-1}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" disabled={submitting || !email || !password} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm mt-2">
              {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><LogIn size={16} /> Sign in</>}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">MakeYourLabel AI Platform - Authorized users only</p>
      </div>
    </div>
  );
}
