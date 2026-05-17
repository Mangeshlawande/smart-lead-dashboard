import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-brand-400',
  iconBg = 'bg-brand-500/15',
}: StatCardProps) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors duration-200 animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      {change && (
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-lg',
            changeType === 'positive' && 'text-emerald-400 bg-emerald-500/10',
            changeType === 'negative' && 'text-red-400 bg-red-500/10',
            changeType === 'neutral' && 'text-slate-400 bg-slate-800'
          )}
        >
          {change}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-100 font-display mb-1">{value}</p>
    <p className="text-sm text-slate-500">{title}</p>
  </div>
);
