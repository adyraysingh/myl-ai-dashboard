'use client'
import { useEffect, useState } from 'react'
import { getConversations } from '@/lib/api'
import { RefreshCw, MessageCircle } from 'lucide-react'

export default function ConversationsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try { setData(await getConversations()) }
    catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Error: {error}</div>

  const items = Array.isArray(data) ? data : data?.conversations ?? data?.leads ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">All AI-managed lead conversations</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Lead</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Channel</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Stage</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Messages</th>
              <th className="text-left p-3 text-[var(--muted-foreground)] font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[var(--muted-foreground)]">No conversations found</td></tr>
            ) : items.map((c:any, i:number) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-blue-400 flex-shrink-0" />
                    <div>
                      <div className="text-[var(--foreground)]">{c.name || c.leadName || c.contact || '—'}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{c.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[var(--muted-foreground)]">{c.channel || c.source || '—'}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.stage === 'closed' || c.stage === 'won' ? 'bg-green-900/40 text-green-400' : c.stage === 'negotiation' || c.stage === 'proposal' ? 'bg-blue-900/40 text-blue-400' : 'bg-yellow-900/40 text-yellow-400'}`}>{c.stage || c.status || 'active'}</span>
                </td>
                <td className="p-3 text-[var(--muted-foreground)]">{c.messageCount ?? c.messages ?? '—'}</td>
                <td className="p-3 text-[var(--muted-foreground)] text-xs">{c.lastActivity || c.updatedAt ? new Date(c.lastActivity || c.updatedAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
