'use client'
import { useEffect, useState } from 'react'
import { getWorkflows, getOperationsMetrics } from '@/lib/api'
import { RefreshCw, Settings2 } from 'lucide-react'

export default function OperationsPage() {
  const [workflows, setWorkflows] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [tab, setTab] = useState<'workflows'|'metrics'>('workflows')

  async function load() {
    setLoading(true); setError(null)
    try {
      const [w, m] = await Promise.all([getWorkflows(), getOperationsMetrics()])
      setWorkflows(w); setMetrics(m)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const wfList = Array.isArray(workflows) ? workflows : workflows?.workflows ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Workflows and operational metrics</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="flex gap-2 border-b border-[var(--border)]">
        {(['workflows','metrics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-[var(--muted-foreground)] hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'workflows' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Workflow</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Trigger</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Runs</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Success Rate</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {wfList.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No workflow data</td></tr>
              ) : wfList.map((w:any, i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3"><div className="flex items-center gap-2"><Settings2 size={14} className="text-indigo-400" /><span className="text-[var(--foreground)]">{w.name || 'Unknown'}</span></div></td>
                  <td className="p-3 text-[var(--muted-foreground)]">{w.trigger || '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{w.runs ?? w.executions ?? '—'}</td>
                  <td className="p-3"><span className={`text-xs ${(w.successRate || 0) >= 90 ? 'text-green-400' : (w.successRate || 0) >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{w.successRate ? `${w.successRate}%` : '—'}</span></td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${w.status === 'active' || w.status === 'running' ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{w.status || 'active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'metrics' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics && Object.entries(metrics).filter(([k]) => typeof metrics[k] !== 'object').map(([k,v]:any) => (
            <div key={k} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="text-xs text-[var(--muted-foreground)] mb-1 capitalize">{k.replace(/_/g,' ')}</div>
              <div className="text-xl font-bold text-white">{String(v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
