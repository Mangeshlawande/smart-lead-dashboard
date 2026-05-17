import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, LeadFormData } from '@/validators';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Lead } from '@/types';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

interface LeadFormProps {
  defaultValues?: Partial<Lead>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const LeadForm = ({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Lead' }: LeadFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      company: defaultValues?.company ?? '',
      jobTitle: defaultValues?.jobTitle ?? '',
      status: defaultValues?.status ?? 'new',
      source: defaultValues?.source ?? 'website',
      priority: defaultValues?.priority ?? 'medium',
      value: defaultValues?.value,
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" required error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name" required error={errors.lastName?.message} {...register('lastName')} />
      </div>
      <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
        <Input label="Company" error={errors.company?.message} {...register('company')} />
      </div>
      <Input label="Job Title" error={errors.jobTitle?.message} {...register('jobTitle')} />
      <div className="grid grid-cols-3 gap-4">
        <Select label="Status" required options={STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
        <Select label="Source" required options={SOURCE_OPTIONS} error={errors.source?.message} {...register('source')} />
        <Select label="Priority" required options={PRIORITY_OPTIONS} error={errors.priority?.message} {...register('priority')} />
      </div>
      <Input
        label="Deal Value ($)"
        type="number"
        min={0}
        error={errors.value?.message}
        {...register('value', { valueAsNumber: true })}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">Notes</label>
        <textarea
          className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/60 transition-all duration-200 resize-none"
          rows={3}
          {...register('notes')}
        />
        {errors.notes && <p className="text-xs text-red-400">{errors.notes.message}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
