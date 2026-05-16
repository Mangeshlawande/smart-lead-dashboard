import { Response } from 'express';
import { AuthenticatedRequest, LeadFilterQuery } from '../types';
import { asyncHandler } from '../utils/errors';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import * as leadService from '../services/lead.service';

export const getLeads = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await leadService.getLeads(req.query as LeadFilterQuery);
  sendSuccess(res, result, 'Leads retrieved');
});

export const getLeadById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id);
  sendSuccess(res, lead, 'Lead retrieved');
});

export const createLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadService.createLead(req.body, req.user!.id);
  sendCreated(res, lead, 'Lead created');
});

export const updateLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lead = await leadService.updateLead(req.params.id, req.body);
  sendSuccess(res, lead, 'Lead updated');
});

export const deleteLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await leadService.deleteLead(req.params.id);
  sendNoContent(res);
});

export const exportLeads = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const leads = await leadService.exportLeads(req.query as LeadFilterQuery);

  const escape = (val: unknown): string => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const headers = [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Company',
    'Job Title', 'Status', 'Source', 'Priority', 'Value',
    'Assigned To', 'Created By', 'Created At', 'Updated At',
  ];

  const rows = leads.map((l) => [
    l._id,
    l.firstName,
    l.lastName,
    l.email,
    l.phone ?? '',
    l.company ?? '',
    l.jobTitle ?? '',
    l.status,
    l.source,
    l.priority,
    l.value ?? '',
    (l.assignedTo as any)?.name ?? '',
    (l.createdBy as any)?.name ?? '',
    new Date(l.createdAt).toISOString(),
    new Date(l.updatedAt).toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-export-${Date.now()}.csv"`);
  res.send('\uFEFF' + csv); // BOM for Excel compatibility
});

export const getLeadStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await leadService.getLeadStats();
  sendSuccess(res, stats, 'Stats retrieved');
});
