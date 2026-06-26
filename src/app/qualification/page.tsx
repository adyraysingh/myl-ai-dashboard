'use client'
import { useEffect, useState } from 'react'
import { getQualificationQueue } from '@/lib/api'
import { RefreshCw, UserCheck, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function QualificationPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getQualificationQueue()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const items = Array.isArray(data) ? data : data?.queue ?? data?.leads ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Qualification Queue</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI-powered lead qualification and scoring</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Qualified', value: items.filter((i:any) => i.status === 'qualified').length, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Pending', value: items.filter((i:any) => i.status === 'pending' || !i.status).length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Disqualified', value: items.filter((i:any) => i.status === 'disqualified').length, icon: XCircle, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Lead</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Company</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Score</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No qualification data</td></tr>
            ) : items.map((item:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-indigo-400" />
                    <span className="text-[var(--foreground)]">{item.name || item.leadName || item.email || '—'}</span>
                  </div>
                </td>
                <td className="p-3 text-[var(--muted-foreground)]">{item.company || '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{width: `${item.score || 0}%`}} />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{item.score ?? '—'}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'qualified' ? 'bg-green-900/40 text-green-400' : item.status === 'disqualified' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{item.status || 'pending'}</span>
                </td>
                <td className="p-3 text-[var(--muted-foreground)] text-xs">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
