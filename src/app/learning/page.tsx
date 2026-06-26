'use client'
import { useEffect, useState } from 'react'
import { getLearningInsights, getLearningOptimizations } from '@/lib/api'
import { RefreshCw, Brain, Lightbulb } from 'lucide-react'

export default function LearningPage() {
  const [data, setData] = useState<any>(null)
  const [opts, setOpts] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [d, o] = await Promise.all([getLearningInsights(), getLearningOptimizations()])
      setData(d); setOpts(o)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Unable to load learning data. Please try again.</div>

  // /api/learning/performance response: { success, performance: [...], module_accuracy: [...], count }
  const models = Array.isArray(data?.performance) ? data.performance : []
  const optimizations = Array.isArray(opts?.optimizations) ? opts.optimizations : []

  const fmtPct = (val: any) => {
    if (val == null) return '—'
    const n = Number(val)
    return n <= 1 ? `${Math.round(n * 100)}%` : `${Math.round(n)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Engine</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">AI model performance and continuous improvement</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] text-sm text-[var(--muted-foreground)] transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-indigo-400" />
            <h2 className="font-semibold text-white">Model Performance</h2>
          </div>
          <div className="space-y-3">
            {models.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No model data available</div>
            ) : models.slice(0, 6).map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white capitalize">{(m.model_name || m.name || `Model ${i+1}`).replace(/_/g, ' ')}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{m.model_version || m.evaluation_period || ''}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${Number(m.accuracy_score || m.accuracy || 0) >= 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {fmtPct(m.accuracy_score ?? m.accuracy ?? m.performance_score)}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">{m.total_evaluations ? `${m.total_evaluations} evals` : m.predictions ? `${m.predictions} calls` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-yellow-400" />
            <h2 className="font-semibold text-white">Optimizations</h2>
          </div>
          <div className="space-y-3">
            {optimizations.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No optimization data available</div>
            ) : optimizations.slice(0, 5).map((o: any, i: number) => (
              <div key={i} className="p-3 bg-[var(--muted)] rounded-lg border-l-2 border-yellow-500">
                <div className="text-sm font-medium text-white">{o.title || o.name || `Optimization ${i+1}`}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{o.description || o.insight || o.recommendation || ''}</div>
                {o.impact && <div className="text-xs text-green-400 mt-1">Impact: {o.impact}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
