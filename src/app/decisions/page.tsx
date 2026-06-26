'use client'
import { useEffect, useState } from 'react'
import { getDecisions } from '@/lib/api'
import { RefreshCw, Zap } from 'lucide-react'

export default function DecisionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getDecisions()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const decisions = Array.isArray(data) ? data : data?.decisions ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Decisions</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Autonomous decisions made by Maya AI</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Decision</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Module</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Confidence</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {decisions.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No decisions found</td></tr>
            ) : decisions.map((d:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-[var(--foreground)]">{d.decision || d.action || d.type || 'Unknown'}</span>
                  </div>
                </td>
                <td className="p-3 text-[var(--muted-foreground)]">{d.module || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${(d.confidence || 0) >= 0.8 ? 'bg-green-900/40 text-green-400' : (d.confidence || 0) >= 0.5 ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'}`}>
                    {d.confidence ? `${Math.round(d.confidence * 100)}%` : '—'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'executed' ? 'bg-green-900/40 text-green-400' : d.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>{d.status || '—'}</span>
                </td>
                <td className="p-3 text-[var(--muted-foreground)] text-xs">{d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
