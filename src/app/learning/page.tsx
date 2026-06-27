'use client'
import { useEffect, useState, useCallback } from 'react'
import apiFetch from '@/lib/api'
import { RefreshCw, Brain, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, XCircle, Clock, BarChart2, Zap, Award } from 'lucide-react'

interface DashboardData {
  summary?: any
  performance?: any[]
  accuracy_by_module?: any[]
  calibration?: any[]
  prompt_versions?: any[]
  cycle_history?: any[]
  forecast_evaluations?: any[]
  copilot_quality?: any[]
  recommendation_effectiveness?: any[]
  snapshot_history?: any[]
  trends?: any[]
  optimizations?: any[]
  retrieved_at?: string
}

function StatCard({ label, value, sub, color = 'indigo', icon: Icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: any }) {
  const colors: Record<string, string> = {
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    green: 'border-green-500/30 bg-green-500/10 text-green-400',
    yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    red: 'border-red-500/30 bg-red-500/10 text-red-400',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color] || colors.indigo}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 opacity-70" />}
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) {
  return (
    <div className="border border-slate-700/50 rounded-xl p-5 bg-slate-800/40">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function pct(v: any) { return v != null ? (parseFloat(v) * 100).toFixed(1) + '%' : '—' }
function num(v: any, d = 2) { return v != null ? parseFloat(v).toFixed(d) : '—' }
function na(v: any) { return v != null && v !== '' ? v : '—' }

export default function LearningPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>('')
  const [cycling, setCycling] = useState(false)
  const [cycleMsg, setCycleMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const d = await apiFetch('/api/learning/dashboard')
      setData(d)
      setLastRefresh(new Date().toLocaleTimeString())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function triggerCycle(type: string) {
    setCycling(true); setCycleMsg('')
    try {
      await apiFetch('/api/learning/cycle', { method: 'POST', body: JSON.stringify({ cycle_type: type }) })
      setCycleMsg(type + ' cycle triggered — refreshing in 3s')
      setTimeout(() => { load(); setCycleMsg('') }, 3000)
    } catch (e: any) { setCycleMsg('Error: ' + e.message) }
    finally { setCycling(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  )
  if (error) return (
    <div className="text-red-400 p-4 bg-red-900/20 rounded-lg m-4">Error: {error}</div>
  )

  const acc = data?.accuracy_by_module || []
  const cal = data?.calibration || []
  const prompts = data?.prompt_versions || []
  const cycles = data?.cycle_history || []
  const forecasts = data?.forecast_evaluations || []
  const copilot = data?.copilot_quality || []
  const recs = data?.recommendation_effectiveness || []
  const snapshots = data?.snapshot_history || []
  const summary = data?.summary || {}

  // Compute overall accuracy
  const validAcc = acc.filter((m: any) => m.accuracy != null)
  const overallAccuracy = validAcc.length > 0
    ? (validAcc.reduce((s: number, m: any) => s + parseFloat(m.accuracy || 0), 0) / validAcc.length * 100).toFixed(1)
    : '—'

  // Overall FP / FN
  const totalFP = acc.reduce((s: number, m: any) => s + parseInt(m.false_positives || 0), 0)
  const totalFN = acc.reduce((s: number, m: any) => s + parseInt(m.false_negatives || 0), 0)
  const totalPreds = acc.reduce((s: number, m: any) => s + parseInt(m.total_predictions || 0), 0)

  // Avg calibration error
  const avgCalError = cal.length > 0
    ? (cal.reduce((s: number, c: any) => s + parseFloat(c.calibration_error || 0), 0) / cal.length * 100).toFixed(1)
    : '—'

  // Last cycle
  const lastCycle = cycles[0]
  const lastForecast = forecasts[0]
  const lastCopilot = copilot[0]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Learning Engine</h1>
            <p className="text-xs text-slate-500">Continuous AI improvement — live data only</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && <span className="text-xs text-slate-500">Updated {lastRefresh}</span>}
          <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* 1. Overall AI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Overall Accuracy" value={overallAccuracy !== '—' ? overallAccuracy + '%' : '—'} sub={"across " + acc.length + " modules"} color="green" icon={Target} />
        <StatCard label="Active Modules" value={acc.length || '—'} color="indigo" icon={Brain} />
        <StatCard label="False Positives" value={totalPreds > 0 ? ((totalFP/totalPreds)*100).toFixed(1)+'%' : '—'} sub={totalFP + " total"} color="red" icon={XCircle} />
        <StatCard label="False Negatives" value={totalPreds > 0 ? ((totalFN/totalPreds)*100).toFixed(1)+'%' : '—'} sub={totalFN + " total"} color="yellow" icon={AlertTriangle} />
        <StatCard label="Calibration Error" value={avgCalError !== '—' ? avgCalError + '%' : '—'} sub={cal.length + " calibrations"} color="purple" icon={BarChart2} />
        <StatCard label="Forecast MAPE" value={lastForecast?.revenue_mape != null ? (parseFloat(lastForecast.revenue_mape)*100).toFixed(1)+'%' : '—'} sub="last evaluation" color="blue" icon={TrendingUp} />
      </div>

      {/* 2. Accuracy by Module */}
      <Section title="Accuracy by Module" icon={Target}>
        {acc.length === 0 ? (
          <p className="text-slate-500 text-sm">No accuracy data yet — predictions need outcomes to calculate accuracy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Module</th>
                  <th className="text-right py-2 pr-4">Predictions</th>
                  <th className="text-right py-2 pr-4">Accuracy</th>
                  <th className="text-right py-2 pr-4">Precision</th>
                  <th className="text-right py-2 pr-4">Recall</th>
                  <th className="text-right py-2 pr-4">FP</th>
                  <th className="text-right py-2">FN</th>
                </tr>
              </thead>
              <tbody>
                {acc.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="py-2 pr-4 font-medium text-indigo-300">{m.module}</td>
                    <td className="text-right py-2 pr-4 text-slate-300">{na(m.total_predictions)}</td>
                    <td className="text-right py-2 pr-4">
                      <span className={`font-semibold ${parseFloat(m.accuracy||0) >= 0.7 ? 'text-green-400' : parseFloat(m.accuracy||0) >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {pct(m.accuracy)}
                      </span>
                    </td>
                    <td className="text-right py-2 pr-4 text-slate-300">{pct(m.precision_score)}</td>
                    <td className="text-right py-2 pr-4 text-slate-300">{pct(m.recall_score)}</td>
                    <td className="text-right py-2 pr-4 text-red-400">{na(m.false_positives)}</td>
                    <td className="text-right py-2 text-yellow-400">{na(m.false_negatives)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 3. Confidence Calibration */}
      <Section title="Confidence Calibration" icon={BarChart2}>
        {cal.length === 0 ? (
          <p className="text-slate-500 text-sm">No calibration data yet — scheduler runs automatically.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Module</th>
                  <th className="text-right py-2 pr-4">Bucket</th>
                  <th className="text-right py-2 pr-4">Stated Confidence</th>
                  <th className="text-right py-2 pr-4">Actual Accuracy</th>
                  <th className="text-right py-2 pr-4">Calib. Error</th>
                  <th className="text-right py-2">Factor</th>
                </tr>
              </thead>
              <tbody>
                {cal.slice(0, 15).map((c: any, i: number) => {
                  const err = parseFloat(c.calibration_error || 0)
                  return (
                    <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="py-2 pr-4 text-indigo-300">{c.module}</td>
                      <td className="text-right py-2 pr-4 text-slate-400">{c.confidence_bucket}</td>
                      <td className="text-right py-2 pr-4 text-slate-300">{(parseFloat(c.confidence_bucket || '0') * 100).toFixed(0)}%</td>
                      <td className="text-right py-2 pr-4 text-slate-300">{pct(c.actual_accuracy)}</td>
                      <td className={`text-right py-2 pr-4 font-medium ${err > 0.15 ? 'text-red-400' : err > 0.08 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {(err * 100).toFixed(1)}%
                      </td>
                      <td className="text-right py-2 text-slate-400">{num(c.calibration_factor)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 4. Prompt Performance */}
      <Section title="Prompt Performance" icon={Zap}>
        {prompts.length === 0 ? (
          <p className="text-slate-500 text-sm">No prompt versions found — seeded versions will appear after first cycle.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Module</th>
                  <th className="text-left py-2 pr-4">Version</th>
                  <th className="text-right py-2 pr-4">Calls</th>
                  <th className="text-right py-2 pr-4">Avg Accuracy</th>
                  <th className="text-right py-2 pr-4">Avg Confidence</th>
                  <th className="text-right py-2 pr-4">Latency (ms)</th>
                  <th className="text-right py-2">Active</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="py-2 pr-4 text-indigo-300">{p.module}</td>
                    <td className="py-2 pr-4 text-slate-400 font-mono text-xs">{p.version_tag}</td>
                    <td className="text-right py-2 pr-4 text-slate-300">{na(p.call_count)}</td>
                    <td className="text-right py-2 pr-4 text-slate-300">{p.avg_accuracy != null ? (parseFloat(p.avg_accuracy)*100).toFixed(1)+'%' : '—'}</td>
                    <td className="text-right py-2 pr-4 text-slate-300">{p.avg_confidence != null ? (parseFloat(p.avg_confidence)*100).toFixed(1)+'%' : '—'}</td>
                    <td className="text-right py-2 pr-4 text-slate-400">{p.avg_latency_ms != null ? parseFloat(p.avg_latency_ms).toFixed(0) : '—'}</td>
                    <td className="text-right py-2">
                      {p.is_active ? <CheckCircle className="w-4 h-4 text-green-400 ml-auto" /> : <XCircle className="w-4 h-4 text-slate-600 ml-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 5+6. Revenue Forecast Evaluation & Recommendation Effectiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Revenue Forecast Evaluation" icon={TrendingUp}>
          {forecasts.length === 0 ? (
            <p className="text-slate-500 text-sm">No forecast evaluations yet — submit via POST /api/learning/forecast-eval</p>
          ) : (
            <div className="space-y-2">
              {forecasts.slice(0, 5).map((f: any, i: number) => (
                <div key={i} className="border border-slate-700/30 rounded-lg p-3 hover:bg-slate-700/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-slate-400">{f.period_type} · {f.period_start?.slice(0,10)}</div>
                      <div className="text-sm text-white font-medium mt-1">
                        Forecast: ${parseFloat(f.predicted_revenue||0).toLocaleString()} → Actual: ${parseFloat(f.actual_revenue||0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${parseFloat(f.accuracy_pct||0) >= 80 ? 'text-green-400' : parseFloat(f.accuracy_pct||0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {num(f.accuracy_pct)}% acc
                      </div>
                      <div className="text-xs text-slate-400">MAPE {f.revenue_mape != null ? (parseFloat(f.revenue_mape)*100).toFixed(1)+'%' : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recommendation Effectiveness" icon={Award}>
          {recs.length === 0 ? (
            <p className="text-slate-500 text-sm">No recommendation outcomes yet — logged when recommendations are acted on.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-slate-700">
                    <th className="text-left py-2 pr-4">Module</th>
                    <th className="text-right py-2 pr-4">Total</th>
                    <th className="text-right py-2 pr-4">Accepted</th>
                    <th className="text-right py-2 pr-4">Rejected</th>
                    <th className="text-right py-2">Ignored</th>
                  </tr>
                </thead>
                <tbody>
                  {recs.slice(0,8).map((r: any, i: number) => (
                    <tr key={i} className="border-b border-slate-700/30">
                      <td className="py-2 pr-4 text-indigo-300">{r.module}</td>
                      <td className="text-right py-2 pr-4 text-slate-300">{na(r.total)}</td>
                      <td className="text-right py-2 pr-4 text-green-400">{na(r.accepted)}</td>
                      <td className="text-right py-2 pr-4 text-red-400">{na(r.rejected)}</td>
                      <td className="text-right py-2 text-yellow-400">{na(r.ignored)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* 7. Copilot Quality */}
      <Section title="CEO Copilot Quality" icon={Brain}>
        {copilot.length === 0 ? (
          <p className="text-slate-500 text-sm">No copilot quality snapshots yet — generated weekly by scheduler.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {copilot.slice(0,4).map((c: any, i: number) => (
              <div key={i} className="border border-slate-700/30 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-2">{c.period_start?.slice(0,10)} – {c.period_end?.slice(0,10)}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Sessions</span><span className="text-white">{na(c.total_sessions)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Helpful</span><span className="text-green-400">{c.helpfulness_rate != null ? (parseFloat(c.helpfulness_rate)*100).toFixed(0)+'%' : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Thumbs ▲</span><span className="text-green-400">{na(c.thumbs_up)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Thumbs ▼</span><span className="text-red-400">{na(c.thumbs_down)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Resolved</span><span className="text-indigo-400">{na(c.issues_resolved)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 8. Model Drift + Learning Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Model Drift & Learning Trend" icon={TrendingDown}>
          {snapshots.length < 2 ? (
            <p className="text-slate-500 text-sm">Not enough snapshot history yet — drift calculated after 2+ daily cycles.</p>
          ) : (
            <div className="space-y-2">
              {snapshots.slice(0, 8).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-700/30 py-2">
                  <div className="text-xs text-slate-400">{s.snapshot_date || s.created_at?.slice(0,10)}</div>
                  <div className="flex gap-4 text-xs">
                    {s.avg_accuracy != null && <span className="text-green-400">{(parseFloat(s.avg_accuracy)*100).toFixed(1)}% acc</span>}
                    {s.total_events != null && <span className="text-slate-400">{s.total_events} events</span>}
                    {s.avg_confidence != null && <span className="text-indigo-400">{(parseFloat(s.avg_confidence)*100).toFixed(1)}% conf</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="AI Improvement Over Time" icon={TrendingUp}>
          {snapshots.length < 2 ? (
            <p className="text-slate-500 text-sm">Trend data builds over time as the scheduler runs daily cycles.</p>
          ) : (
            <div className="relative">
              <div className="space-y-1">
                {snapshots.slice(0, 10).reverse().map((s: any, i: number, arr: any[]) => {
                  const acc2 = parseFloat(s.avg_accuracy || 0) * 100
                  const maxAcc = Math.max(...arr.map((x: any) => parseFloat(x.avg_accuracy || 0) * 100))
                  const width = maxAcc > 0 ? (acc2 / maxAcc * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-slate-500 w-20 flex-shrink-0">{s.snapshot_date?.slice(5) || s.created_at?.slice(5,10)}</div>
                      <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: width + '%' }} />
                      </div>
                      <div className="text-xs text-indigo-300 w-12 text-right">{acc2.toFixed(1)}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* 9. Learning Cycle Status */}
      <Section title="Automatic Learning Cycle" icon={Clock}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {['daily', 'weekly', 'monthly'].map(type => (
              <button
                key={type}
                onClick={() => triggerCycle(type)}
                disabled={cycling}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors capitalize"
              >
                Run {type} Cycle
              </button>
            ))}
          </div>
          {cycleMsg && <div className="text-sm text-indigo-300 bg-indigo-900/20 rounded-lg px-3 py-2">{cycleMsg}</div>}
          {cycles.length === 0 ? (
            <p className="text-slate-500 text-sm">No cycle history yet — first run executes automatically 5 minutes after server start.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs border-b border-slate-700">
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2 pr-4">Started</th>
                    <th className="text-right py-2 pr-4">Duration</th>
                    <th className="text-right py-2">Evaluated</th>
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="py-2 pr-4 text-indigo-300 capitalize">{c.cycle_type}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${c.status === 'completed' ? 'bg-green-900/30 text-green-400' : c.status === 'failed' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="text-right py-2 pr-4 text-slate-400 text-xs">{c.started_at ? new Date(c.started_at).toLocaleString() : '—'}</td>
                      <td className="text-right py-2 pr-4 text-slate-400">{c.duration_ms != null ? (c.duration_ms/1000).toFixed(1)+'s' : '—'}</td>
                      <td className="text-right py-2 text-slate-400">{na(c.predictions_evaluated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Section>

      {/* 10. Optimization Suggestions */}
      {data?.optimizations && data.optimizations.length > 0 && (
        <Section title="AI Optimization Suggestions" icon={Zap}>
          <div className="space-y-3">
            {data.optimizations.slice(0, 5).map((opt: any, i: number) => (
              <div key={i} className="border border-slate-700/30 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-indigo-400 uppercase tracking-wider">{opt.module || opt.category}</span>
                    <p className="text-sm text-slate-200 mt-1">{opt.suggestion || opt.description}</p>
                  </div>
                  {opt.impact && (
                    <span className={`text-xs px-2 py-0.5 rounded ml-3 flex-shrink-0 ${opt.impact === 'high' ? 'bg-red-900/30 text-red-400' : opt.impact === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                      {opt.impact}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="text-xs text-slate-600 text-center">
        Learning Engine Phase 3 · All data live from /api/learning/dashboard · {data?.retrieved_at ? new Date(data.retrieved_at).toLocaleString() : ''}
      </div>
    </div>
  )
}
