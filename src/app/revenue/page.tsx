'use client'
import { useEffect, useState } from 'react'
import { getRevenueForecast } from '@/lib/api'
import { RefreshCw, TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react'

export default function RevenuePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getRevenueForecast()) }
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
          <h1 className="text-2xl font-bold text-white">Revenue Intelligence</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI-powered forecasting and scenario analysis</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current MRR', value: data?.current?.mrr ? `$${(data.current.mrr/1000).toFixed(0)}k` : '—', icon: DollarSign, color: 'text-green-400' },
          { label: 'Forecast (30d)', value: data?.forecast?.['30d'] ? `$${(data.forecast['30d']/1000).toFixed(0)}k` : '—', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Pipeline Value', value: data?.pipeline?.total ? `$${(data.pipeline.total/1000).toFixed(0)}k` : '—', icon: Target, color: 'text-indigo-400' },
          { label: 'At Risk', value: data?.risk?.amount ? `$${(data.risk.amount/1000).toFixed(0)}k` : '—', icon: AlertTriangle, color: 'text-yellow-400' },
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Scenarios</h2>
          <div className="space-y-3">
            {data?.scenarios?.map((s:any, i:number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white">{s.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{s.value ? `$${(s.value/1000).toFixed(0)}k` : '—'}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{s.probability ? `${s.probability}%` : ''}</div>
                </div>
              </div>
            )) ?? <div className="text-sm text-[var(--muted-foreground)]">No scenario data</div>}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Top Opportunities</h2>
          <div className="space-y-2">
            {data?.opportunities?.slice(0,6).map((o:any, i:number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--foreground)]">{o.name}</span>
                <span className="text-sm font-medium text-green-400">{o.value ? `$${(o.value/1000).toFixed(0)}k` : '—'}</span>
              </div>
            )) ?? <div className="text-sm text-[var(--muted-foreground)]">No opportunity data</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
