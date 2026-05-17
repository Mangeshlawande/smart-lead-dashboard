import { useCallback } from 'react';
import { useLeadsStore } from '@/store/leads.store';
import { leadsApi, CreateLeadPayload, UpdateLeadPayload } from '@/api/leads.api';
import { LeadFilters } from '@/types';
import toast from 'react-hot-toast';

export const useLeads = () => {
  const store = useLeadsStore();

  const fetchLeads = useCallback(
    async (filters?: LeadFilters) => {
      store.setLoading(true);
      try {
        const res = await leadsApi.getLeads(filters ?? store.filters);
        if (res.data.data) {
          store.setLeads(res.data.data.data, res.data.data.pagination);
        }
      } catch {
        store.setError('Failed to fetch leads');
        toast.error('Failed to fetch leads');
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const createLead = useCallback(
    async (payload: CreateLeadPayload) => {
      try {
        const res = await leadsApi.createLead(payload);
        if (res.data.data) {
          store.addLead(res.data.data);
          toast.success('Lead created successfully');
        }
        return res.data.data;
      } catch {
        toast.error('Failed to create lead');
        throw new Error('Failed to create lead');
      }
    },
    [store]
  );

  const updateLead = useCallback(
    async (id: string, payload: UpdateLeadPayload) => {
      try {
        const res = await leadsApi.updateLead(id, payload);
        if (res.data.data) {
          store.updateLead(id, res.data.data);
          toast.success('Lead updated successfully');
        }
        return res.data.data;
      } catch {
        toast.error('Failed to update lead');
        throw new Error('Failed to update lead');
      }
    },
    [store]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      try {
        await leadsApi.deleteLead(id);
        store.removeLead(id);
        toast.success('Lead deleted');
      } catch {
        toast.error('Failed to delete lead');
        throw new Error('Failed to delete lead');
      }
    },
    [store]
  );

  return {
    leads: store.leads,
    pagination: store.pagination,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
  };
};
