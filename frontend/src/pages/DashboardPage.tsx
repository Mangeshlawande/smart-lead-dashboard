import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, Trophy, DollarSign, Target,
  AlertCircle, RefreshCw, ArrowRight, Plus,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStats } from '@/hooks/useStats';
import { useLeadsStore } from '@/store/leads.store';
import { leadsApi } from '@/api/leads.api';
import { Lead } from '@/types';
import { formatCurrency, formatDate, getInitials, capitalize } from '@/utils';
import { useAuthStore } from '@/store/auth.store';

const STATUS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-slate-500',
  qualified: 'bg-purple-500',
  proposal: 'bg-amber-500',
  negotiation: 'bg-orange-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { stats, totalLeads, isLoading, error, refresh } = useStats();
  const statsVersion = useLeadsStore((s) => s.statsVersion);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    setRecentLoading(true);
    leadsApi
      .getLeads({ limit: 5, sort: 'createdAt', order: 'desc' })
      .then((res) => {
        if (res.data.data) setRecentLeads(res.data.data.data);
      })
      .finally(() => setRecentLoading(false));
  }, [statsVersion]); // re-fetch when any lead mutation happens

  const wonLeads = stats?.byStatus?.won ?? 0;
  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const isEmpty = !isLoading && totalLeads === 0;

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isEmpty
              ? 'Add your first lead to start tracking your pipeline.'
              : `You have ${totalLeads.toLocaleString()} lead${totalLeads !== 1 ? 's' : ''} in your pipeline.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={isLoading}
            title="Refresh stats"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Link to="/leads">
            <Button size="sm">
              <Plus size={14} />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={15} />
          {error}
          <button onClick={refresh} className="ml-auto underline text-xs hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
            <Users size={24} className="text-slate-500" />
          </div>
          <div>
            <p className="text-slate-300 font-semibold">No leads yet</p>
            <p className="text-slate-600 text-sm mt-1">Create your first lead to see your pipeline stats here.</p>
          </div>
          <Link to="/leads">
            <Button size="md">
              <Plus size={15} />
              Create your first lead
            </Button>
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      {!isEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={isLoading ? '—' : totalLeads.toLocaleString()}
            icon={Users}
            iconColor="text-brand-400"
            iconBg="bg-brand-500/15"
          />
          <StatCard
            title="Pipeline Value"
            value={isLoading ? '—' : formatCurrency(stats?.totalValue ?? 0)}
            icon={DollarSign}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/15"
          />
          <StatCard
            title="Win Rate"
            value={isLoading ? '—' : `${winRate}%`}
            icon={Trophy}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/15"
            change={totalLeads > 0 ? (winRate >= 20 ? 'On track' : 'Needs attention') : undefined}
            changeType={winRate >= 20 ? 'positive' : 'negative'}
          />
          <StatCard
            title="Avg Deal Size"
            value={isLoading ? '—' : formatCurrency(stats?.avgValue ?? 0)}
            icon={TrendingUp}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/15"
          />
        </div>
      )}

      {/* Pipeline + Sources */}
      {!isEmpty && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Pipeline Stages */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={16} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-200 font-display">Pipeline Stages</h2>
            </div>
            <div className="space-y-3.5">
              {STATUS_ORDER.map((status) => {
                const count = stats?.byStatus?.[status as keyof typeof stats.byStatus] ?? 0;
                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-400 capitalize">{status}</span>
                      <span className="text-xs tabular-nums text-slate-500">
                        {isLoading ? '—' : `${count} (${Math.round(pct)}%)`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[status]}`}
                        style={{ width: isLoading ? '0%' : `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertCircle size={16} className="text-purple-400" />
              <h2 className="text-sm font-semibold text-slate-200 font-display">Lead Sources</h2>
            </div>
            {stats && Object.keys(stats.bySource).length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">No source data yet</p>
            ) : (
              <div className="space-y-3">
                {stats
                  ? Object.entries(stats.bySource)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, count]) => {
                        const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                        return (
                          <div key={source} className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 w-32 truncate shrink-0">
                              {capitalize(source)}
                            </span>
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums w-8 text-right shrink-0">
                              {count}
                            </span>
                          </div>
                        );
                      })
                  : Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-28 h-3 bg-slate-800 rounded" />
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-6 h-3 bg-slate-800 rounded" />
                      </div>
                    ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Leads */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 font-display">Recent Leads</h2>
          <Link
            to="/leads"
            className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentLoading ? (
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/3" />
                  <div className="h-2 bg-slate-800/60 rounded w-1/4" />
                </div>
                <div className="h-5 w-16 bg-slate-800 rounded-md" />
                <div className="h-5 w-12 bg-slate-800 rounded-md" />
              </div>
            ))}
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <p className="text-slate-500 text-sm">No leads yet</p>
            <Link to="/leads">
              <Button variant="secondary" size="sm">
                <Plus size={13} />
                Add your first lead
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentLeads.map((lead) => (
              <div
                key={lead._id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-800/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getInitials(`${lead.firstName} ${lead.lastName}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {lead.company ?? lead.email}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
                <PriorityBadge priority={lead.priority} />
                {lead.value != null && (
                  <span className="text-xs text-slate-400 font-mono tabular-nums w-16 text-right shrink-0">
                    {formatCurrency(lead.value)}
                  </span>
                )}
                <span className="text-xs text-slate-600 shrink-0 w-20 text-right">
                  {formatDate(lead.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
