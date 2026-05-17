import { useRef, useCallback, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Download } from 'lucide-react';
import { LeadFilters } from '@/types';
import { cn } from '@/utils';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const SOURCE_OPTIONS = ['website', 'referral', 'social_media', 'instagram', 'cold_call', 'email_campaign', 'event', 'other'];

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onChange: (filters: Partial<LeadFilters>) => void;
  onReset: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export const LeadFiltersBar = ({
  filters,
  onChange,
  onReset,
  onExport,
  isExporting = false,
}: LeadFiltersBarProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters =
    filters.status || filters.priority || filters.source || filters.search;

  // Sync search input if filters are reset externally
  useEffect(() => {
    if (!filters.search && searchRef.current) {
      searchRef.current.value = '';
    }
  }, [filters.search]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onChange({ search: value || undefined, page: 1 });
      }, 400);
    },
    [onChange]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Debounced search */}
        <div className="relative flex-1 min-w-52">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            ref={searchRef}
            defaultValue={filters.search}
            placeholder="Search by name or email…"
            onChange={handleSearchChange}
            className="w-full bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-200 text-sm rounded-xl pl-9 pr-3.5 py-2.5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/60 transition-all"
          />
        </div>

        {/* CSV Export */}
        {onExport && (
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-emerald-400 px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 transition-all border border-slate-700 hover:border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export visible leads as CSV"
          >
            <Download size={13} />
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all border border-slate-700 border-dashed"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterChips
          label="Status"
          options={STATUS_OPTIONS}
          active={filters.status}
          onChange={(val) => onChange({ status: val as LeadFilters['status'], page: 1 })}
        />

        <FilterChips
          label="Source"
          options={SOURCE_OPTIONS}
          active={filters.source}
          onChange={(val) => onChange({ source: val as LeadFilters['source'], page: 1 })}
        />

        <FilterChips
          label="Priority"
          options={PRIORITY_OPTIONS}
          active={filters.priority}
          onChange={(val) => onChange({ priority: val as LeadFilters['priority'], page: 1 })}
        />
      </div>
    </div>
  );
};

const FilterChips = ({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: string[];
  active?: string;
  onChange: (val: string | undefined) => void;
}) => (
  <div className="flex items-center gap-1.5 flex-wrap">
    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
      <SlidersHorizontal size={11} />
      {label}:
    </span>
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(active === opt ? undefined : opt)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all duration-150',
            active === opt
              ? 'bg-brand-500/20 text-brand-400 ring-1 ring-brand-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          )}
        >
          {opt.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  </div>
);
