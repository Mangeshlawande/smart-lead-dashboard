import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/utils';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display">Settings</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Manage your account preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 font-display mb-5">Profile</h2>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xl font-bold text-white">
              {user ? getInitials(user.name) : '?'}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-100">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-md text-xs font-medium bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200 font-display mb-3">Account Info</h2>
          <div className="space-y-3 text-sm">
            {[
              ['User ID', user?.id ?? '—'],
              ['Role', user?.role ?? '—'],
              ['Email', user?.email ?? '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-mono text-xs">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 text-center">
          Full profile editing, notifications, and team management coming soon.
        </p>
      </div>
    </div>
  );
}
