import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

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

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LeadFilterQuery extends PaginationQuery {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  assignedTo?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface IUserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ILeadDocument {
  _id: Types.ObjectId;
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
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  lastContactedAt?: Date;
  expectedCloseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityDocument {
  _id: Types.ObjectId;
  lead: Types.ObjectId;
  user: Types.ObjectId;
  type: ActivityType;
  title: string;
  description?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';
