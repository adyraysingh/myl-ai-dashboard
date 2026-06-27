'use client';

import { useState, useEffect } from 'react';
import apiFetch from '../../lib/api';

interface QueueStat {
  queue_name: string;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  dead: number;
  delayed: number;
  avg_latency_ms: number | null;
  throughput_per_min: number;
  dlq_count: number;
  worker_id: string;
}

interface WorkerStat {
  queue_name: string;
  running: boolean;
  active_jobs: number;
  processed: number;
  failed: number;
  dlq: number;
  uptime_ms: number;
  worker_id: string;
}

interface DLQJob {
  id: number;
  queue_name: string;
  job_type: string;
  failure_reason: string;
  attempts: number;
  moved_at: string;
  replayed_at: string | null;
}

interface QueueData {
  workers: WorkerStat[];
  queues: QueueStat[];
  dlq_count: number;
  dlq_sample: DLQJob[];
}

function formatMs(ms: number | null): string {
  if (ms == null) return 'none';
  if (ms < 1000) return ms.toFixed(0) + 'ms';
  return (ms / 1000).toFixed(1) + 's';
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return h + 'h ' + (m % 60) + 'm';
  if (m > 0) return m + 'm ' + (s % 60) + 's';
  return s + 's';
}

export default function QueueDashboard() {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replayLoading, setReplayLoading] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function loadData() {
    try {
      const res = await apiFetch('/api/queue/stats');
      setData(res);
      setLastRefresh(new Date());
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load queue stats');
    } finally {
      setLoading(false);
    }
  }

  async function replayDLQ(id: number) {
    setReplayLoading(id);
    try {
      await apiFetch('/api/queue/dlq/' + id + '/replay', { method: 'POST' });
      await loadData();
    } catch (err: any) {
      alert('Replay failed: ' + err.message);
    } finally {
      setReplayLoading(null);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-gray-400 text-lg">Loading queue dashboard...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-red-400 text-lg">Error: {error}</div>
    </div>
  );

  const totalPending = (data?.queues || []).reduce((s, q) => s + (parseInt(String(q.pending)) || 0), 0);
  const totalProcessing = (data?.queues || []).reduce((s, q) => s + (parseInt(String(q.processing)) || 0), 0);
  const totalDLQ = (data?.queues || []).reduce((s, q) => s + (parseInt(String(q.dlq_count)) || 0), 0);

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Queue Monitor</h1>
            <p className="text-gray-400 text-sm mt-1">Phase 2 — Durable Infrastructure · Auto-refresh 15s</p>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && <span className="text-gray-500 text-xs">Updated {lastRefresh.toLocaleTimeString()}</span>}
            <button onClick={loadData} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium">Refresh</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-gray-400 text-xs uppercase mb-2">Pending Jobs</div>
            <div className={`text-3xl font-bold ${totalPending > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{totalPending}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-gray-400 text-xs uppercase mb-2">Processing Now</div>
            <div className={`text-3xl font-bold ${totalProcessing > 0 ? 'text-blue-400' : 'text-gray-400'}`}>{totalProcessing}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-gray-400 text-xs uppercase mb-2">Dead Letter Queue</div>
            <div className={`text-3xl font-bold ${totalDLQ > 0 ? 'text-red-400' : 'text-green-400'}`}>{totalDLQ}</div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
          <div className="px-6 py-4 border-b border-gray-800"><h2 className="text-lg font-semibold">Worker Status</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Queue</th>
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Active</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Processed</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Failed</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">DLQ</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Uptime</th>
              </tr></thead>
              <tbody>
                {(data?.workers || []).map(w => (
                  <tr key={w.queue_name} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-4 font-medium">{w.queue_name}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 ${w.running ? 'text-green-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${w.running ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {w.running ? 'Running' : 'Stopped'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right ${w.active_jobs > 0 ? 'text-blue-400' : 'text-gray-400'}`}>{w.active_jobs}</td>
                    <td className="px-6 py-4 text-right text-green-400">{w.processed}</td>
                    <td className={`px-6 py-4 text-right ${w.failed > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{w.failed}</td>
                    <td className={`px-6 py-4 text-right ${w.dlq > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{w.dlq}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{formatUptime(w.uptime_ms)}</td>
                  </tr>
                ))}
                {(data?.workers || []).length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No worker data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 mb-6">
          <div className="px-6 py-4 border-b border-gray-800"><h2 className="text-lg font-semibold">Queue Statistics</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Queue</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Pending</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Processing</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Completed</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Failed</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">DLQ</th>
                <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Avg Latency</th>
              </tr></thead>
              <tbody>
                {(data?.queues || []).length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No queue data yet — workers are polling</td></tr>
                ) : (data?.queues || []).map(q => (
                  <tr key={q.queue_name} className="border-b border-gray-800 hover:bg-gray-800">
                    <td className="px-6 py-4 font-medium">{q.queue_name}</td>
                    <td className={`px-6 py-4 text-right ${parseInt(String(q.pending)) > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{q.pending}</td>
                    <td className={`px-6 py-4 text-right ${parseInt(String(q.processing)) > 0 ? 'text-blue-400' : 'text-gray-400'}`}>{q.processing}</td>
                    <td className="px-6 py-4 text-right text-green-400">{q.completed}</td>
                    <td className={`px-6 py-4 text-right ${parseInt(String(q.failed)) > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{q.failed}</td>
                    <td className={`px-6 py-4 text-right ${parseInt(String(q.dlq_count)) > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{q.dlq_count}</td>
                    <td className="px-6 py-4 text-right text-gray-300">{formatMs(q.avg_latency_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dead Letter Queue</h2>
            <span className={`text-sm px-2 py-1 rounded ${totalDLQ > 0 ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
              {totalDLQ} jobs
            </span>
          </div>
          {(data?.dlq_sample || []).length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="text-green-400 text-2xl mb-2">✓</div>
              <div>Dead Letter Queue is empty — all jobs processing normally</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Queue</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Job Type</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-400 uppercase">Failure</th>
                  <th className="px-6 py-3 text-right text-xs text-gray-400 uppercase">Attempts</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-400 uppercase">Action</th>
                </tr></thead>
                <tbody>
                  {data?.dlq_sample?.map(job => (
                    <tr key={job.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="px-6 py-4 text-gray-400 text-sm">{job.id}</td>
                      <td className="px-6 py-4 text-white text-sm">{job.queue_name}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{job.job_type}</td>
                      <td className="px-6 py-4 text-red-300 text-sm max-w-xs truncate">{job.failure_reason}</td>
                      <td className="px-6 py-4 text-right text-orange-400 text-sm">{job.attempts}</td>
                      <td className="px-6 py-4 text-center">
                        {job.replayed_at ? (
                          <span className="text-gray-500 text-xs">Replayed</span>
                        ) : (
                          <button onClick={() => replayDLQ(job.id)} disabled={replayLoading === job.id}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded text-xs font-medium">
                            {replayLoading === job.id ? 'Replaying...' : 'Replay'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
