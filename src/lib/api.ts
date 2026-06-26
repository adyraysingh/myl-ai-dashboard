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

// Platform
export const getPlatformHealth = () => apiFetch('/api/platform/health');
export const getModuleHealth = () => apiFetch('/api/platform/modules');
export const getPlatformModules = () => apiFetch('/api/platform/modules');
export const getQueueStatus = () => apiFetch('/api/platform/queues');
export const getPlatformQueues = () => apiFetch('/api/platform/queues');
export const getPlatformIntegrations = () => apiFetch('/api/platform/integrations');
export const getPlatformModels = () => apiFetch('/api/platform/models');
export const getPlatformPrompts = () => apiFetch('/api/platform/prompts');
export const getPlatformCosts = () => apiFetch('/api/platform/costs');
export const getPlatformErrors = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch('/api/platform/errors' + qs);
};
export const getPlatformConfig = () => apiFetch('/api/platform/config');
export const getPlatformAudit = () => apiFetch('/api/platform/audit');
export const getPlatformDashboard = () => apiFetch('/api/platform/dashboard');
export const getDashboard = () => apiFetch('/api/executive/summary');
export const setPlatformConfig = (key: string, value: string, performed_by = 'admin') =>
  apiFetch('/api/platform/config', { method: 'POST', body: JSON.stringify({ key, value, performed_by }) });
export const retryError = (error_id: string) =>
  apiFetch('/api/platform/errors/' + error_id + '/retry', { method: 'POST', body: JSON.stringify({ error_id }) });

// Revenue
export const getRevenueForecast = () => apiFetch('/api/revenue/forecast');
export const getRevenueScenarios = () => apiFetch('/api/revenue/scenarios');

// Operations
export const getWorkflows = () => apiFetch('/api/operations/workflows');
export const getOperationsMetrics = () => apiFetch('/api/operations/metrics');

// Sales & Leads
export const getDecisions = () => apiFetch('/api/decisions');
export const getQualificationQueue = () => apiFetch('/api/qualification');
export const getInvestigations = () => apiFetch('/api/investigations');
export const getConversations = () => apiFetch('/api/conversations');
export const getSalesPerformance = () => apiFetch('/api/sales/performance');
export const getExecutiveSummary = () => apiFetch('/api/executive/summary');
export const getExecutiveBriefing = () => apiFetch('/api/executive/briefing');

// Learning
export const getLearningInsights = () => apiFetch('/api/learning/performance');
export const getLearningOptimizations = () => apiFetch('/api/learning/optimizations');
export const getCostAnalysis = () => apiFetch('/api/platform/costs');

// Copilot — backend expects { question }, not { message }
export const sendCopilotMessage = (question: string, session_id?: string) =>
  apiFetch('/api/copilot/chat', { method: 'POST', body: JSON.stringify({ question, session_id }) });
export const getCopilotHistory = () => apiFetch('/api/copilot/history');

export default apiFetch;
