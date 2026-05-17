import client from './client';
import { ApiResponse, Lead, LeadFilters, LeadStats, PaginatedResponse } from '@/types';

export interface CreateLeadPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status?: Lead['status'];
  source: Lead['source'];
  priority?: Lead['priority'];
  value?: number;
  notes?: string;
  tags?: string[];
  assignedTo?: string;
  expectedCloseDate?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export const leadsApi = {
  getLeads: (filters?: LeadFilters) =>
    client.get<ApiResponse<PaginatedResponse<Lead>>>('/leads', { params: filters }),

  getLead: (id: string) =>
    client.get<ApiResponse<Lead>>(`/leads/${id}`),

  createLead: (payload: CreateLeadPayload) =>
    client.post<ApiResponse<Lead>>('/leads', payload),

  updateLead: (id: string, payload: UpdateLeadPayload) =>
    client.patch<ApiResponse<Lead>>(`/leads/${id}`, payload),

  deleteLead: (id: string) =>
    client.delete(`/leads/${id}`),

  exportLeads: (filters?: Omit<LeadFilters, 'page' | 'limit'>) =>
    client.get('/leads/export', { params: filters, responseType: 'blob' }),

  getStats: () =>
    client.get<ApiResponse<LeadStats>>('/leads/stats'),
};
