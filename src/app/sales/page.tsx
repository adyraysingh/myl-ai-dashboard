'use client'
import { useEffect, useState } from 'react'
import { getSalesPerformance } from '@/lib/api'
import { RefreshCw, BarChart2, TrendingUp, DollarSign, Users } from 'lucide-react'

export default function SalesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getSalesPerformance()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Performance</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI-driven sales metrics and executive briefings</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Closed Won', value: data?.metrics?.closedWon ?? data?.closedWon ?? '—', icon: DollarSign, color: 'text-green-400' },
          { label: 'Active Pipeline', value: data?.metrics?.activePipeline ?? data?.pipeline ?? '—', icon: BarChart2, color: 'text-blue-400' },
          { label: 'Win Rate', value: data?.metrics?.winRate ? `${data.metrics.winRate}%` : '—', icon: TrendingUp, color: 'text-indigo-400' },
          { label: 'Active Reps', value: data?.metrics?.activeReps ?? data?.reps ?? '—', icon: Users, color: 'text-yellow-400' },
        ].map(m => (
          <div key={m.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="text-2xl font-bold text-white">{String(m.value)}</div>
          </div>
        ))}
      </div>
      {data?.briefings?.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Executive Briefings</h2>
          <div className="space-y-3">
            {data.briefings.map((b:any, i:number) => (
              <div key={i} className="p-3 bg-[var(--muted)] rounded-lg border-l-2 border-indigo-500">
                <div className="text-sm font-medium text-white">{b.title || b.subject || `Briefing ${i+1}`}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{b.summary || b.content || ''}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-2">{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
