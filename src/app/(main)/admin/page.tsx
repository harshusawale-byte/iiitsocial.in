'use client';

import { useStore } from '../../../store/store';
import EmptyState from '../../../components/ui/EmptyState';

export default function AdminPage() {
  const { state, dispatch, loadDevSeed, resetAllData } = useStore();
  const pendingReports = state.reports.filter(r => r.status === 'pending');
  const resolvedReports = state.reports.filter(r => r.status !== 'pending');

  const resolveReport = (reportId: string, action: 'dismiss' | 'warn' | 'remove_content' | 'suspend_user') => {
    const report = state.reports.find(r => r.id === reportId);
    const log = {
      id: 'log_' + Date.now(), moderatorId: state.currentUser?.id || 'system', action: action as 'warn' | 'remove_content' | 'suspend_user' | 'dismiss',
      targetUserId: report?.reportedUserId || '', targetId: report?.targetId || reportId, targetType: report?.targetType || 'report', reason: action, createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'RESOLVE_REPORT', reportId, action: log });
    if (action === 'remove_content' && report) {
      if (report.targetType === 'post') dispatch({ type: 'REMOVE_POST', postId: report.targetId });
      if (report.targetType === 'discussion') dispatch({ type: 'REMOVE_DISCUSSION', discussionId: report.targetId });
    }
    if (action === 'suspend_user' && report?.reportedUserId) {
      dispatch({ type: 'SUSPEND_USER', userId: report.reportedUserId });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3">
        <h1 className="text-lg font-bold text-white">🛡️ Moderation Dashboard</h1>
      </div>

      <div className="px-4 py-4">
        <h2 className="text-white text-sm font-semibold mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Users', value: state.users.length, icon: '👥' },
            { label: 'Posts', value: state.posts.length, icon: '📝' },
            { label: 'Discussions', value: state.discussions.length, icon: '🗣️' },
            { label: 'Communities', value: state.communities.length, icon: '🏫' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-[#666] text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dev tools */}
      <div className="px-4 py-2">
        <div className="bg-[#141414] border border-amber-500/20 rounded-xl p-4">
          <h3 className="text-amber-500 text-xs font-semibold mb-2">⚙️ Development Tools</h3>
          <p className="text-[#666] text-xs mb-3">Load test data for development. These are clearly marked as test accounts and never displayed as real students.</p>
          <div className="flex gap-2">
            <button onClick={loadDevSeed}
              className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
              Load Dev Seed Data
            </button>
            <button onClick={resetAllData}
              className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-medium rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Reset All Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-white text-sm font-semibold mb-3">
          Pending Reports {pendingReports.length > 0 && <span className="text-[#e50914] text-xs">({pendingReports.length})</span>}
        </h2>
        {pendingReports.length === 0 ? (
          <EmptyState icon="✅" title="No pending reports" description="When students report content, it will appear here for review." />
        ) : (
          <div className="space-y-2">
            {pendingReports.map(report => (
              <div key={report.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded font-medium uppercase">{report.reason}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-[#666] rounded ml-1">{report.targetType}</span>
                  </div>
                  <span className="text-[#444] text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                {report.description && <p className="text-[#a0a0a0] text-xs mb-2">{report.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => resolveReport(report.id, 'dismiss')} className="px-3 py-1 text-xs rounded-lg border border-[#333] text-[#666] hover:text-white hover:border-white transition-colors">Dismiss</button>
                  <button onClick={() => resolveReport(report.id, 'warn')} className="px-3 py-1 text-xs rounded-lg border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors">Warn User</button>
                  <button onClick={() => resolveReport(report.id, 'remove_content')} className="px-3 py-1 text-xs rounded-lg border border-[#e50914]/30 text-[#e50914] hover:bg-[#e50914]/10 transition-colors">Remove Content</button>
                  <button onClick={() => resolveReport(report.id, 'suspend_user')} className="px-3 py-1 text-xs rounded-lg border border-red-700/30 text-red-500 hover:bg-red-500/10 transition-colors">Suspend User</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <h2 className="text-white text-sm font-semibold mb-3">Resolved ({resolvedReports.length})</h2>
        {resolvedReports.length > 0 ? (
          <div className="space-y-2">
            {resolvedReports.map(report => (
              <div key={report.id} className="bg-[#141414] border border-[#262626] rounded-xl p-3 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-medium">✓ Resolved</span>
                  <span className="text-[#666] text-xs">{report.reason} · {report.targetType}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-[#444] text-xs">No resolved reports yet</p>}
      </div>

      <div className="px-4 pb-8">
        <h2 className="text-white text-sm font-semibold mb-3">Moderation Log</h2>
        {state.moderationLogs.length === 0 ? (
          <p className="text-[#444] text-xs">No moderation actions taken yet</p>
        ) : (
          <div className="space-y-2">
            {state.moderationLogs.map(log => (
              <div key={log.id} className="bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs">
                <span className="text-[#666]">{new Date(log.createdAt).toLocaleString()} · </span>
                <span className="text-[#a0a0a0]">Action: {log.action.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
