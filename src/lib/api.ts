import { getAccessToken, setAccessToken, refreshRequest } from '@/lib/auth';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://maya-ai-sales-production.up.railway.app';
let _refreshPromise: Promise<string | null> | null = null;
const _inflight: Map<string, Promise<any>> = new Map();
const _cache: Map<string, { data: any; ts: number }> = new Map();
const CACHE_TTL = 30000;
const REQUEST_TIMEOUT = 10000;
async function _getValidToken(): Promise<string | null> {
    const token = getAccessToken();
    if (token) return token;
    if (!_refreshPromise) { _refreshPromise = refreshRequest().finally(() => { _refreshPromise = null; }); }
    const newToken = await _refreshPromise;
    if (newToken) setAccessToken(newToken);
    return newToken;
}
async function apiFetch(path: string, options?: RequestInit) {
    const isGet = !options?.method || options.method === 'GET';
    const cacheKey = isGet ? path : null;
    if (cacheKey) {
          const cached = _cache.get(cacheKey);
          if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
          const existing = _inflight.get(cacheKey);
          if (existing) return existing;
    }
    const token = await _getValidToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const doFetch = async (): Promise<any> => {
          try {
                  const res = await fetch(API_BASE + path, { credentials: 'include', ...options, headers, signal: controller.signal });
                  clearTimeout(timer);
                  if (res.status === 401) {
                            if (!_refreshPromise) { _refreshPromise = refreshRequest().finally(() => { _refreshPromise = null; }); }
                            const newToken = await _refreshPromise;
                            if (!newToken) { if (typeof window !== 'undefined') window.location.href = '/login'; throw new Error('Session expired'); }
                            setAccessToken(newToken);
                            const retryRes = await fetch(API_BASE + path, { credentials: 'include', ...options, headers: { ...headers, 'Authorization': 'Bearer ' + newToken } });
                            if (!retryRes.ok) { const err = await retryRes.json().catch(() => ({ error: retryRes.statusText })); throw new Error(err.error || 'API error ' + retryRes.status); }
                            const data = await retryRes.json();
                            if (cacheKey) { _cache.set(cacheKey, { data, ts: Date.now() }); _inflight.delete(cacheKey); }
                            return data;
                  }
                  if (!res.ok) { const err = await res.json().catch(() => ({ error: res.statusText })); throw new Error(err.error || 'API error ' + res.status); }
                  const data = await res.json();
                  if (cacheKey) { _cache.set(cacheKey, { data, ts: Date.now() }); _inflight.delete(cacheKey); }
                  return data;
          } catch (e: any) {
                  clearTimeout(timer);
                  if (cacheKey) _inflight.delete(cacheKey);
                  if (e.name === 'AbortError') throw new Error('Request timed out');
                  throw e;
          }
    };
    const promise = doFetch();
    if (cacheKey) _inflight.set(cacheKey, promise);
    return promise;
}
export function invalidateCache(path?: string) { if (path) { _cache.delete(path); } else { _cache.clear(); } }
export default apiFetch;
export const getPlatformHealth = () => apiFetch('/api/platform/health');
export const getModuleHealth = () => apiFetch('/api/platform/modules');
export const getPlatformModules = () => apiFetch('/api/platform/modules');
export const getQueueStatus = () => apiFetch('/api/platform/queues');
export const getPlatformQueues = () => apiFetch('/api/platform/queues');
export const getPlatformIntegrations = () => apiFetch('/api/platform/integrations');
export const getPlatformModels = () => apiFetch('/api/platform/models');
export const getPlatformPrompts = () => apiFetch('/api/platform/prompts');
export const getPlatformCosts = () => apiFetch('/api/platform/costs');
export const getPlatformErrors = (params?: Record<string, string>) => { const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return apiFetch('/api/platform/errors' + qs); };
export const getPlatformConfig = () => apiFetch('/api/platform/config');
export const getPlatformAudit = () => apiFetch('/api/platform/audit');
export const getPlatformDashboard = () => apiFetch('/api/platform/dashboard');
export const getDashboard = () => apiFetch('/api/executive/summary');
export const setPlatformConfig = (key: string, value: string, performed_by = 'admin') => apiFetch('/api/platform/config', { method: 'POST', body: JSON.stringify({ key, value, performed_by }) });
export const retryError = (error_id: string) => apiFetch('/api/platform/errors/' + error_id + '/retry', { method: 'POST', body: JSON.stringify({ error_id }) });
export const getRevenueForecast = () => apiFetch('/api/revenue/forecast');
export const getRevenueScenarios = () => apiFetch('/api/revenue/scenarios');
export const getWorkflows = () => apiFetch('/api/operations/workflows');
export const getOperationsMetrics = () => apiFetch('/api/operations/metrics');
export const getDecisions = () => apiFetch('/api/decisions');
export const getQualificationQueue = () => apiFetch('/api/qualification');
export const getInvestigations = () => apiFetch('/api/investigations');
export const getConversations = () => apiFetch('/api/conversations');
export const getSalesPerformance = () => apiFetch('/api/sales/performance');
export const getExecutiveSummary = () => apiFetch('/api/executive/summary');
export const getExecutiveBriefing = () => apiFetch('/api/executive/briefing');
export const getLearningInsights = () => apiFetch('/api/learning/performance');
export const getLearningModels = () => apiFetch('/api/learning/models');
export const getCostAnalysis = () => apiFetch('/api/platform/costs');
export const sendCopilotMessage = (question: string, session_id?: string) => apiFetch('/api/copilot/chat', { method: 'POST', body: JSON.stringify({ question, session_id }) });
export const getCEODashboard = () => apiFetch('/api/dashboard/ceo');
