'use client'
import { useEffect, useState } from 'react'
import { getPlatformErrors, retryError } from '@/lib/api'
import { RefreshCw, RotateCcw } from 'lucide-react'

export default function ErrorsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [resolving, setResolving] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getPlatformErrors()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }

  async function handleRetry(id: string) {
    setResolving(id)
    try { await retryError(id); await load() }
    catch(e:any) { alert(`Failed to retry: ${e.message}`) }
    setResolving(null)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const errors = Array.isArray(data) ? data : data?.errors ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Monitoring</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Platform errors and retry management</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Module</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Severity</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Message</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Time</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {errors.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-[var(--muted-foreground)]">No errors found</td></tr>
            ) : errors.map((e:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3 text-[var(--foreground)]">{e.module || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${e.severity === 'critical' || e.severity === 'high' ? 'bg-red-900/40 text-red-400' : e.severity === 'medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'}`}>{e.severity || 'low'}</span>
                </td>
                <td className="p-3 text-[var(--foreground)] max-w-xs truncate">{e.message || e.error || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'resolved' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{e.status || 'open'}</span>
                </td>
                <td className="p-3 text-[var(--muted-foreground)] text-xs">{e.createdAt || e.timestamp ? new Date(e.createdAt || e.timestamp).toLocaleString() : '—'}</td>
                <td className="p-3">
                  {e.status !== 'resolved' && (
                    <button onClick={() => handleRetry(e.id || e._id || String(i))} disabled={resolving === (e.id || e._id || String(i))}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded transition-colors text-white">
                      <RotateCcw size={11} />
                      {resolving === (e.id || e._id || String(i)) ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
