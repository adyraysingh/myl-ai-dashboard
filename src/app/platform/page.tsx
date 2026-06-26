'use client'
import { useEffect, useState } from 'react'
import { getPlatformModules, getQueueStatus, getPlatformIntegrations, getPlatformModels, getPlatformPrompts } from '@/lib/api'
import { RefreshCw } from 'lucide-react'

type PTab = 'modules'|'queues'|'integrations'|'models'|'prompts'

export default function PlatformPage() {
  const [tab, setTab] = useState<PTab>('modules')
  const [data, setData] = useState<Record<string,any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [modules, queues, integrations, models, prompts] = await Promise.all([
        getPlatformModules(), getQueueStatus(), getPlatformIntegrations(), getPlatformModels(), getPlatformPrompts()
      ])
      setData({ modules, queues, integrations, models, prompts })
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Unable to load platform data. Please try again.</div>

  const sb = (status: string) => {
    const s = (status||'').toLowerCase()
    const cls = s==='healthy'||s==='active'||s==='running'||s==='connected' ? 'bg-green-900/40 text-green-400' :
                s==='degraded'||s==='warning'||s==='available' ? 'bg-yellow-900/40 text-yellow-400' :
                'bg-red-900/40 text-red-400'
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{status||'unknown'}</span>
  }

  // Map API field names correctly
  const modules = Array.isArray(data.modules?.modules) ? data.modules.modules :
                  Array.isArray(data.modules) ? data.modules : []
  const queues = Array.isArray(data.queues?.queues) ? data.queues.queues :
                 Array.isArray(data.queues) ? data.queues : []
  const integrations = Array.isArray(data.integrations?.integrations) ? data.integrations.integrations :
                       Array.isArray(data.integrations) ? data.integrations : []
  const models = Array.isArray(data.models?.models) ? data.models.models :
                 Array.isArray(data.models) ? data.models : []
  const prompts = Array.isArray(data.prompts?.prompts) ? data.prompts.prompts :
                  Array.isArray(data.prompts) ? data.prompts : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Health</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Modules, queues, integrations, models and prompts</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="flex gap-2 border-b border-[var(--border)] flex-wrap">
        {(['modules','queues','integrations','models','prompts'] as PTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab===t ? 'border-indigo-500 text-white' : 'border-transparent text-[var(--muted-foreground)] hover:text-white'}`}>{t}</button>
        ))}
      </div>
      {tab==='modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.length===0 ? <div className="text-[var(--muted-foreground)]">No module data</div> : modules.map((m:any,i:number) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white capitalize">{(m.module_name || m.name || `Module ${i+1}`).replace(/_/g,' ')}</div>
                {sb(m.status)}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Calls Today</div><div className="text-sm font-medium text-white">{m.api_calls_today ?? m.calls ?? '—'}</div></div>
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Errors</div><div className="text-sm font-medium text-red-400">{m.errors_today ?? m.errors ?? '—'}</div></div>
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Latency</div><div className="text-sm font-medium text-white">{m.avg_latency_ms ? `${Math.round(m.avg_latency_ms)}ms` : m.latency ? `${m.latency}ms` : '—'}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='queues' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Queue</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Pending</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Running</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Completed</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Failed</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
            </tr></thead>
            <tbody>
              {queues.length===0 ? <tr><td colSpan={6} className="p-6 text-center text-[var(--muted-foreground)]">No queue data</td></tr>
              : queues.map((q:any,i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3 text-[var(--foreground)] capitalize">{(q.queue_name || q.name || `Queue ${i+1}`).replace(/_/g,' ')}</td>
                  <td className="p-3 text-yellow-400">{q.pending_jobs ?? q.pending ?? '—'}</td>
                  <td className="p-3 text-blue-400">{q.running_jobs ?? q.running ?? '—'}</td>
                  <td className="p-3 text-green-400">{q.completed_jobs ?? q.completed ?? '—'}</td>
                  <td className="p-3 text-red-400">{q.failed_jobs ?? q.failed ?? '—'}</td>
                  <td className="p-3">{sb(q.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==='integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.length===0 ? <div className="text-[var(--muted-foreground)]">No integration data</div> : integrations.map((int:any,i:number) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-white capitalize">{(int.integration_name || int.name || `Integration ${i+1}`).replace(/_/g,' ')}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5 capitalize">{(int.integration_type || int.type || '').replace(/_/g,' ')}</div>
                </div>
                {sb(int.status||'unknown')}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs text-[var(--muted-foreground)]">Latency: <span className="text-white">{int.latency_ms ? `${parseFloat(int.latency_ms).toFixed(0)}ms` : '—'}</span></div>
                <div className="text-xs text-[var(--muted-foreground)]">Errors: <span className="text-red-400">{int.error_count ?? '—'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==='models' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Model</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Version</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Total Calls</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Avg Latency</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
            </tr></thead>
            <tbody>
              {models.length===0 ? <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No model data</td></tr>
              : models.map((m:any,i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3 text-[var(--foreground)]">{m.model_name || m.name || m.id || `Model ${i+1}`}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.model_version || m.version || '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.total_calls ?? m.calls ?? '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.avg_latency_ms ? `${Math.round(m.avg_latency_ms)}ms` : '—'}</td>
                  <td className="p-3">{sb(m.status||'active')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab==='prompts' && (
        <div className="space-y-3">
          {prompts.length===0 ? <div className="text-[var(--muted-foreground)]">No prompt data</div> : prompts.map((p:any,i:number) => (
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white capitalize">{(p.prompt_name || p.name || p.promptId || `Prompt ${i+1}`).replace(/_/g,' ')}</div>
                <span className="text-xs text-[var(--muted-foreground)]">{p.version ? `v${p.version}` : ''}</span>
              </div>
              <div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
                {p.module_name && <span>Module: <span className="text-white capitalize">{p.module_name.replace(/_/g,' ')}</span></span>}
                {p.prompt_type && <span>Type: <span className="text-white capitalize">{p.prompt_type.replace(/_/g,' ')}</span></span>}
                {p.active != null && <span>Active: <span className={p.active ? 'text-green-400' : 'text-red-400'}>{p.active ? 'Yes' : 'No'}</span></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
