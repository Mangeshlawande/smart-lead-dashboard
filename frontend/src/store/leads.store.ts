import { create } from 'zustand';
import { Lead, LeadFilters, Pagination } from '@/types';

interface LeadsStore {
  leads: Lead[];
  selectedLead: Lead | null;
  pagination: Pagination | null;
  filters: LeadFilters;
  isLoading: boolean;
  error: string | null;
  statsVersion: number;

  setLeads: (leads: Lead[], pagination: Pagination) => void;
  setSelectedLead: (lead: Lead | null) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, lead: Lead) => void;
  removeLead: (id: string) => void;
  setFilters: (filters: Partial<LeadFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  invalidateStats: () => void;
}

const defaultFilters: LeadFilters = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

export const useLeadsStore = create<LeadsStore>((set) => ({
  leads: [],
  selectedLead: null,
  pagination: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  statsVersion: 0,

  setLeads: (leads, pagination) => set({ leads, pagination, error: null }),
  setSelectedLead: (lead) => set({ selectedLead: lead }),

  addLead: (lead) =>
    set((state) => ({ leads: [lead, ...state.leads], statsVersion: state.statsVersion + 1 })),

  updateLead: (id, updatedLead) =>
    set((state) => ({
      leads: state.leads.map((l) => (l._id === id ? updatedLead : l)),
      selectedLead: state.selectedLead?._id === id ? updatedLead : state.selectedLead,
      statsVersion: state.statsVersion + 1,
    })),

  removeLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l._id !== id),
      selectedLead: state.selectedLead?._id === id ? null : state.selectedLead,
      statsVersion: state.statsVersion + 1,
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
        // Only reset to page 1 when the caller didn't supply a page themselves
        ...(filters.page == null ? { page: 1 } : {}),
      },
    })),

  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  invalidateStats: () => set((state) => ({ statsVersion: state.statsVersion + 1 })),
}));
