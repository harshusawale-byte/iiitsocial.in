'use client';

import EmptyState from '../ui/EmptyState';

type AppWithDetails = {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  message: string | null;
  status: string;
  created_at: string;
  opportunity_title?: string;
  opportunity_organizer?: string;
  opportunity_category?: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function MyApplicationsTab({
  applications,
  loading,
  onWithdraw,
}: {
  applications: AppWithDetails[];
  loading: boolean;
  onWithdraw: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-[#262626] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#262626] rounded w-1/2 mb-3" />
            <div className="h-3 bg-[#262626] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No applications yet"
        description="Apply to opportunities to track them here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {applications.map(app => {
        const statusStyle = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
        const appliedDate = new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
          <div key={app.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {app.opportunity_category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#666] border border-[#262626]">
                      {app.opportunity_category.charAt(0).toUpperCase() + app.opportunity_category.slice(1)}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusStyle}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <h4 className="text-white font-semibold text-sm">{app.opportunity_title || 'Untitled Opportunity'}</h4>
                {app.opportunity_organizer && (
                  <p className="text-[#a0a0a0] text-xs mt-0.5">by {app.opportunity_organizer}</p>
                )}
                <p className="text-[#666] text-[10px] mt-1.5">Applied {appliedDate}</p>
                {app.message && (
                  <p className="text-[#666] text-xs mt-1.5 italic line-clamp-2">"{app.message}"</p>
                )}
              </div>
              {(app.status === 'pending' || app.status === 'reviewing') && (
                <button
                  onClick={() => onWithdraw(app.id)}
                  className="flex-shrink-0 px-3 py-1.5 text-[10px] font-medium text-[#666] border border-[#262626] rounded-lg hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  Withdraw
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
