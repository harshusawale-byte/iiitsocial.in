'use client';

import { useStore } from '../../../../store/store';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '../../../../components/feed/PostCard';
import EmptyState from '../../../../components/ui/EmptyState';
import ClickableAvatar from '../../../../components/ui/ClickableAvatar';

type CommunityTab = 'posts' | 'discussions' | 'members';

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { state, toggleJoinCommunity, toggleFollow } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CommunityTab>('posts');
  const { id: communityId } = use(params);

  if (!state.currentUser) return null;

  const community = state.communities.find(c => c.id === communityId);
  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏫</div>
          <h2 className="text-white font-semibold mb-2">Community not found</h2>
          <p className="text-[#666] text-sm mb-4">This community may have been removed</p>
          <button onClick={() => router.push('/communities')} className="px-4 py-2 bg-[#e50914] text-white text-sm rounded-lg">
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  const isMember = community.members.includes(state.currentUser.id);
  const createdBy = state.users.find(u => u.id === community.createdBy);
  const memberUsers = state.users.filter(u => community.members.includes(u.id));
  const communityPosts = state.posts.filter(p => p.communityId === community.id);
  const communityDiscussions = state.discussions.filter(d => d.communityId === community.id);

  const tabs: { id: CommunityTab; label: string; count: number }[] = [
    { id: 'posts', label: 'Posts', count: communityPosts.length },
    { id: 'discussions', label: 'Discussions', count: communityDiscussions.length },
    { id: 'members', label: 'Members', count: memberUsers.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-32 md:h-44 bg-gradient-to-br from-[#e50914]/20 via-[#141414] to-[#0a0a0a] relative">
        {community.banner && (
          <img src={community.banner} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        {/* Back button */}
        <button
          onClick={() => router.push('/communities')}
          className="absolute top-4 left-4 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Community info */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#e50914]/10 to-[#1a1a1a] border-4 border-[#0a0a0a] flex items-center justify-center text-4xl md:text-5xl">
            {community.icon}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl md:text-2xl font-bold text-white truncate">{community.name}</h1>
              {community.isVerified && (
                <svg className="w-5 h-5 text-[#e50914] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-[#666] text-xs mt-0.5">{community.category} · {community.members.length} members</p>
          </div>
        </div>

        <p className="text-[#a0a0a0] text-sm mb-3">{community.description}</p>

        {/* Created by */}
        {createdBy && (
          <div className="flex items-center gap-2 mb-4 text-xs text-[#666]">
            <span>Created by</span>
            <ClickableAvatar src={createdBy.avatar} alt={createdBy.name} className="w-5 h-5 rounded-full" />
            <span className="text-white">{createdBy.name}</span>
          </div>
        )}

        {/* Join/Leave button */}
        <button
          onClick={() => toggleJoinCommunity(community.id)}
          className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition-all mb-4 ${
            isMember
              ? 'bg-[#141414] border border-[#333] text-[#666] hover:text-[#e50914] hover:border-[#e50914]'
              : 'bg-[#e50914] hover:bg-[#ff1a25] text-white'
          }`}
        >
          {isMember ? '✓ Joined' : 'Join Community'}
        </button>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a] gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-[#666] hover:text-[#a0a0a0]'
              }`}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#e50914] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {activeTab === 'posts' && (
          communityPosts.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No posts yet"
              description="Be the first to post in this community!"
            />
          ) : (
            communityPosts.map(post => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'discussions' && (
          communityDiscussions.length === 0 ? (
            <EmptyState
              icon="🗣️"
              title="No discussions yet"
              description="Start a discussion in this community!"
            />
          ) : (
            <div className="space-y-3 px-4 py-2">
              {communityDiscussions.map(disc => {
                const author = state.users.find(u => u.id === disc.authorId);
                const score = disc.upvotes.length - disc.downvotes.length;
                return (
                  <div key={disc.id} className="bg-[#141414] border border-[#262626] rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#e50914]/10 text-[#e50914] rounded font-medium uppercase">{disc.type.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1">{disc.title}</h3>
                    <p className="text-[#a0a0a0] text-xs line-clamp-2 mb-2">{disc.content.slice(0, 150)}</p>
                    <div className="flex items-center gap-3 text-[#444] text-xs">
                      {author && <span>{author.name}</span>}
                      <span>▲ {score}</span>
                      <span>💬 {disc.replies.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === 'members' && (
          <div className="px-4 py-3 space-y-2">
            {memberUsers.length === 0 ? (
              <EmptyState icon="👥" title="No members" description="No members have joined yet." />
            ) : (
              memberUsers.map(user => {
                const isFollowing = state.currentUser?.following.includes(user.id);
                return (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-[#141414] border border-[#262626] rounded-xl">
                    <ClickableAvatar src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white text-sm font-medium truncate">{user.name}</span>
                        {user.isVerified && (
                          <svg className="w-3.5 h-3.5 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0c.49.401 1.003.703 1.545.857a3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-[#666] text-xs">{user.branch} · {user.academicYear}</div>
                    </div>
                    {user.id !== state.currentUser?.id && (
                      <button
                        onClick={() => toggleFollow(user.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          isFollowing
                            ? 'bg-[#141414] border border-[#333] text-[#666]'
                            : 'bg-[#e50914] text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
