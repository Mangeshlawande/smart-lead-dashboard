import { FilterQuery, Types } from 'mongoose';
import { Lead } from '../models/Lead';
import { AppError } from '../utils/errors';
import { ILeadDocument, LeadFilterQuery, PaginatedResponse } from '../types';
import { CreateLeadInput, UpdateLeadInput } from '../validators/schemas';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const buildFilterQuery = (query: LeadFilterQuery): FilterQuery<ILeadDocument> => {
  const filter: FilterQuery<ILeadDocument> = {};

  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.priority) filter.priority = query.priority;
  if (query.assignedTo) filter.assignedTo = new Types.ObjectId(query.assignedTo);

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.createdAt.$lte = new Date(query.dateTo);
  }

  return filter;
};

export const getLeads = async (
  query: LeadFilterQuery
): Promise<PaginatedResponse<ILeadDocument>> => {
  const page = Math.max(1, parseInt(query.page ?? '1', 10));
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit ?? String(DEFAULT_LIMIT), 10)));
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const filter = buildFilterQuery(query);

  const [data, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    data: data as ILeadDocument[],
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

export const getLeadById = async (id: string): Promise<ILeadDocument> => {
  const lead = await Lead.findById(id)
    .populate('assignedTo', 'name email role')
    .populate('createdBy', 'name email');

  if (!lead) throw AppError.notFound('Lead');
  return lead;
};

export const createLead = async (
  input: CreateLeadInput,
  userId: string
): Promise<ILeadDocument> => {
  const lead = await Lead.create({
    ...input,
    createdBy: new Types.ObjectId(userId),
    assignedTo: input.assignedTo ? new Types.ObjectId(input.assignedTo) : undefined,
  });
  return lead;
};

export const updateLead = async (id: string, input: UpdateLeadInput): Promise<ILeadDocument> => {
  const lead = await Lead.findByIdAndUpdate(
    id,
    { ...input, assignedTo: input.assignedTo ? new Types.ObjectId(input.assignedTo) : undefined },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email');

  if (!lead) throw AppError.notFound('Lead');
  return lead;
};

export const deleteLead = async (id: string): Promise<void> => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw AppError.notFound('Lead');
};

export const exportLeads = async (query: LeadFilterQuery): Promise<ILeadDocument[]> => {
  const filter = buildFilterQuery(query);
  const sortField = query.sort ?? 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const leads = await Lead.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ [sortField]: sortOrder })
    .limit(10000) // safety cap
    .lean();

  return leads as ILeadDocument[];
};

export const getLeadStats = async (): Promise<Record<string, unknown>> => {
  const [statusCounts, sourceCounts, priorityCounts, totalValue] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: null, total: { $sum: '$value' }, avg: { $avg: '$value' } } }]),
  ]);

  return {
    byStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    bySource: Object.fromEntries(sourceCounts.map((s) => [s._id, s.count])),
    byPriority: Object.fromEntries(priorityCounts.map((s) => [s._id, s.count])),
    totalValue: totalValue[0]?.total ?? 0,
    avgValue: totalValue[0]?.avg ?? 0,
  };
};
