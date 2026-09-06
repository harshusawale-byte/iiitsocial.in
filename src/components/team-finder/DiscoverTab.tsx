'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ClickableAvatar from '../ui/ClickableAvatar';
import EmptyState from '../ui/EmptyState';
import VerifiedBadge from './VerifiedBadge';
import SkeletonGrid from './SkeletonGrid';
import type { TeamFinderProfileWithUser, TabType } from './types';
import type { RequestState } from './types';

const BRANCHES = ['all', 'CSE', 'ECE', 'IT', 'AI/ML', 'Data Science', 'Other'];
const YEARS = ['all', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];
const ROLES = ['all', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Project Manager', 'Data Scientist', 'DevOps Engineer', 'Mobile Developer'];

export default function DiscoverTab({
  profiles, loading, error, requestStatesMap, currentUserId,
  onRetry, onSetModalUser, onSwitchTab,
}: {
  profiles: TeamFinderProfileWithUser[];
  loading: boolean;
  error: string | null;
  requestStatesMap: Map<string, RequestState>;
  currentUserId: string | undefined;
  onRetry: () => void;
  onSetModalUser: (user: TeamFinderProfileWithUser) => void;
  onSwitchTab: (tab: TabType) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (branchFilter !== 'all' && p.user_branch !== branchFilter) return false;
      if (yearFilter !== 'all' && p.user_academic_year !== yearFilter) return false;
      if (roleFilter !== 'all' && !p.preferred_roles.includes(roleFilter)) return false;
      if (skillFilter && !p.required_skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase())) && !p.user_skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.user_name.toLowerCase().includes(q) ||
          (p.user_username && p.user_username.toLowerCase().includes(q)) ||
          (p.project_title && p.project_title.toLowerCase().includes(q)) ||
          (p.project_description && p.project_description.toLowerCase().includes(q)) ||
          p.required_skills.some(s => s.toLowerCase().includes(q)) ||
          p.user_skills.some(s => s.toLowerCase().includes(q)) ||
          p.user_interests.some(i => i.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [profiles, branchFilter, yearFilter, roleFilter, skillFilter, search]);

  const filterButtonClass = (active: boolean, variant?: 'purple') =>
    active
      ? variant === 'purple'
        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
        : 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30'
      : 'bg-[#141414] text-[#666] border border-[#262626] hover:text-white';

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students, skills, projects..."
          className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
      </div>

      {/* Branch filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {BRANCHES.map(b => (
          <button key={b} onClick={() => setBranchFilter(b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterButtonClass(branchFilter === b)}`}>
            {b === 'all' ? 'All Branches' : b}
          </button>
        ))}
      </div>

      {/* Year filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {YEARS.map(y => (
          <button key={y} onClick={() => setYearFilter(y)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterButtonClass(yearFilter === y)}`}>
            {y === 'all' ? 'All Years' : y}
          </button>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
        {ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterButtonClass(roleFilter === r, 'purple')}`}>
            {r === 'all' ? 'All Roles' : r}
          </button>
        ))}
      </div>

      {/* Skill filter */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
        <input value={skillFilter} onChange={e => setSkillFilter(e.target.value)} placeholder="Filter by skill..."
          className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm mb-2">{error}</p>
          <button onClick={onRetry} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all">Retry</button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={profiles.length === 0 ? 'No active listings yet' : 'No results found'}
          description={profiles.length === 0 ? 'Be the first to set up your Team Finder listing!' : 'Try adjusting your filters or search terms.'}
          action={profiles.length === 0 ? { label: 'Create My Listing', onClick: () => onSwitchTab('my-finder') } : undefined}
        />
      ) : (
        filteredProfiles.map(p => {
          const reqState = requestStatesMap.get(p.id);
          const isSelf = p.id === currentUserId;

          // Determine button state: priority to incoming, then outgoing
          let actionButton: React.ReactNode = null;
          if (!isSelf) {
            if (reqState) {
              if (reqState.status === 'pending') {
                actionButton = reqState.isOutgoing
                  ? <span className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">✉️ Request Sent</span>
                  : <span className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">📩 Request Received</span>;
              } else if (reqState.status === 'accepted') {
                actionButton = <span className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 border border-green-500/30">✅ Team Connected</span>;
              }
            }
            if (!actionButton) {
              actionButton = (
                <button onClick={() => onSetModalUser(p)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#e50914] text-white hover:bg-[#ff1a25] transition-all active:scale-[0.98] shadow-lg shadow-[#e50914]/15">
                  🤝 Send Request
                </button>
              );
            }
          }

          return (
            <div key={p.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <button onClick={() => router.push(`/profile?userId=${p.id}`)} className="flex-shrink-0">
                  <ClickableAvatar src={p.user_avatar} alt={p.user_name} className="w-12 h-12 rounded-full bg-[#1a1a1a]" userId={p.id} showStoryRing />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => router.push(`/profile?userId=${p.id}`)} className="text-white font-semibold text-sm hover:underline text-left">{p.user_name}</button>
                    {p.user_is_verified && <VerifiedBadge />}
                  </div>
                  <p className="text-[#666] text-xs mt-0.5">{p.user_branch} · {p.user_academic_year}{p.user_username ? ` · @${p.user_username}` : ''}</p>
                </div>
              </div>

              {p.project_title && (
                <div className="mt-3 p-3 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]">
                  <h4 className="text-white text-sm font-semibold">{p.project_title}</h4>
                  {p.project_description && <p className="text-[#a0a0a0] text-xs mt-1 line-clamp-2">{p.project_description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[#666] text-[10px]">
                    <span>👥 Max {p.max_team_size || 4} members</span>
                  </div>
                </div>
              )}

              {p.user_bio && !p.project_title && <p className="text-[#a0a0a0] text-xs mt-2 line-clamp-1">{p.user_bio}</p>}

              <div className="flex flex-wrap gap-1 mt-2.5">
                {p.required_skills.slice(0, 4).map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded-full font-medium">{skill}</span>
                ))}
                {p.user_skills.filter(s => !p.required_skills.includes(s)).slice(0, 2).map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 bg-white/5 text-[#666] rounded-full">{skill}</span>
                ))}
              </div>

              {p.preferred_roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.preferred_roles.slice(0, 3).map(role => (
                    <span key={role} className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full">{role}</span>
                  ))}
                </div>
              )}

              {!isSelf && <div className="mt-3">{actionButton}</div>}
            </div>
          );
        })
      )}
    </div>
  );
}
