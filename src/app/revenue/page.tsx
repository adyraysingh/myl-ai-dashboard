'use client'
import { useEffect, useState } from 'react'
import { getRevenueForecast, getRevenueScenarios } from '@/lib/api'
import { RefreshCw, TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react'

export default function RevenuePage() {
  const [forecast, setForecast] = useState<any>(null)
  const [scenarios, setScenarios] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const [f, s] = await Promise.all([getRevenueForecast(), getRevenueScenarios()])
      setForecast(f); setScenarios(s)
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>
  if (error) return <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">Unable to load revenue data. Please try again.</div>

  // /api/revenue/forecast response structure
  const daily = forecast?.forecasts?.daily || {}
  const pipeline = forecast?.pipeline_summary || {}
  const scenarioList = Array.isArray(scenarios) ? scenarios : scenarios?.scenarios ?? []

  const fmt = (val: any) => val != null && val !== '' && Number(val) > 0 ? `$${(Number(val)/1000).toFixed(1)}k` : val != null && Number(val) === 0 ? '$0' : '—'

  const metrics = [
    { label: 'Current MRR', value: fmt(daily.mrr_current), icon: DollarSign, color: 'text-green-400' },
    { label: 'Forecast (30d)', value: fmt(daily.mrr_forecast_30d), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Pipeline Value', value: fmt(pipeline.total_pipeline_value), icon: Target, color: 'text-indigo-400' },
    { label: 'At Risk', value: fmt(pipeline.at_risk_value), icon: AlertTriangle, color: 'text-yellow-400' },
  ]

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
          <h2 className="font-semibold text-white mb-4">Revenue Scenarios</h2>
          <div className="space-y-3">
            {scenarioList.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">No scenario data available</div>
            ) : scenarioList.slice(0, 6).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white capitalize">{(s.scenario_type || s.name || `Scenario ${i+1}`).replace(/_/g, ' ')}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.description || `Confidence: ${s.confidence_score ? Math.round(s.confidence_score * 100) + '%' : '—'}`}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{s.optimistic_arr ? fmt(s.optimistic_arr) : s.value ? fmt(s.value) : '—'}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{s.probability ? `${Math.round(s.probability * 100)}% likely` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Forecast Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Daily MRR', value: fmt(daily.mrr_current) },
              { label: 'MRR Forecast 30d', value: fmt(daily.mrr_forecast_30d) },
              { label: 'Total Pipeline', value: fmt(pipeline.total_pipeline_value) },
              { label: 'At Risk', value: fmt(pipeline.at_risk_value) },
              { label: 'Historical Accuracy', value: forecast?.historical_accuracy ? `${Math.round(Number(forecast.historical_accuracy) * 100)}%` : '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
