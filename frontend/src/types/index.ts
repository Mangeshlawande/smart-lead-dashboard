export type UserRole = 'admin' | 'manager' | 'agent';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadSource =
  | 'website'
  | 'referral'
  | 'social_media'
  | 'instagram'
  | 'cold_call'
  | 'email_campaign'
  | 'event'
  | 'other';

export type LeadPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;
  value?: number;
  notes?: string;
  tags: string[];
  assignedTo?: Pick<User, 'id' | 'name' | 'email'>;
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  lastContactedAt?: string;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  search?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadStats {
  byStatus: Record<LeadStatus, number>;
  bySource: Record<LeadSource, number>;
  byPriority: Record<LeadPriority, number>;
  totalValue: number;
  avgValue: number;
}
