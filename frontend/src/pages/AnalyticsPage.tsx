import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, PieChart, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/Button';
import { formatCurrency, capitalize } from '@/utils';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-slate-400',
  qualified: 'bg-purple-500',
  proposal: 'bg-amber-500',
  negotiation: 'bg-orange-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
};

const SOURCE_COLORS = [
  'bg-brand-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-red-500', 'bg-sky-500', 'bg-pink-500',
];

export default function AnalyticsPage() {
  const { stats, totalLeads, isLoading, error, refresh } = useStats();

  const isEmpty = !isLoading && totalLeads === 0;
  const wonLeads = stats?.byStatus?.won ?? 0;
  const lostLeads = stats?.byStatus?.lost ?? 0;
  const activeLeads = totalLeads - wonLeads - lostLeads;
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display">Analytics</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Pipeline insights and performance metrics</p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          title="Refresh data"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={15} />
          {error}
          <button onClick={refresh} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-slate-700 py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
            <BarChart3 size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-slate-300 font-semibold">No data to analyse yet</p>
            <p className="text-slate-600 text-sm mt-1">Create some leads and their stats will appear here.</p>
          </div>
          <Link to="/leads">
            <Button size="md">
              <Plus size={15} />
              Create your first lead
            </Button>
          </Link>
        </div>
      )}

      {/* KPI row */}
      {!isEmpty && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Leads',
              value: isLoading ? '—' : totalLeads.toLocaleString(),
              icon: PieChart,
              color: 'text-brand-400',
              bg: 'bg-brand-500/10',
            },
            {
              label: 'Active in Pipeline',
              value: isLoading ? '—' : activeLeads.toLocaleString(),
              icon: TrendingUp,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
            {
              label: 'Pipeline Value',
              value: isLoading ? '—' : formatCurrency(stats?.totalValue ?? 0),
              icon: BarChart3,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              label: 'Win Rate',
              value: isLoading ? '—' : `${winRate}%`,
              icon: TrendingUp,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon size={17} className={color} />
              </div>
              <p className="text-2xl font-bold text-slate-100 font-display">
                {isLoading ? (
                  <span className="inline-block w-16 h-7 bg-slate-800 rounded animate-pulse" />
                ) : (
                  value
                )}
              </p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* By Priority */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 font-display mb-5">Leads by Priority</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-slate-800 rounded" />
                      <div className="h-3 w-16 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {['high', 'medium', 'low'].map((p) => {
                  const count = stats?.byPriority?.[p as keyof typeof stats.byPriority] ?? 0;
                  const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                  return (
                    <div key={p}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="capitalize text-slate-300 font-medium">{p} Priority</span>
                        <span className="text-slate-500 tabular-nums">
                          {count} lead{count !== 1 ? 's' : ''} · {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${PRIORITY_COLORS[p]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Source */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-200 font-display mb-5">Leads by Source</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                    <div className="flex-1 h-3 bg-slate-800 rounded" />
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full" />
                    <div className="w-6 h-3 bg-slate-800 rounded" />
                  </div>
                ))}
              </div>
            ) : stats && Object.keys(stats.bySource).length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">No source data</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats?.bySource ?? {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([src, count], i) => {
                    const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                    return (
                      <div key={src} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`} />
                        <span className="text-xs text-slate-400 w-28 truncate shrink-0">{capitalize(src)}</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums w-8 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status breakdown table */}
      {!isEmpty && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 font-display mb-5">Full Status Breakdown</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="w-24 h-3 bg-slate-800 rounded" />
                  <div className="w-8 h-3 bg-slate-800 rounded" />
                  <div className="w-10 h-3 bg-slate-800 rounded" />
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    {['Stage', 'Count', 'Share', 'Bar'].map((h) => (
                      <th key={h} className="text-left pb-3 pr-8 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {STATUS_ORDER.map((s) => {
                    const count = stats?.byStatus?.[s as keyof typeof stats.byStatus] ?? 0;
                    const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                    return (
                      <tr key={s} className="group">
                        <td className="py-3 pr-8">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                            <span className="capitalize text-slate-300 font-medium">{s}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-8 text-slate-400 tabular-nums font-mono text-xs">{count}</td>
                        <td className="py-3 pr-8 text-slate-500 tabular-nums text-xs">{Math.round(pct)}%</td>
                        <td className="py-3 w-full min-w-32">
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[s]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-700 mt-2">
                    <td className="pt-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total</td>
                    <td className="pt-3 text-slate-300 font-bold tabular-nums font-mono text-xs">{totalLeads}</td>
                    <td className="pt-3 text-slate-500 text-xs">100%</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
