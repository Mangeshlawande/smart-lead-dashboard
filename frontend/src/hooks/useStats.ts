import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '@/api/leads.api';
import { LeadStats } from '@/types';
import { useLeadsStore } from '@/store/leads.store';

interface UseStatsResult {
  stats: LeadStats | null;
  totalLeads: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useStats = (): UseStatsResult => {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Re-fetch whenever a lead is created/updated/deleted on any page
  const statsVersion = useLeadsStore((s) => s.statsVersion);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await leadsApi.getStats();
      if (res.data.data) setStats(res.data.data);
    } catch {
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, statsVersion]); // re-runs on every mutation

  const totalLeads = stats
    ? Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
    : 0;

  return { stats, totalLeads, isLoading, error, refresh: fetchStats };
};
