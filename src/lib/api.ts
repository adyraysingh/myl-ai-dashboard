const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://maya-ai-sales-production.up.railway.app';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API error ' + res.status);
  }
  return res.json();
}

export const getPlatformHealth = () => apiFetch('/api/platform/health');
export const getPlatformModules = () => apiFetch('/api/platform/modules');
export const getPlatformQueues = () => apiFetch('/api/platform/queues');
export const getPlatformIntegrations = () => apiFetch('/api/platform/integrations');
export const getPlatformModels = () => apiFetch('/api/platform/models');
export const getPlatformPrompts = () => apiFetch('/api/platform/prompts');
export const getPlatformCosts = () => apiFetch('/api/platform/costs');
export const getPlatformErrors = (params?: Record<string, string>) => { const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch('/api/platform/errors' + qs); };
export const getPlatformConfig = () => apiFetch('/api/platform/config');
export const getPlatformAudit = () => apiFetch('/api/platform/audit');
export const getPlatformDashboard = () => apiFetch('/api/platform/dashboard');
export const getPlatformPerformance = () => apiFetch('/api/platform/performance');
export const setPlatformConfig = (key: string, value: string, performed_by = 'admin') => apiFetch('/api/platform/config', { method: 'POST', body: JSON.stringify({ key, value, performed_by }) });
export const pauseQueue = (queue_name: string) => apiFetch('/api/platform/pause', { method: 'POST', body: JSON.stringify({ queue_name }) });
export const resumeQueue = (queue_name: string) => apiFetch('/api/platform/resume', { method: 'POST', body: JSON.stringify({ queue_name }) });
export const triggerHealthCheck = () => apiFetch('/api/platform/health-check', { method: 'POST', body: JSON.stringify({}) });
export const retryError = (error_id: string) => apiFetch('/api/platform/retry', { method: 'POST', body: JSON.stringify({ error_id }) });
export const getRevenueForecast = () => apiFetch('/api/revenue/forecast');
export const getRevenueForecastByPeriod = (period: string) => apiFetch('/api/revenue/forecast/' + period);
export const getRevenueScenarios = () => apiFetch('/api/revenue/scenarios');
export const getRevenueHistory = () => apiFetch('/api/revenue/history');
export const getRevenueOpportunities = () => apiFetch('/api/revenue/opportunities');
export const getRevenueRisks = () => apiFetch('/api/revenue/risks');
export const getRevenueDashboard = () => apiFetch('/api/revenue/dashboard');
export const recalculateRevenue = (forecast_type?: string) => apiFetch('/api/revenue/recalculate', { method: 'POST', body: JSON.stringify({ forecast_type }) });
export const getWorkflows = () => apiFetch('/api/operations/workflows');
export const getOperationsMetrics = () => apiFetch('/api/operations/metrics');
export const getDecisions = () => apiFetch('/api/decisions');
export const getQualifications = () => apiFetch('/api/qualification/dashboard');
export const getInvestigations = () => apiFetch('/api/investigations');
export const getLearningsummary = () => apiFetch('/api/learning/summary');
export const getLearningPerformance = () => apiFetch('/api/learning/performance');
export const getLearningTrends = () => apiFetch('/api/learning/trends');
export const getLearningOptimizations = () => apiFetch('/api/learning/optimizations');
export const getCopilotSuggestions = () => apiFetch('/api/copilot/suggestions');
export const sendCopilotMessage = (message: string, session_id?: string) => apiFetch('/api/copilot/chat', { method: 'POST', body: JSON.stringify({ message, session_id }) });
export const getExecutiveBriefings = () => apiFetch('/api/executive/briefings');
export const getSalesPerformance = () => apiFetch('/api/sales/performance');
export const getLeads = () => apiFetch('/api/memory/leads');
export const getBusinessSummary = () => apiFetch('/api/memory/summary');

export default apiFetch;
