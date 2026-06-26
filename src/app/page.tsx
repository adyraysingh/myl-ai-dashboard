'use client'
import { useEffect, useState } from 'react'
import { getDashboard, getQueueStatus, getModuleHealth } from '@/lib/api'
import { RefreshCw, TrendingUp, Users, DollarSign, Zap, Activity, AlertCircle } from 'lucide-react'

export default function CEODashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [queues, setQueues] = useState<any>(null)
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [d, q, h] = await Promise.all([getDashboard(), getQueueStatus(), getModuleHealth()])
      setDashboard(d); setQueues(q); setHealth(h)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  )
  if (error) return (
    <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Unable to load dashboard. Please try again.</div>
  )

  // getDashboard now calls /api/executive/summary
  // response: { success, summary: { total_leads, hot_leads, warm_leads, ... } }
  const summary = dashboard?.summary || {}

  const metrics = [
    { label: 'Total Leads', value: summary.total_leads != null ? String(summary.total_leads) : '—', icon: Users, color: 'text-blue-400' },
    { label: 'Hot Leads', value: summary.hot_leads != null ? String(summary.hot_leads) : '—', icon: TrendingUp, color: 'text-green-400' },
    { label: 'AI Decisions Today', value: summary.critical_decisions_pending != null ? String(summary.critical_decisions_pending) : '—', icon: Zap, color: 'text-yellow-400' },
    { label: 'Active Investigations', value: summary.active_investigations != null ? String(summary.active_investigations) : '—', icon: DollarSign, color: 'text-indigo-400' },
  ]

  // getModuleHealth now calls /api/platform/modules
  // response: { success, modules: [{ module_name, status, health_score, ... }] }
  const modules = Array.isArray(health) ? health : health?.modules ?? []

  // getQueueStatus calls /api/platform/queues
  // response: { success, queues: [{ queue_name, pending_jobs, status, ... }] }
  const queueList = Array.isArray(queues) ? queues : queues?.queues ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">CEO Dashboard</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Maya AI Sales Platform — Real-time overview</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
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
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Module Health</h2>
          </div>
          <div className="space-y-2">
            {modules.length > 0 ? modules.slice(0, 8).map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--foreground)]">{m.module_name || m.name || `Module ${i+1}`}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  (m.status||'').toLowerCase() === 'healthy' ? 'bg-green-900/40 text-green-400' :
                  (m.status||'').toLowerCase() === 'degraded' ? 'bg-yellow-900/40 text-yellow-400' :
                  'bg-red-900/40 text-red-400'}`}>{m.status || 'unknown'}</span>
              </div>
            )) : <div className="text-sm text-[var(--muted-foreground)]">No module data</div>}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-yellow-400" />
            <h2 className="font-semibold text-white">Queue Status</h2>
          </div>
          <div className="space-y-2">
            {queueList.length > 0 ? queueList.slice(0, 8).map((q: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--foreground)]">{q.queue_name || q.name || `Queue ${i+1}`}</span>
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span>{q.pending_jobs ?? q.pending ?? 0} pending</span>
                  <span className={`px-2 py-0.5 rounded-full ${q.status === 'running' ? 'bg-green-900/40 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{q.status}</span>
                </div>
              </div>
            )) : <div className="text-sm text-[var(--muted-foreground)]">No queue data</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
