'use client';

import { useState } from 'react';
import { useTeamFinder } from '../../../components/team-finder/useTeamFinder';
import DiscoverTab from '../../../components/team-finder/DiscoverTab';
import MyFinderForm from '../../../components/team-finder/MyFinderForm';
import RequestsTab from '../../../components/team-finder/RequestsTab';
import SendRequestModal from '../../../components/team-finder/SendRequestModal';
import type { TabType } from '../../../components/team-finder/types';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'discover', label: 'Discover', icon: '🔍' },
  { id: 'my-finder', label: 'My Team Finder', icon: '📋' },
  { id: 'requests', label: 'Requests', icon: '📬' },
];

const badge = (n: number, active: boolean) =>
  n > 0 ? <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-[#e50914] text-white' : 'bg-[#262626] text-[#666]'}`}>{n}</span> : null;

export default function TeamFinderPage() {
  const tf = useTeamFinder();
  const [tab, setTab] = useState<TabType>('discover');
  const pending = tf.incomingRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-white font-bold text-lg flex items-center gap-2 mb-1"><span className="text-xl">🤝</span> Team Finder</h1>
          <p className="text-[#666] text-xs">Find the right people for your next project.</p>
        </div>
        <div className="flex px-4 gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all ${tab === t.id ? 'text-white bg-[#141414]' : 'text-[#666] hover:text-[#a0a0a0]'}`}>
              {t.icon} {t.label}
              {t.id === 'discover' && badge(tf.profiles.length, tab === t.id)}
              {t.id === 'requests' && badge(pending, tab === t.id)}
              {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#e50914] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {tab === 'discover' && <DiscoverTab profiles={tf.profiles} loading={tf.loading} error={tf.error}
          requestStatesMap={tf.requestStatesMap} currentUserId={tf.userId}
          onRetry={tf.loadProfiles} onSetModalUser={tf.setRequestModalUser} onSwitchTab={setTab} />}
        {tab === 'my-finder' && (tf.myProfileLoading ? (
          <div className="py-12 text-center"><div className="animate-spin h-8 w-8 border-2 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4" /><p className="text-[#666] text-sm">Loading your listing...</p></div>
        ) : tf.myProfileError ? (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm mb-2">{tf.myProfileError}</p>
            <button onClick={tf.loadMyProfile} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all">Retry</button>
          </div>
        ) : tf.userId ? <MyFinderForm userId={tf.userId} existingProfile={tf.myProfile} onSaved={() => { tf.loadMyProfile(); tf.loadProfiles(); }} /> : null)}
        {tab === 'requests' && <RequestsTab incomingRequests={tf.incomingRequests} outgoingRequests={tf.outgoingRequests}
          loading={tf.requestsLoading} error={tf.requestsError} loadingAction={tf.loadingAction}
          onAccept={tf.acceptRequest} onReject={tf.rejectRequest} onWithdraw={tf.withdrawRequest} onRetry={tf.loadRequests} />}
      </div>

      {tf.requestModalUser && <SendRequestModal targetUser={tf.requestModalUser} onClose={() => tf.setRequestModalUser(null)} onSent={tf.handleSendRequest} />}
    </div>
  );
}
