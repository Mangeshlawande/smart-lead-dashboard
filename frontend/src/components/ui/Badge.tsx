import { cn } from '@/utils';
import { LeadStatus, LeadPriority } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-700/60 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30',
};

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variantClasses[variant], className)}>
    {children}
  </span>
);

const statusVariants: Record<LeadStatus, BadgeVariant> = {
  new: 'info',
  contacted: 'default',
  qualified: 'purple',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'danger',
};

const priorityVariants: Record<LeadPriority, BadgeVariant> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

export const StatusBadge = ({ status }: { status: LeadStatus }) => (
  <Badge variant={statusVariants[status]}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </Badge>
);

export const PriorityBadge = ({ priority }: { priority: LeadPriority }) => (
  <Badge variant={priorityVariants[priority]}>
    {priority.charAt(0).toUpperCase() + priority.slice(1)}
  </Badge>
);
