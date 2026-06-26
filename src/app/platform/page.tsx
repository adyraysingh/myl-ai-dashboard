'use client'
import { useEffect, useState } from 'react'
import { getModuleHealth, getQueueStatus, getPlatformIntegrations, getPlatformModels, getPlatformPrompts } from '@/lib/api'
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
        getModuleHealth(), getQueueStatus(), getPlatformIntegrations(), getPlatformModels(), getPlatformPrompts()
      ])
      setData({ modules, queues, integrations, models, prompts })
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const sb = (status: string) => {
    const s = (status||'').toLowerCase()
    const cls = s==='healthy'||s==='active'||s==='running'||s==='connected' ? 'bg-green-900/40 text-green-400' : s==='degraded'||s==='warning' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-red-900/40 text-red-400'
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{status||'unknown'}</span>
  }

  const modules = Array.isArray(data.modules) ? data.modules : data.modules?.modules ?? []
  const queues = Array.isArray(data.queues) ? data.queues : data.queues?.queues ?? []
  const integrations = Array.isArray(data.integrations) ? data.integrations : data.integrations?.integrations ?? []
  const models = Array.isArray(data.models) ? data.models : data.models?.models ?? []
  const prompts = Array.isArray(data.prompts) ? data.prompts : data.prompts?.prompts ?? []

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
              <div className="flex items-center justify-between mb-2"><div className="font-medium text-white">{m.name||`Module ${i+1}`}</div>{sb(m.status)}</div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Calls</div><div className="text-sm font-medium text-white">{m.calls??m.requests??'—'}</div></div>
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Errors</div><div className="text-sm font-medium text-red-400">{m.errors??'—'}</div></div>
                <div className="text-center"><div className="text-xs text-[var(--muted-foreground)]">Latency</div><div className="text-sm font-medium text-white">{m.latency?`${m.latency}ms`:'—'}</div></div>
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
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Processing</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Completed</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
            </tr></thead>
            <tbody>
              {queues.length===0 ? <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No queue data</td></tr>
              : queues.map((q:any,i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3 text-[var(--foreground)]">{q.name||`Queue ${i+1}`}</td>
                  <td className="p-3 text-yellow-400">{q.pending??q.waiting??'—'}</td>
                  <td className="p-3 text-blue-400">{q.processing??q.active??'—'}</td>
                  <td className="p-3 text-green-400">{q.completed??q.done??'—'}</td>
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
            <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between">
              <div><div className="font-medium text-white">{int.name||int.provider||`Integration ${i+1}`}</div><div className="text-xs text-[var(--muted-foreground)] mt-0.5">{int.type||int.service||''}</div></div>
              {sb(int.status||'unknown')}
            </div>
          ))}
        </div>
      )}
      {tab==='models' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Model</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Provider</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Calls</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Avg Latency</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Status</th>
            </tr></thead>
            <tbody>
              {models.length===0 ? <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No model data</td></tr>
              : models.map((m:any,i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3 text-[var(--foreground)]">{m.name||m.model||m.id||`Model ${i+1}`}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.provider||'—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.calls??m.totalCalls??'—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{m.avgLatency?`${m.avgLatency}ms`:'—'}</td>
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
              <div className="flex items-center justify-between mb-2"><div className="font-medium text-white">{p.name||p.promptId||p.id||`Prompt ${i+1}`}</div><span className="text-xs text-[var(--muted-foreground)]">{p.version?`v${p.version}`:''}</span></div>
              {p.content && <div className="text-xs text-[var(--muted-foreground)] font-mono bg-[var(--muted)] p-2 rounded mt-2 max-h-20 overflow-y-auto">{p.content}</div>}
              <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                {p.module && <span>Module: {p.module}</span>}{p.uses && <span>Uses: {p.uses}</span>}{p.updatedAt && <span>Updated: {new Date(p.updatedAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
