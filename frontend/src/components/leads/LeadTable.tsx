import { useState } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { Lead } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, getInitials } from '@/utils';
import { cn } from '@/utils';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onView: (lead: Lead) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const SortIcon = ({ field, active, order }: { field: string; active: boolean; order?: 'asc' | 'desc' }) => (
  <span className="ml-1 inline-flex flex-col">
    <ChevronUp size={10} className={cn(active && order === 'asc' ? 'text-brand-400' : 'text-slate-600')} />
    <ChevronDown size={10} className={cn(active && order === 'desc' ? 'text-brand-400' : 'text-slate-600')} />
  </span>
);

const COLUMNS = [
  { key: 'firstName', label: 'Name', sortable: true },
  { key: 'company', label: 'Company', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'value', label: 'Value', sortable: true },
  { key: 'source', label: 'Source', sortable: false },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: '', sortable: false },
];

export const LeadTable = ({
  leads,
  isLoading,
  onEdit,
  onDelete,
  onView,
  sortField,
  sortOrder,
  onSort,
}: LeadTableProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-800 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-800 rounded w-1/4" />
              <div className="h-2 bg-slate-800/60 rounded w-1/3" />
            </div>
            <div className="h-5 w-16 bg-slate-800 rounded-md" />
            <div className="h-5 w-12 bg-slate-800 rounded-md" />
            <div className="h-4 w-20 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 py-20 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Eye size={20} className="text-slate-500" />
        </div>
        <p className="text-slate-400 font-medium">No leads found</p>
        <p className="text-slate-600 text-sm">Try adjusting your filters or add a new lead</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                    col.sortable && 'cursor-pointer hover:text-slate-300 select-none'
                  )}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <SortIcon field={col.key} active={sortField === col.key} order={sortOrder} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-slate-800/30 transition-colors duration-150 group"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {getInitials(`${lead.firstName} ${lead.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-400">
                  {lead.company ?? <span className="text-slate-600">—</span>}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4">
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td className="px-5 py-4 text-slate-300 font-mono text-xs">
                  {lead.value != null ? formatCurrency(lead.value) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-5 py-4 text-slate-500 capitalize">
                  {lead.source.replace(/_/g, ' ')}
                </td>
                <td className="px-5 py-4 text-slate-500 text-xs">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(lead)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(lead._id)}
                      disabled={deletingId === lead._id}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
