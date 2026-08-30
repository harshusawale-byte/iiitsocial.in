'use client';

import { useStore } from '../../../store/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '../../../components/ui/EmptyState';
import CreateCommunityModal from '../../../components/modals/CreateCommunityModal';

export default function CommunitiesPage() {
  const { state, toggleJoinCommunity } = useStore();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const categories = ['all', 'Academic', 'Interest', 'Club', 'Fun'];

  const filteredCommunities = state.communities.filter(c => selectedCategory === 'all' || c.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-[#1a1a1a] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-white">Communities</h1>
          <button onClick={() => setShowCreate(true)} className="px-3 py-1.5 bg-[#e50914] hover:bg-[#ff1a25] text-white text-xs font-semibold rounded-lg transition-all">
            + Create
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/30' : 'bg-[#141414] text-[#666] border border-[#262626] hover:text-white'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredCommunities.length === 0 ? (
        <EmptyState
          icon="🏫"
          title="No communities yet"
          description="No communities have been created yet. Communities will appear as students create and join them."
        />
      ) : (
        <div className="px-4 py-3 space-y-3">
          {filteredCommunities.map(community => {
            const isMember = state.currentUser?.joinedCommunities.includes(community.id);
            return (
              <div key={community.id} className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden animate-fade-in cursor-pointer hover:border-[#444] transition-colors" onClick={() => router.push(`/communities/${community.id}`)}>
                <div className="h-20 bg-gradient-to-r from-[#e50914]/10 to-[#1a1a1a] flex items-center justify-center">
                  <span className="text-4xl">{community.icon}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-white font-semibold text-sm">{community.name}</h3>
                        {community.isVerified && <svg className="w-3.5 h-3.5 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                      </div>
                      <p className="text-[#666] text-xs mt-0.5">{community.description}</p>
                      <div className="text-[#444] text-xs mt-2">{community.members.length} members</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleJoinCommunity(community.id); }}
                    className={`mt-3 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${isMember ? 'bg-[#141414] border border-[#333] text-[#666] hover:text-[#e50914] hover:border-[#e50914]' : 'bg-[#e50914] hover:bg-[#ff1a25] text-white'}`}>
                    {isMember ? 'Joined' : 'Join Community'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Create Community Modal */}
      {showCreate && <CreateCommunityModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
