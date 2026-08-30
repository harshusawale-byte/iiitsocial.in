'use client';

import { useStore } from '../../../store/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '../../../components/ui/EmptyState';
import ClickableAvatar from '../../../components/ui/ClickableAvatar';

type FilterType = 'all' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Alumni' | 'Seniors';

export default function PeoplePage() {
  const { state, toggleFollow, toggleConnect } = useStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const otherUsers = state.users.filter(u => u.id !== state.currentUser?.id);
  const filteredUsers = otherUsers
    .filter(u => {
      if (filter === 'all') return true;
      if (filter === 'Seniors') return u.academicYear === '3rd Year' || u.academicYear === '4th Year' || u.academicYear === 'Alumni';
      return u.academicYear === filter;
    })
    .filter(u => {
      if (!search) return true;
      return u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.branch.toLowerCase().includes(search.toLowerCase()) ||
        u.interests.some(i => i.toLowerCase().includes(search.toLowerCase()));
    });

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' }, { id: '1st Year', label: '1st Year' }, { id: '2nd Year', label: '2nd Year' },
    { id: '3rd Year', label: '3rd Year' }, { id: '4th Year', label: '4th Year' }, { id: 'Alumni', label: 'Alumni' }, { id: 'Seniors', label: 'Seniors' },
  ];

  const statusColors: Record<string, string> = { NOVA: 'text-[#60a5fa]', CORE: 'text-[#a78bfa]', PRIME: 'text-[#f59e0b]', LEGACY: 'text-[#e50914]' };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3">
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, branch, or interests..."
            className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#e50914] focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === f.id ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30' : 'bg-[#141414] text-[#666] border border-[#262626] hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {otherUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No students to show yet"
          description="Invite your batchmates to join IIITSocial. When they register, they'll appear here."
        />
      ) : (
        <div className="px-4 py-3 space-y-2">
          {filteredUsers.map(user => {
            const isFollowing = state.currentUser?.following.includes(user.id);
            const isConnected = state.currentUser?.connections.includes(user.id);
            return (
              <div key={user.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <ClickableAvatar src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full bg-[#1a1a1a]" userId={user.id} showStoryRing />
                    {user.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => router.push(`/profile?userId=${user.id}`)} className="text-white font-semibold text-sm hover:underline text-left">{user.name}</button>
                      {user.isVerified && <svg className="w-3.5 h-3.5 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                      <span className={`text-[10px] font-bold ${statusColors[user.status] || 'text-[#666]'}`}>◆ {user.status}</span>
                    </div>
                    <div className="text-[#666] text-xs mt-0.5">{user.branch} · {user.academicYear} · Class of {user.graduationYear}</div>
                    {user.bio && <p className="text-[#a0a0a0] text-xs mt-1 line-clamp-1">{user.bio}</p>}
                    {user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="text-[10px] px-2 py-0.5 bg-white/5 text-[#666] rounded-full">{interest}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 ml-15 pl-0">
                  <button onClick={() => toggleFollow(user.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${isFollowing ? 'bg-[#141414] border border-[#333] text-[#666] hover:text-[#e50914] hover:border-[#e50914]' : 'bg-[#e50914] hover:bg-[#ff1a25] text-white'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button onClick={() => toggleConnect(user.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${isConnected ? 'bg-[#141414] border border-[#333] text-[#666]' : 'bg-[#141414] border border-[#333] text-[#a0a0a0] hover:border-white hover:text-white'}`}>
                    {isConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
