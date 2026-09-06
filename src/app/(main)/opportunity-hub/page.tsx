'use client';

import { useState, useMemo } from 'react';
import { useOpportunities } from '../../../components/opportunity-hub/useOpportunities';
import OpportunityCard from '../../../components/opportunity-hub/OpportunityCard';
import OpportunityDetailModal from '../../../components/opportunity-hub/OpportunityDetailModal';
import MyApplicationsTab from '../../../components/opportunity-hub/MyApplicationsTab';
import SkeletonGrid from '../../../components/opportunity-hub/SkeletonGrid';
import EmptyState from '../../../components/ui/EmptyState';
import type { Opportunity, OpportunityCategory } from '../../../types';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'internships', label: '💼 Internships' },
  { id: 'hackathons', label: '🏆 Hackathons' },
  { id: 'scholarships', label: '🎓 Scholarships' },
  { id: 'research', label: '🔬 Research' },
  { id: 'competitions', label: '🎯 Competitions' },
  { id: 'workshops', label: '📚 Workshops' },
  { id: 'other', label: '📌 Other' },
];

type TabType = 'discover' | 'my-applications';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'discover', label: 'Discover', icon: '🔍' },
  { id: 'my-applications', label: 'My Applications', icon: '📋' },
];

export default function OpportunityHubPage() {
  const oh = useOpportunities();
  const [tab, setTab] = useState<TabType>('discover');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [detailOpportunity, setDetailOpportunity] = useState<Opportunity | null>(null);

  const filteredOpportunities = useMemo(() => {
    return oh.opportunities.filter(o => {
      if (categoryFilter !== 'all' && o.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.organizer.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.required_skills.some(s => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [oh.opportunities, categoryFilter, search]);

  const appliedIds = useMemo(() => {
    return new Set(oh.myApplications.map(a => a.opportunity_id));
  }, [oh.myApplications]);

  const filterButtonClass = (active: boolean) =>
    active
      ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30'
      : 'bg-[#141414] text-[#666] border border-[#262626] hover:text-white';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a]">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-white font-bold text-lg flex items-center gap-2 mb-1"><span className="text-xl">🎯</span> Opportunity Hub</h1>
          <p className="text-[#666] text-xs">Discover internships, hackathons, scholarships & more.</p>
        </div>
        <div className="flex px-4 gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-all ${tab === t.id ? 'text-white bg-[#141414]' : 'text-[#666] hover:text-[#a0a0a0]'}`}>
              {t.icon} {t.label}
              {t.id === 'my-applications' && oh.myApplications.length > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-[#e50914] text-white' : 'bg-[#262626] text-[#666]'}`}>{oh.myApplications.length}</span>
              )}
              {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#e50914] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {tab === 'discover' && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities, skills, organizers..."
                className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
            </div>

            {/* Category filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 mb-3">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterButtonClass(categoryFilter === c.id)}`}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {oh.loading ? (
              <SkeletonGrid />
            ) : oh.error ? (
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
                <p className="text-red-400 text-sm mb-2">{oh.error}</p>
                <button onClick={oh.loadOpportunities} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all">Retry</button>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <EmptyState
                icon="🎯"
                title={oh.opportunities.length === 0 ? 'No opportunities yet' : 'No results found'}
                description={oh.opportunities.length === 0 ? 'Check back later for new opportunities!' : 'Try adjusting your filters or search terms.'}
              />
            ) : (
              <div className="space-y-3">
                {filteredOpportunities.map(o => (
                  <OpportunityCard
                    key={o.id}
                    opportunity={o}
                    isSaved={oh.savedIds.has(o.id)}
                    savingId={oh.savingId}
                    onToggleSave={oh.toggleSave}
                    onClick={() => setDetailOpportunity(o)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'my-applications' && (
          <MyApplicationsTab
            applications={oh.myApplications}
            loading={oh.appsLoading}
            onWithdraw={oh.withdrawApplication}
          />
        )}
      </div>

      {/* Detail modal */}
      {detailOpportunity && (
        <OpportunityDetailModal
          opportunity={detailOpportunity}
          isSaved={oh.savedIds.has(detailOpportunity.id)}
          savingId={oh.savingId}
          hasApplied={appliedIds.has(detailOpportunity.id)}
          onToggleSave={oh.toggleSave}
          onApply={oh.applyToOpportunity}
          onClose={() => setDetailOpportunity(null)}
        />
      )}
    </div>
  );
}
