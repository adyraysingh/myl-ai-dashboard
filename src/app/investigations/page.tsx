'use client'
import { useEffect, useState } from 'react'
import { getInvestigations } from '@/lib/api'
import { RefreshCw, Search } from 'lucide-react'

export default function InvestigationsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getInvestigations()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const items = Array.isArray(data) ? data : data?.investigations ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Investigations</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI-triggered anomaly and risk investigations</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Investigation</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Type</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Severity</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No investigations found</td></tr>
            ) : items.map((inv:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-[var(--foreground)]">{inv.title || inv.name || inv.description || 'Unknown'}</span>
                  </div>
                </td>
                <td className="p-3 text-[var(--muted-foreground)]">{inv.type || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.severity === 'critical' || inv.severity === 'high' ? 'bg-red-900/40 text-red-400' : inv.severity === 'medium' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'}`}>{inv.severity || 'low'}</span>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${inv.status === 'resolved' ? 'bg-green-900/40 text-green-400' : inv.status === 'open' || inv.status === 'active' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{inv.status || 'open'}</span>
                </td>
                <td className="p-3 text-[var(--muted-foreground)] text-xs">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
