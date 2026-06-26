'use client'
import { useEffect, useState } from 'react'
import { getPlatformConfig, setPlatformConfig, getPlatformAudit } from '@/lib/api'
import { RefreshCw, Save, Shield } from 'lucide-react'

export default function ConfigPage() {
  const [config, setConfig] = useState<any[]>([])
  const [audit, setAudit] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [tab, setTab] = useState<'config'|'audit'>('config')
  const [saving, setSaving] = useState<string|null>(null)
  const [editVals, setEditVals] = useState<Record<string,string>>({})

  async function load() {
    setLoading(true); setError(null)
    try {
      const [c, a] = await Promise.all([getPlatformConfig(), getPlatformAudit()])
      const configArr = Array.isArray(c) ? c : c?.config ?? c?.settings ?? Object.entries(c||{}).map(([k,v]) => ({key:k, value:v}))
      const auditArr = Array.isArray(a) ? a : a?.audit ?? a?.logs ?? []
      setConfig(configArr); setAudit(auditArr)
      const vals: Record<string,string> = {}
      configArr.forEach((item:any) => { vals[item.key || item.name] = String(item.value ?? '') })
      setEditVals(vals)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }

  async function handleSave(key: string) {
    setSaving(key)
    try { await setPlatformConfig(key, editVals[key]); await load() }
    catch(e:any) { alert(`Save failed: ${e.message}`) }
    setSaving(null)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuration</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Platform settings and audit trail</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="flex gap-2 border-b border-[var(--border)]">
        {(['config','audit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-[var(--muted-foreground)] hover:text-white'}`}>
            {t === 'config' ? 'Configuration' : 'Audit Trail'}
          </button>
        ))}
      </div>
      {tab === 'config' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Key</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Value</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Description</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {config.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-[var(--muted-foreground)]">No configuration data</td></tr>
              ) : config.map((item:any, i:number) => {
                const k = item.key || item.name || String(i)
                return (
                  <tr key={k} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-3 font-mono text-indigo-300 text-xs">{k}</td>
                    <td className="p-3">
                      <input value={editVals[k] ?? ''} onChange={e => setEditVals(prev => ({...prev, [k]: e.target.value}))}
                        className="w-full px-2 py-1 bg-[var(--muted)] border border-[var(--border)] rounded text-xs text-[var(--foreground)] focus:outline-none focus:border-indigo-500" />
                    </td>
                    <td className="p-3 text-[var(--muted-foreground)] text-xs">{item.description || '—'}</td>
                    <td className="p-3">
                      <button onClick={() => handleSave(k)} disabled={saving === k}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded text-white transition-colors">
                        <Save size={11} />{saving === k ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'audit' && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Action</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">User</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Resource</th>
                <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {audit.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-[var(--muted-foreground)]">No audit records</td></tr>
              ) : audit.map((a:any, i:number) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                  <td className="p-3"><div className="flex items-center gap-2"><Shield size={14} className="text-indigo-400" /><span className="text-[var(--foreground)]">{a.action || a.event || '—'}</span></div></td>
                  <td className="p-3 text-[var(--muted-foreground)]">{a.user || a.actor || a.userId || '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{a.resource || a.target || '—'}</td>
                  <td className="p-3 text-[var(--muted-foreground)] text-xs">{a.createdAt || a.timestamp ? new Date(a.createdAt || a.timestamp).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
