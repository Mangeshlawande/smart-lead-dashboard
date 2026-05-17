import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Lead } from '@/types';
import { useLeads } from '@/hooks/useLeads';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFiltersBar } from '@/components/leads/LeadFiltersBar';
import { LeadForm } from '@/components/leads/LeadForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PaginationBar } from '@/components/ui/Pagination';
import { LeadFormData } from '@/validators';
import { leadsApi } from '@/api/leads.api';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const {
    leads,
    pagination,
    filters,
    isLoading,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    setFilters,
    resetFilters,
  } = useLeads();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Stable ref to fetchLeads so useEffect doesn't re-run unnecessarily
  const fetchLeadsRef = useRef(fetchLeads);
  useEffect(() => { fetchLeadsRef.current = fetchLeads; }, [fetchLeads]);

  useEffect(() => {
    fetchLeadsRef.current(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSort = useCallback(
    (field: string) => {
      setFilters({
        sort: field,
        order: filters.sort === field && filters.order === 'desc' ? 'asc' : 'desc',
      });
    },
    [filters, setFilters]
  );

  const handleCreate = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await createLead(data);
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: LeadFormData) => {
    if (!editLead) return;
    setIsSubmitting(true);
    try {
      await updateLead(editLead._id, data);
      setEditLead(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Pass current active filters (excluding page/limit) to export all matching leads
      const { page: _page, limit: _limit, ...exportFilters } = filters;
      const response = await leadsApi.exportLeads(exportFilters);
      const blob = new Blob([response.data as BlobPart], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Leads exported successfully');
    } catch {
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 font-display">Leads</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {pagination ? `${pagination.total.toLocaleString()} total leads` : 'Manage your pipeline'}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="md">
          <Plus size={15} />
          Add Lead
        </Button>
      </div>

      {/* Filters + Export */}
      <LeadFiltersBar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Table */}
      <LeadTable
        leads={leads}
        isLoading={isLoading}
        onEdit={setEditLead}
        onDelete={deleteLead}
        onView={setViewLead}
        sortField={filters.sort}
        sortOrder={filters.order}
        onSort={handleSort}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <PaginationBar
          pagination={pagination}
          onPageChange={(page) => setFilters({ page })}
        />
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Lead" size="lg">
        <LeadForm onSubmit={handleCreate} isLoading={isSubmitting} submitLabel="Create Lead" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLead} onClose={() => setEditLead(null)} title="Edit Lead" size="lg">
        {editLead && (
          <LeadForm
            defaultValues={editLead}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details" size="md">
        {viewLead && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {([
                ['Name', `${viewLead.firstName} ${viewLead.lastName}`],
                ['Email', viewLead.email],
                ['Phone', viewLead.phone ?? '—'],
                ['Company', viewLead.company ?? '—'],
                ['Job Title', viewLead.jobTitle ?? '—'],
                ['Source', viewLead.source?.replace(/_/g, ' ')],
                ['Status', viewLead.status],
                ['Priority', viewLead.priority],
                ['Value', viewLead.value != null ? `$${viewLead.value.toLocaleString()}` : '—'],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-slate-200 font-medium capitalize">{val}</p>
                </div>
              ))}
            </div>
            {viewLead.notes && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs mb-1">Notes</p>
                <p className="text-slate-300 leading-relaxed">{viewLead.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
