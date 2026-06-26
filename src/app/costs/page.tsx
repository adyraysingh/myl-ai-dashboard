'use client'
import { useEffect, useState } from 'react'
import { getCostAnalysis } from '@/lib/api'
import { RefreshCw, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

export default function CostsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getCostAnalysis()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const modules = Array.isArray(data) ? data : data?.modules ?? data?.breakdown ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cost Intelligence</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI compute and operational cost analysis</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Cost (MTD)', value: data?.summary?.total || data?.total ? `$${((data?.summary?.total || data?.total)/100).toFixed(2)}` : '—', icon: DollarSign, color: 'text-white' },
          { label: 'vs Last Month', value: data?.summary?.change || data?.change ? `${data?.summary?.change || data?.change}%` : '—', icon: TrendingUp, color: 'text-yellow-400' },
          { label: 'Projected', value: data?.summary?.projected || data?.projected ? `$${((data?.summary?.projected || data?.projected)/100).toFixed(2)}` : '—', icon: TrendingDown, color: 'text-indigo-400' },
        ].map(m => (
          <div key={m.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">{m.label}</span>
              <m.icon size={16} className={m.color} />
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]"><h2 className="font-semibold text-white">Cost by Module</h2></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Module</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">API Calls</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Tokens</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Cost</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {modules.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No cost data available</td></tr>
            ) : modules.map((m:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3 font-medium text-[var(--foreground)]">{m.name || m.module || `Module ${i+1}`}</td>
                <td className="p-3 text-[var(--muted-foreground)]">{m.apiCalls ?? m.calls ?? '—'}</td>
                <td className="p-3 text-[var(--muted-foreground)]">{m.tokens ? m.tokens.toLocaleString() : '—'}</td>
                <td className="p-3 text-white font-medium">{m.cost ? `$${(m.cost/100).toFixed(4)}` : m.amount ? `$${m.amount}` : '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{width: `${m.percentage || 0}%`}} />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{m.percentage ? `${m.percentage}%` : '—'}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
