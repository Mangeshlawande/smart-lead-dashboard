import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and a number'
      ),
    role: z.enum(['admin', 'manager', 'agent']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    phone: z.string().max(20).optional(),
    company: z.string().max(100).optional(),
    jobTitle: z.string().max(100).optional(),
    status: z
      .enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
      .optional(),
    source: z.enum([
      'website',
      'referral',
      'social_media',
      'instagram',
      'cold_call',
      'email_campaign',
      'event',
      'other',
    ]),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    value: z.number().min(0).optional(),
    notes: z.string().max(2000).optional(),
    tags: z.array(z.string()).optional(),
    assignedTo: z.string().optional(),
    expectedCloseDate: z.string().datetime().optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: createLeadSchema.shape.body.partial(),
});

export const leadQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    status: z
      .enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
      .optional(),
    source: z
      .enum([
        'website',
        'referral',
        'social_media',
        'instagram',
        'cold_call',
        'email_campaign',
        'event',
        'other',
      ])
      .optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreateLeadInput = z.infer<typeof createLeadSchema>['body'];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>['body'];
